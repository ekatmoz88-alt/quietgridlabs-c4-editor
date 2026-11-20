import JSZip from 'jszip';
import {
  PROJECT_FORMAT,
  PROJECT_SCHEMA_VERSION,
  validateProject,
} from './projectSchema.js';

const ROOT_DIRECTORY = 'quietgridlabs-project/';
const MANIFEST_PATH = `${ROOT_DIRECTORY}manifest.json`;
const PROJECT_PATH = `${ROOT_DIRECTORY}project.json`;
const MAX_ARCHIVE_SIZE = 25 * 1024 * 1024;
const MAX_ARCHIVE_UNCOMPRESSED_SIZE = 50 * 1024 * 1024;
const MAX_ENTRY_UNCOMPRESSED_SIZE = 10 * 1024 * 1024;
const MAX_ARCHIVE_ENTRIES = 1000;

function getValidatedProject(input) {
  const validation = validateProject(input);

  if (!validation.valid) {
    throw new Error(validation.errors.join('\n'));
  }

  return validation.project;
}

export async function createProjectBackup(input) {
  const project = getValidatedProject(input);
  const zip = new JSZip();
  const root = zip.folder('quietgridlabs-project');

  const manifest = {
    format: 'quietgridlabs-c4-backup',
    backupVersion: 1,
    projectFormat: PROJECT_FORMAT,
    schemaVersion: PROJECT_SCHEMA_VERSION,
    exportedAt: new Date().toISOString(),
    rootDirectory: 'quietgridlabs-project',
    files: [
      'project.json',
      'README.md',
      'docs/README.md',
      ...Object.keys(project.documentationFiles),
    ],
  };

  root.file('project.json', JSON.stringify(project, null, 2));
  root.file(
    'README.md',
    `# ${project.name}\n\nQuietGridLabs C4 architecture project.\n\nSee the \`docs/\` directory for element documentation.\n`,
  );
  root.file(
    'docs/README.md',
    '# Documentation tree\n\n' +
      'The archive contains Markdown documentation for C4 model elements.\n',
  );
  root.file('manifest.json', JSON.stringify(manifest, null, 2));

  for (const [path, content] of Object.entries(project.documentationFiles)) {
    root.file(path, content);
  }

  return zip.generateAsync({ type: 'uint8array' });
}

export async function readProjectBackup(input) {
  if (input?.size > MAX_ARCHIVE_SIZE) {
    throw new Error('ZIP backup exceeds the 25 MB upload limit.');
  }

  const zip = await JSZip.loadAsync(input);
  const entries = Object.entries(zip.files);

  if (entries.length > MAX_ARCHIVE_ENTRIES) {
    throw new Error('ZIP backup contains too many entries.');
  }

  let totalUncompressedSize = 0;

  for (const [path, entry] of entries) {
    if (entry.dir) continue;

    const uncompressedSize = entry._data?.uncompressedSize;

    if (!Number.isSafeInteger(uncompressedSize) || uncompressedSize < 0) {
      throw new Error(`Could not verify the uncompressed size of ${path}.`);
    }

    if (uncompressedSize > MAX_ENTRY_UNCOMPRESSED_SIZE) {
      throw new Error(`ZIP entry exceeds the 10 MB limit: ${path}`);
    }

    totalUncompressedSize += uncompressedSize;

    if (totalUncompressedSize > MAX_ARCHIVE_UNCOMPRESSED_SIZE) {
      throw new Error('ZIP backup exceeds the 50 MB uncompressed size limit.');
    }
  }

  const archiveFiles = entries
    .filter(([, entry]) => !entry.dir)
    .map(([path]) => path);

  if (
    archiveFiles.some((path) => !path.startsWith(ROOT_DIRECTORY)) ||
    !zip.files[ROOT_DIRECTORY] ||
    !zip.files[MANIFEST_PATH] ||
    !zip.files[PROJECT_PATH]
  ) {
    throw new Error('Invalid archive structure.');
  }

  const manifest = JSON.parse(await zip.files[MANIFEST_PATH].async('string'));

  if (
    !manifest ||
    manifest.format !== 'quietgridlabs-c4-backup' ||
    manifest.backupVersion !== 1 ||
    manifest.projectFormat !== PROJECT_FORMAT ||
    !Number.isInteger(manifest.schemaVersion) ||\n    manifest.schemaVersion < 1 ||\n    manifest.schemaVersion > PROJECT_SCHEMA_VERSION ||
    manifest.rootDirectory !== 'quietgridlabs-project' ||
    !Array.isArray(manifest.files)
  ) {
    throw new Error('Unsupported or invalid backup manifest.');
  }

  const safePaths = new Set();

  for (const path of manifest.files) {
    if (
      typeof path !== 'string' ||
      !path ||
      path.startsWith('/') ||
      path.includes('\\') ||
      path.includes('\0') ||
      path.split('/').some(
        (segment) =>
          !segment ||
          segment === '.' ||
          segment === '..',
      ) ||
      safePaths.has(path)
    ) {
      throw new Error('Manifest contains an invalid file path.');
    }

    const isAllowedPath =
      path === 'project.json' ||
      path === 'README.md' ||
      path === 'docs/README.md' ||
      path.startsWith('docs/');

    if (!isAllowedPath) {
      throw new Error(`Unsupported file in backup: ${path}`);
    }

    safePaths.add(path);
  }

  const expectedFiles = manifest.files
    .map((path) => `${ROOT_DIRECTORY}${path}`)
    .sort();
  const actualFiles = archiveFiles
    .filter((path) => path !== MANIFEST_PATH)
    .sort();

  if (JSON.stringify(expectedFiles) !== JSON.stringify(actualFiles)) {
    throw new Error('Archive contents do not match the manifest.');
  }

  for (const requiredPath of [
    'project.json',
    'README.md',
    'docs/README.md',
  ]) {
    if (!safePaths.has(requiredPath)) {
      throw new Error(`Required file is missing: ${requiredPath}`);
    }
  }

  const rawProject = JSON.parse(await zip.files[PROJECT_PATH].async('string'));
  const imported = getValidatedProject(rawProject);

  if (
    (rawProject.schemaVersion ?? 1) !== manifest.schemaVersion ||
    imported.format !== manifest.projectFormat
  ) {
    throw new Error('Project metadata does not match the manifest.');
  }

  const archivedDocumentation = {};

  for (const path of manifest.files) {
    if (!path.startsWith('docs/') || path === 'docs/README.md') {
      continue;
    }

    archivedDocumentation[path] = await zip.files[
      `${ROOT_DIRECTORY}${path}`
    ].async('string');
  }

  const archivedPaths = Object.keys(archivedDocumentation).sort();
  const projectPaths = Object.keys(imported.documentationFiles).sort();

  if (JSON.stringify(archivedPaths) !== JSON.stringify(projectPaths)) {
    throw new Error('Documentation file list does not match project.json.');
  }

  for (const [path, content] of Object.entries(imported.documentationFiles)) {
    if (archivedDocumentation[path] !== content) {
      throw new Error(`Documentation content mismatch: ${path}`);
    }
  }

  return imported;
}
