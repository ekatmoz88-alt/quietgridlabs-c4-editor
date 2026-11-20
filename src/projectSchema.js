export const PROJECT_FORMAT = 'quietgridlabs-c4-project';
export const PROJECT_SCHEMA_VERSION = 1;

const LEVELS = ['context', 'container', 'component', 'code'];

export function validateProject(input) {
  const errors = [];

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return {
      valid: false,
      errors: ['Project must be a JSON object.'],
    };
  }

  if (
    input.format !== undefined &&
    input.format !== PROJECT_FORMAT
  ) {
    errors.push('Unsupported project format.');
  }

  const version = input.schemaVersion ?? 1;

  if (
    !Number.isInteger(version) ||
    version < 1 ||
    version > PROJECT_SCHEMA_VERSION
  ) {
    errors.push(`Unsupported schema version: ${version}.`);
  }

  if (typeof input.name !== 'string' || !input.name.trim()) {
    errors.push('Project name must be a non-empty string.');
  }

  if (!input.model || typeof input.model !== 'object') {
    errors.push('Project model is missing.');
  } else {
    for (const level of LEVELS) {
      const diagram = input.model[level];

      if (!diagram || typeof diagram !== 'object') {
        errors.push(`Model level "${level}" is missing.`);
        continue;
      }

      if (!Array.isArray(diagram.nodes)) {
        errors.push(`"${level}".nodes must be an array.`);
      } else {
        diagram.nodes.forEach((node, index) => {
          if (!node || typeof node !== 'object') {
            errors.push(`${level}.nodes[${index}] must be an object.`);
            return;
          }

          if (typeof node.id !== 'string' || !node.id) {
            errors.push(`${level}.nodes[${index}].id is invalid.`);
          }

          if (
            !node.position ||
            !Number.isFinite(node.position.x) ||
            !Number.isFinite(node.position.y)
          ) {
            errors.push(`${level}.nodes[${index}].position is invalid.`);
          }

          if (
            !node.data ||
            typeof node.data !== 'object' ||
            Array.isArray(node.data)
          ) {
            errors.push(`${level}.nodes[${index}].data is invalid.`);
          } else if (typeof node.data.label !== 'string') {
            errors.push(
              `${level}.nodes[${index}].data.label must be a string.`,
            );
          }
        });
      }

      if (!Array.isArray(diagram.edges)) {
        errors.push(`"${level}".edges must be an array.`);
      } else {
        diagram.edges.forEach((edge, index) => {
          if (
            !edge ||
            typeof edge.id !== 'string' ||
            typeof edge.source !== 'string' ||
            typeof edge.target !== 'string'
          ) {
            errors.push(`${level}.edges[${index}] is invalid.`);
          }
        });
      }
    }
  }

  if (
    input.documentationFiles !== undefined &&
    (
      !input.documentationFiles ||
      typeof input.documentationFiles !== 'object' ||
      Array.isArray(input.documentationFiles)
    )
  ) {
    errors.push('documentationFiles must be an object.');
  } else {
    for (const [path, content] of Object.entries(
      input.documentationFiles ?? {},
    )) {
      const segments = path.split('/');

      const isSafePath =
        path.startsWith('docs/') &&
        !path.includes('\\') &&
        !path.includes('\0') &&
        segments.every(
          (segment) =>
            segment &&
            segment !== '.' &&
            segment !== '..',
        ) &&
        !segments.some((segment) =>
          ['project.json', 'README.md'].includes(segment),
        );

      if (!isSafePath) {
        errors.push(
          `Documentation path "${path}" is not allowed. Files must be inside docs/.`,
        );
      }

      if (typeof content !== 'string') {
        errors.push(`Documentation file "${path}" must contain text.`);
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    project: {
      format: PROJECT_FORMAT,
      schemaVersion: PROJECT_SCHEMA_VERSION,
      name: input.name,
      model: input.model,
      documentationFiles: input.documentationFiles ?? {},
    },
  };
}
