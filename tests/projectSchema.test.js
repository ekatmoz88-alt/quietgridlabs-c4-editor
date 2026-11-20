import test from 'node:test';
import assert from 'node:assert/strict';
import { PROJECT_FORMAT, PROJECT_SCHEMA_VERSION, validateProject } from '../src/projectSchema.js';

const base = {
  format: PROJECT_FORMAT,
  schemaVersion: 2,
  name: 'Architecture test',
  model: {
    context: { nodes: [], edges: [] },
    container: { nodes: [], edges: [] },
    component: { nodes: [], edges: [] },
    code: { nodes: [], edges: [] },
  },
  documentationFiles: {},
  diagrams: { sequences: [], erModels: [] },
};

test('schema v1 projects migrate to v2 with empty diagram collections', () => {
  const legacy = { ...base, schemaVersion: 1 };
  delete legacy.diagrams;
  const result = validateProject(legacy);
  assert.equal(result.valid, true);
  assert.equal(result.project.schemaVersion, PROJECT_SCHEMA_VERSION);
  assert.deepEqual(result.project.diagrams, { sequences: [], erModels: [] });
});

test('schema preserves PlantUML sequence and ER metadata', () => {
  const project = structuredClone(base);
  project.diagrams.sequences.push({ id: 'seq-1', title: 'Login', source: '@startuml\nA -> B\n@enduml', linkedElementIds: [] });
  project.diagrams.erModels.push({
    id: 'erd-1', title: 'Accounts', linkedElementIds: [],
    entities: [
      { id: 'account', name: 'account', columns: [{ id: 'account-id', name: 'id', type: 'uuid', primaryKey: true, foreignKey: false, nullable: false }] },
      { id: 'payment', name: 'payment', columns: [{ id: 'payment-account', name: 'account_id', type: 'uuid', primaryKey: false, foreignKey: true, nullable: false }] },
    ],
    relationships: [{ id: 'rel-1', from: 'account', to: 'payment', cardinality: 'one-to-many', label: 'owns' }],
  });
  const result = validateProject(project);
  assert.equal(result.valid, true, result.errors.join('; '));
  assert.deepEqual(result.project.diagrams, project.diagrams);
});

test('schema rejects ER relationships that reference missing entities', () => {
  const project = structuredClone(base);
  project.diagrams.erModels.push({
    id: 'erd-1', title: 'Broken', entities: [],
    relationships: [{ id: 'rel-1', from: 'missing', to: 'missing', cardinality: 'one-to-many', label: 'bad' }],
  });
  const result = validateProject(project);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /references a missing entity/i);
});

test('schema rejects malformed PlantUML artifact metadata', () => {
  const project = structuredClone(base);
  project.diagrams.sequences.push({ id: 'seq-1', title: 'Broken' });
  assert.equal(validateProject(project).valid, false);
});

test('schema rejects C4 edges with dangling endpoints and duplicate ids', () => {
  const project = structuredClone(base);
  project.model.context.nodes.push({ id: 'system', position: { x: 0, y: 0 }, data: { label: 'System' } });
  project.model.context.edges.push(
    { id: 'edge-1', source: 'system', target: 'missing' },
    { id: 'edge-1', source: 'system', target: 'system' },
  );
  const result = validateProject(project);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /target references a missing node/i);
  assert.match(result.errors.join(' '), /id must be unique/i);
});

test('schema validates parent references against the immediately preceding C4 level', () => {
  const project = structuredClone(base);
  project.model.context.nodes.push({ id: 'system', position: { x: 0, y: 0 }, data: { label: 'System' } });
  project.model.container.nodes.push({ id: 'api', parentId: 'missing-parent', position: { x: 0, y: 0 }, data: { label: 'API' } });
  const result = validateProject(project);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /parentId must reference an existing context node/i);
});

test('schema rejects duplicate ER relationship ids', () => {
  const project = structuredClone(base);
  project.diagrams.erModels.push({
    id: 'erd-1', title: 'Accounts',
    entities: [{ id: 'a', name: 'A', columns: [] }, { id: 'b', name: 'B', columns: [] }],
    relationships: [
      { id: 'rel-1', from: 'a', to: 'b', cardinality: 'one-to-many' },
      { id: 'rel-1', from: 'b', to: 'a', cardinality: 'many-to-one' },
    ],
  });
  const result = validateProject(project);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /relationships\[1\]\.id must be unique/i);
});

test('schema rejects linked diagram references to missing C4 elements', () => {
  const project = structuredClone(base);
  project.diagrams.sequences.push({
    id: 'seq-1', title: 'Broken link', source: '@startuml\\n@enduml',
    linkedElementIds: ['not-a-model-node'],
  });
  const result = validateProject(project);
  assert.equal(result.valid, false);
  assert.match(result.errors.join(' '), /linkedElementIds\[0\] references a missing model element/i);
});
