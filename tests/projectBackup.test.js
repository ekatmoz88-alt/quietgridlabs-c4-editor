import test from 'node:test';
import assert from 'node:assert/strict';
import JSZip from 'jszip';
import {
  createProjectBackup,
  readProjectBackup,
} from '../src/projectBackup.js';
import {
  PROJECT_FORMAT,
  PROJECT_SCHEMA_VERSION,
  validateProject,
} from '../src/projectSchema.js';

function makeProject() {
  return {
    format: PROJECT_FORMAT,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    name: 'Backup test project',
    model: {
      context: { nodes: [], edges: [] },
      container: { nodes: [], edges: [] },
      component: { nodes: [], edges: [] },
      code: { nodes: [], edges: [] },
    },
    documentationFiles: {
      'docs/01-context/system.md': '# System\n\nBackup fixture.\n',
    },
    diagrams: {\n      sequences: [{ id: 'sequence-1', title: 'Login flow', source: '@startuml\\nUser -> API\\n@enduml', linkedElementIds: [] }],\n      erModels: [{ id: 'erd-1', title: 'Accounts', linkedElementIds: [], entities: [{ id: 'account', name: 'account', columns: [{ id: 'id', name: 'id', type: 'uuid', primaryKey: true, foreignKey: false, nullable: false }] }], relationships: [] }],\n    },
  };
}

async function mutateArchive(archive, callback) {
  const zip = await JSZip.loadAsync(archive);
  await callback(zip);
  return zip.generateAsync({ type: 'uint8array' });
}

test('ZIP backup round-trip preserves model and Markdown documentation', async () => {
  const project = makeProject();
  const archive = await createProjectBackup(project);
  const restored = await readProjectBackup(archive);

  assert.deepEqual(restored, project);
});

test('ZIP backup rejects unsafe manifest paths', async () => {
  const archive = await createProjectBackup(makeProject());
  const corrupted = await mutateArchive(archive, async (zip) => {
    const path = 'quietgridlabs-project/manifest.json';
    const manifest = JSON.parse(await zip.file(path).async('string'));
    manifest.files.push('docs/../outside.md');
    zip.file(path, JSON.stringify(manifest));
  });

  await assert.rejects(
    readProjectBackup(corrupted),
    /invalid file path/i,
  );
});

test('ZIP backup rejects documentation content that differs from project.json', async () => {
  const archive = await createProjectBackup(makeProject());
  const corrupted = await mutateArchive(archive, (zip) => {
    zip.file(
      'quietgridlabs-project/docs/01-context/system.md',
      '# Tampered documentation\n',
    );
  });

  await assert.rejects(
    readProjectBackup(corrupted),
    /documentation content mismatch/i,
  );
});

test('ZIP backup rejects files that are not listed in the manifest', async () => {
  const archive = await createProjectBackup(makeProject());
  const corrupted = await mutateArchive(archive, (zip) => {
    zip.file('quietgridlabs-project/docs/unlisted.md', 'not in manifest');
  });

  await assert.rejects(
    readProjectBackup(corrupted),
    /contents do not match the manifest/i,
  );
});

test('ZIP backup rejects entries above the uncompressed file-size limit', async () => {
  const archive = await createProjectBackup(makeProject());
  const oversized = await mutateArchive(archive, (zip) => {
    zip.file(
      'quietgridlabs-project/docs/01-context/system.md',
      'x'.repeat(10 * 1024 * 1024 + 1),
    );
  });

  await assert.rejects(
    readProjectBackup(oversized),
    /10 MB limit/i,
  );
});

test('project validation rejects node IDs that can escape documentation folders', () => {
  const project = makeProject();
  project.model.context.nodes.push({
    id: '../outside',
    position: { x: 0, y: 0 },
    data: { label: 'Unsafe node' },
  });

  const result = validateProject(project);

  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /unsafe for documentation paths/i);
});

test('project validation rejects duplicate node IDs within one C4 level', () => {
  const project = makeProject();
  const node = {
    id: 'system',
    position: { x: 0, y: 0 },
    data: { label: 'System' },
  };
  project.model.context.nodes.push(node, { ...node });

  const result = validateProject(project);

  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /unique within the level/i);
});

test('ZIP backup export rejects an invalid project before creating an archive', async () => {
  const project = makeProject();
  project.name = '   ';

  await assert.rejects(
    createProjectBackup(project),
    /project name must be a non-empty string/i,
  );
});
