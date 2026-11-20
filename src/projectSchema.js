export const PROJECT_FORMAT = 'quietgridlabs-c4-project';
export const PROJECT_SCHEMA_VERSION = 2;
const LEVELS = ['context', 'container', 'component', 'code'];
const CARDINALITIES = ['one-to-one', 'one-to-many', 'many-to-many', 'many-to-one'];
const emptyDiagrams = () => ({ sequences: [], erModels: [] });
export function validateProject(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { valid: false, errors: ['Project must be a JSON object.'] };
  if (input.format !== undefined && input.format !== PROJECT_FORMAT) errors.push('Unsupported project format.');
  const version = input.schemaVersion ?? 1;
  if (!Number.isInteger(version) || version < 1 || version > PROJECT_SCHEMA_VERSION) errors.push('Unsupported project schema version: ' + version + '.');
  if (typeof input.name !== 'string' || !input.name.trim()) errors.push('Project name must be a non-empty string.');
  if (!input.model || typeof input.model !== 'object') errors.push('Project model is missing.');
  else for (const level of LEVELS) {
    const diagram = input.model[level];
    if (!diagram || typeof diagram !== 'object') { errors.push('Model level ' + level + ' is missing.'); continue; }
    if (!Array.isArray(diagram.nodes)) errors.push(level + '.nodes must be an array.');
    else { const ids = new Set(); diagram.nodes.forEach((node, i) => {
      if (!node || typeof node !== 'object' || Array.isArray(node)) { errors.push(level + '.nodes[' + i + '] must be an object.'); return; }
      if (typeof node.id !== 'string' || !node.id || /[\\/\0]/.test(node.id) || node.id === '.' || node.id === '..') errors.push(level + '.nodes[' + i + '].id is invalid or unsafe for documentation paths.');
      else if (ids.has(node.id)) errors.push(level + '.nodes[' + i + '].id must be unique within the level.'); else ids.add(node.id);
      if (!node.position || !Number.isFinite(node.position.x) || !Number.isFinite(node.position.y)) errors.push(level + '.nodes[' + i + '].position is invalid.');
      if (!node.data || typeof node.data !== 'object' || Array.isArray(node.data)) errors.push(level + '.nodes[' + i + '].data is invalid.'); else if (typeof node.data.label !== 'string') errors.push(level + '.nodes[' + i + '].data.label must be a string.');
    }); }
    if (!Array.isArray(diagram.edges)) errors.push(level + '.edges must be an array.'); else diagram.edges.forEach((edge, i) => { if (!edge || typeof edge.id !== 'string' || typeof edge.source !== 'string' || typeof edge.target !== 'string') errors.push(level + '.edges[' + i + '] is invalid.'); });
  }
  const diagrams = input.diagrams ?? emptyDiagrams();
  if (!diagrams || typeof diagrams !== 'object' || Array.isArray(diagrams)) errors.push('diagrams must be an object.');
  else {
    for (const key of ['sequences', 'erModels']) if (diagrams[key] !== undefined && !Array.isArray(diagrams[key])) errors.push('diagrams.' + key + ' must be an array.');
    const sequenceIds = new Set();
    for (const [i, item] of (Array.isArray(diagrams.sequences) ? diagrams.sequences : []).entries()) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || sequenceIds.has(item.id) || typeof item.title !== 'string' || typeof item.source !== 'string') errors.push('diagrams.sequences[' + i + '] is invalid or has a duplicate id.'); else sequenceIds.add(item.id);
      if (item?.linkedElementIds !== undefined && (!Array.isArray(item.linkedElementIds) || item.linkedElementIds.some((id) => typeof id !== 'string'))) errors.push('diagrams.sequences[' + i + '].linkedElementIds is invalid.');
    }
    const modelIds = new Set();
    for (const [i, item] of (Array.isArray(diagrams.erModels) ? diagrams.erModels : []).entries()) {
      if (!item || typeof item !== 'object' || typeof item.id !== 'string' || !item.id || modelIds.has(item.id) || typeof item.title !== 'string' || !Array.isArray(item.entities) || !Array.isArray(item.relationships)) { errors.push('diagrams.erModels[' + i + '] is invalid or has a duplicate id.'); continue; }
      modelIds.add(item.id); const entityIds = new Set();
      for (const [j, entity] of item.entities.entries()) {
        if (!entity || typeof entity.id !== 'string' || !entity.id || entityIds.has(entity.id) || typeof entity.name !== 'string' || !Array.isArray(entity.columns)) { errors.push('diagrams.erModels[' + i + '].entities[' + j + '] is invalid.'); continue; }
        entityIds.add(entity.id); const columnIds = new Set();
        for (const [k, column] of entity.columns.entries()) { if (!column || typeof column.id !== 'string' || !column.id || columnIds.has(column.id) || typeof column.name !== 'string' || typeof column.type !== 'string' || typeof column.primaryKey !== 'boolean' || typeof column.nullable !== 'boolean' || (column.foreignKey !== undefined && typeof column.foreignKey !== 'boolean')) errors.push('diagrams.erModels[' + i + '].entities[' + j + '].columns[' + k + '] is invalid.'); else columnIds.add(column.id); }
      }
      for (const [j, rel] of item.relationships.entries()) if (!rel || typeof rel.id !== 'string' || !entityIds.has(rel.from) || !entityIds.has(rel.to) || !CARDINALITIES.includes(rel.cardinality)) errors.push('diagrams.erModels[' + i + '].relationships[' + j + '] is invalid or references a missing entity.');
      if (item.linkedElementIds !== undefined && (!Array.isArray(item.linkedElementIds) || item.linkedElementIds.some((id) => typeof id !== 'string'))) errors.push('diagrams.erModels[' + i + '].linkedElementIds is invalid.');
    }
  }
  const docs = input.documentationFiles ?? {};
  if (!docs || typeof docs !== 'object' || Array.isArray(docs)) errors.push('documentationFiles must be an object.');
  else for (const [path, content] of Object.entries(docs)) {
    const parts = path.split('/');
    const safe = path.startsWith('docs/') && !path.includes('\\') && !path.includes('\0') && parts.every((part) => part && part !== '.' && part !== '..') && !parts.some((part) => ['project.json', 'README.md'].includes(part));
    if (!safe) errors.push('Documentation path ' + path + ' is not allowed. Files must be inside docs/.');
    if (typeof content !== 'string') errors.push('Documentation file ' + path + ' must contain text.');
  }
  if (errors.length) return { valid: false, errors };
  return { valid: true, errors: [], project: { format: PROJECT_FORMAT, schemaVersion: PROJECT_SCHEMA_VERSION, name: input.name, model: input.model, documentationFiles: docs, diagrams: { sequences: diagrams.sequences ?? [], erModels: diagrams.erModels ?? [] } } };
}