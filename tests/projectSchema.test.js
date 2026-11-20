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
