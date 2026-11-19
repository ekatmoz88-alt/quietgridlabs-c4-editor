
import { useCallback, useEffect, useMemo, useState } from 'react';
import { flushSync } from 'react-dom';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  addEdge,
} from '@xyflow/react';

import '@xyflow/react/dist/style.css';
import './styles/app.css';

// Локальная обработка изменений React Flow.
// Не зависит от отсутствующих экспортов applyNodeChanges/applyEdgeChanges.
function updateNodes(changes, nodes) {
  let result = [...nodes];

  for (const change of changes) {
    switch (change.type) {
      case 'position':
        result = result.map((node) =>
          node.id === change.id
            ? {
                ...node,
                position: change.position ?? node.position,
                dragging: change.dragging,
              }
            : node,
        );
        break;

      case 'select':
        result = result.map((node) =>
          node.id === change.id
            ? { ...node, selected: change.selected }
            : node,
        );
        break;

      case 'dimensions':
        result = result.map((node) => {
          if (node.id !== change.id) return node;

          const updated = {
            ...node,
            measured: change.dimensions ?? node.measured,
          };

          if (change.setAttributes) {
            updated.width = change.dimensions.width;
            updated.height = change.dimensions.height;
          }

          return updated;
        });
        break;

      case 'remove':
        result = result.filter((node) => node.id !== change.id);
        break;

      case 'add':
        result.splice(change.index ?? result.length, 0, change.item);
        break;

      case 'replace':
        result = result.map((node) =>
          node.id === change.id ? change.item : node,
        );
        break;

      default:
        break;
    }
  }

  return result;
}

function updateEdges(changes, edges) {
  let result = [...edges];

  for (const change of changes) {
    switch (change.type) {
      case 'select':
        result = result.map((edge) =>
          edge.id === change.id
            ? { ...edge, selected: change.selected }
            : edge,
        );
        break;

      case 'remove':
        result = result.filter((edge) => edge.id !== change.id);
        break;

      case 'add':
        result.splice(change.index ?? result.length, 0, change.item);
        break;

      case 'replace':
        result = result.map((edge) =>
          edge.id === change.id ? change.item : edge,
        );
        break;

      default:
        break;
    }
  }

  return result;
}

const levels = [
  { id: 'context', label: 'System Context', number: '01' },
  { id: 'container', label: 'Container', number: '02' },
  { id: 'component', label: 'Component', number: '03' },
  { id: 'code', label: 'Code', number: '04' },
];

const initialModel = {
  context: {
    nodes: [
      {
        id: 'user',
        position: { x: 40, y: 170 },
        data: {
          label: 'Customer',
          description: 'A banking customer using the online banking system.',
          kind: 'Person',
        },
      },
      {
        id: 'bank',
        position: { x: 350, y: 170 },
        data: {
          label: 'Internet Banking System',
          description: 'Allows customers to view accounts and make payments.',
          kind: 'Software System',
          childLevel: 'container',
        },
      },
      {
        id: 'email',
        position: { x: 700, y: 50 },
        data: {
          label: 'E-mail System',
          description: 'Sends account notifications and statements.',
          kind: 'External System',
        },
      },
      {
        id: 'core',
        position: { x: 700, y: 300 },
        data: {
          label: 'Mainframe Banking System',
          description: 'Stores account and transaction data.',
          kind: 'External System',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'user', target: 'bank', label: 'Uses', animated: true },
      { id: 'e2', source: 'bank', target: 'email', label: 'Sends e-mail using' },
      { id: 'e3', source: 'bank', target: 'core', label: 'Reads from and writes to' },
    ],
  },

  container: {
    nodes: [
      {
        id: 'browser',
        parentId: 'bank',
        position: { x: 30, y: 160 },
        data: {
          label: 'Web Application',
          description: 'Browser-based user interface.',
          kind: 'Container · React',
        },
      },
      {
        id: 'api',
        parentId: 'bank',
        position: { x: 340, y: 160 },
        data: {
          label: 'API Application',
          description: 'Provides banking operations through REST API.',
          kind: 'Container · Node.js',
          childLevel: 'component',
        },
      },
      {
        id: 'db',
        parentId: 'bank',
        position: { x: 680, y: 40 },
        data: {
          label: 'Database',
          description: 'Stores customer, account and transaction records.',
          kind: 'Container · PostgreSQL',
        },
      },
      {
        id: 'auth',
        parentId: 'bank',
        position: { x: 680, y: 300 },
        data: {
          label: 'Identity Provider',
          description: 'Authenticates customers and issues tokens.',
          kind: 'External Container',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'browser', target: 'api', label: 'HTTPS / JSON' },
      { id: 'e2', source: 'api', target: 'db', label: 'SQL' },
      { id: 'e3', source: 'api', target: 'auth', label: 'OAuth 2.0 / OIDC' },
    ],
  },

  component: {
    nodes: [
      {
        id: 'spa',
        parentId: 'api',
        position: { x: 30, y: 160 },
        data: {
          label: 'SPA',
          description: 'Single-page application and client-side routing.',
          kind: 'Component',
        },
      },
      {
        id: 'gateway',
        parentId: 'api',
        position: { x: 340, y: 160 },
        data: {
          label: 'API Gateway',
          description: 'Routes requests and validates access tokens.',
          kind: 'Component',
        },
      },
      {
        id: 'accounts',
        parentId: 'api',
        position: { x: 680, y: 40 },
        data: {
          label: 'Accounts Service',
          description: 'Provides account balances and account details.',
          kind: 'Component',
        },
      },
      {
        id: 'payments',
        parentId: 'api',
        position: { x: 680, y: 300 },
        data: {
          label: 'Payments Service',
          description: 'Creates and tracks payment transactions.',
          kind: 'Component',
          childLevel: 'code',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'spa', target: 'gateway', label: 'REST / JSON' },
      { id: 'e2', source: 'gateway', target: 'accounts', label: 'Account requests' },
      { id: 'e3', source: 'gateway', target: 'payments', label: 'Payment requests' },
    ],
  },

  code: {
    nodes: [
      {
        id: 'controller',
        parentId: 'payments',
        position: { x: 40, y: 160 },
        data: {
          label: 'PaymentController',
          description: 'Receives and validates HTTP payment requests.',
          kind: 'Class · TypeScript',
        },
      },
      {
        id: 'service',
        parentId: 'payments',
        position: { x: 370, y: 160 },
        data: {
          label: 'PaymentService',
          description: 'Coordinates payment processing.',
          kind: 'Class · TypeScript',
        },
      },
      {
        id: 'repository',
        parentId: 'payments',
        position: { x: 700, y: 160 },
        data: {
          label: 'PaymentRepository',
          description: 'Persists payment data.',
          kind: 'Interface · TypeScript',
        },
      },
    ],
    edges: [
      { id: 'e1', source: 'controller', target: 'service', label: 'Calls' },
      { id: 'e2', source: 'service', target: 'repository', label: 'Uses' },
    ],
  },
};

const defaultParents = {
  context: null,
  container: 'bank',
  component: 'api',
  code: 'payments',
};

const STORAGE_KEY = 'quietgridlabs-project-v1';

function readSavedProject() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const saved = JSON.parse(raw);

    if (!saved || typeof saved !== 'object' || !saved.model) {
      return null;
    }

    for (const level of ['context', 'container', 'component', 'code']) {
      const diagram = saved.model[level];

      if (
        !diagram ||
        !Array.isArray(diagram.nodes) ||
        !Array.isArray(diagram.edges)
      ) {
        return null;
      }
    }

    return saved;
  } catch (error) {
    console.error('Could not load saved project:', error);
    return null;
  }
}

function App() {
  const [savedProject] = useState(() => readSavedProject());
  const [model, setModel] = useState(
    () => savedProject?.model ?? initialModel,
  );
  const [level, setLevel] = useState('context');
  const [parentId, setParentId] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedId, setSelectedId] = useState('user');
  const [projectName, setProjectName] = useState(
    () => savedProject?.name || 'Internet Banking System',
  );
  const [description, setDescription] = useState('');
  useEffect(() => {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          name: projectName,
          model,
        }),
      );
    } catch (error) {
      console.error('Could not save project:', error);
    }
  }, [model, projectName]);


  const currentDiagram = model[level];

  const nodes = useMemo(
    () => currentDiagram.nodes.filter(
      (node) => (node.parentId ?? null) === parentId,
    ),
    [currentDiagram, parentId],
  );

  const visibleIds = useMemo(
    () => new Set(nodes.map((node) => node.id)),
    [nodes],
  );

  const edges = useMemo(
    () => currentDiagram.edges.filter(
      (edge) => visibleIds.has(edge.source) && visibleIds.has(edge.target),
    ),
    [currentDiagram, visibleIds],
  );

  const selected = nodes.find((node) => node.id === selectedId) ?? null;

  const currentParent = Object.values(model)
    .flatMap((diagram) => diagram.nodes)
    .find((node) => node.id === parentId);

  const updateCurrentDiagram = useCallback((updater) => {
    setModel((current) => ({
      ...current,
      [level]: updater(current[level]),
    }));
  }, [level]);

  const onNodesChange = useCallback((changes) => {
    updateCurrentDiagram((diagram) => {
      const updatedNodes = updateNodes(changes, diagram.nodes);
      const removedIds = new Set(
        diagram.nodes
          .filter((node) => !updatedNodes.some((item) => item.id === node.id))
          .map((node) => node.id),
      );

      return {
        ...diagram,
        nodes: updatedNodes,
        edges: diagram.edges.filter(
          (edge) => !removedIds.has(edge.source) && !removedIds.has(edge.target),
        ),
      };
    });
  }, [updateCurrentDiagram]);

  const onEdgesChange = useCallback((changes) => {
    updateCurrentDiagram((diagram) => ({
      ...diagram,
      edges: updateEdges(changes, diagram.edges),
    }));
  }, [updateCurrentDiagram]);

  const onConnect = useCallback((connection) => {
    updateCurrentDiagram((diagram) => ({
      ...diagram,
      edges: addEdge(connection, diagram.edges),
    }));
  }, [updateCurrentDiagram]);

  const selectNode = (_, node) => {
  console.log('NODE CLICKED:', node.id, node.data.label);
  setSelectedId(node.id);
  setDescription(node.data.description || '');
};

  const openChild = (_, node) => {
    const childLevel = node.data.childLevel;

    if (!childLevel) return;

    setHistory((current) => [...current, { level, parentId }]);
    setLevel(childLevel);
    setParentId(node.id);
    setSelectedId(null);
    setDescription('');
  };

  const goBack = () => {
    if (!history.length) return;

    const previous = history[history.length - 1];

    setLevel(previous.level);
    setParentId(previous.parentId);
    setHistory((current) => current.slice(0, -1));
    setSelectedId(null);
    setDescription('');
  };

  const navigateToLevel = (nextLevel) => {
    setLevel(nextLevel);
    setParentId(defaultParents[nextLevel]);
    setHistory([]);
    setSelectedId(null);
    setDescription('');
  };

  const addNode = () => {
    const id = `element-${Date.now()}`;

    const node = {
      id,
      parentId,
      position: {
        x: 180 + Math.random() * 250,
        y: 100 + Math.random() * 250,
      },
      data: {
        label: 'New element',
        description: 'Add an element description.',
        kind: levels.find((item) => item.id === level)?.label || 'Element',
      },
    };

    updateCurrentDiagram((diagram) => ({
      ...diagram,
      nodes: [...diagram.nodes, node],
    }));

    setSelectedId(id);
    setDescription(node.data.description);
  };

  const saveDescription = () => {
    if (!selected) return;

    const selectedNodeId = selected.id;
    const descriptionToSave = description;

    flushSync(() => {
      setModel((current) => ({
        ...current,
        [level]: {
          ...current[level],
          nodes: current[level].nodes.map((node) =>
            node.id === selectedNodeId
              ? {
                  ...node,
                  data: {
                    ...node.data,
                    description: descriptionToSave,
                  },
                }
              : node,
          ),
        },
      }));
    });
  };

const exportProject = () => {
  const project = {
    name: projectName,
    model,
  };

  const blob = new Blob(
    [JSON.stringify(project, null, 2)],
    { type: 'application/json' },
  );

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = 'quietgridlabs-project.json';

  document.body.appendChild(link);
  link.click();
  link.remove();

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);
};
  const currentLevelLabel =
    levels.find((item) => item.id === level)?.label;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">Q</div>
          <div>
            <strong>QuietGridLabs</strong>
            <span>Architecture workspace</span>
          </div>
        </div>

        <div className="project-title">
          <span className="status-dot" />
          <input
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
          <span className="local-tag">LOCAL PROJECT</span>
        </div>

        <div className="top-actions">
          <button className="secondary-button" onClick={exportProject}>
            Export JSON
          </button>
          <button className="primary-button" onClick={addNode}>
            ＋ Add element
          </button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-heading">PROJECT</div>
          <div className="project-nav active">
            ▦ <span>Architecture model</span>
          </div>

          <div className="sidebar-heading levels-heading">C4 MODEL</div>

          {levels.map((item) => (
            <button
              key={item.id}
              className={`level-item ${level === item.id ? 'selected' : ''}`}
              onClick={() => navigateToLevel(item.id)}
            >
              <span className="level-number">{item.number}</span>
              <span>{item.label}</span>
              {level === item.id && <span className="level-indicator" />}
            </button>
          ))}

          <div className="sidebar-bottom">
            <div className="sidebar-heading">WORKSPACE</div>
            <div className="workspace-note">
              <span className="status-dot" /> Local mode
            </div>
            <p>Changes are held in this browser session. Cloud sync is not configured.</p>
          </div>
        </aside>

        <section className="canvas-area">
          <div className="canvas-toolbar">
            <div>
              <div className="breadcrumb">
                Architecture model <span>/</span> {currentLevelLabel}
                {currentParent && (
                  <>
                    <span>/</span> {currentParent.data.label}
                  </>
                )}
              </div>

              <h1>{currentLevelLabel}</h1>
              <p>
                {projectName} · C4 architecture
                {currentParent && ` · Inside ${currentParent.data.label}`}
              </p>
            </div>

            <div className="canvas-tools">
              {history.length > 0 && (
                <button className="tool-button" onClick={goBack}>
                  ← Back
                </button>
              )}

              <button
                className="tool-button"
                onClick={() => selected && openChild(null, selected)}
                disabled={!selected?.data.childLevel}
              >
                Open child level ↗
              </button>
            </div>
          </div>

          <div className="canvas">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onNodeClick={selectNode}
              onNodeDoubleClick={openChild}
              fitView
              fitViewOptions={{ padding: 0.25 }}
              minZoom={0.2}
              maxZoom={1.8}
            >
              <Background color="#dce3e9" gap={22} size={1} />
              <Controls />
              <MiniMap nodeStrokeWidth={3} zoomable pannable />
            </ReactFlow>
          </div>

          <div className="canvas-footer">
            <span>{nodes.length} elements</span>
            <span>{edges.length} relationships</span>
            <span>Double-click an element to open its child level</span>
          </div>
        </section>

        <aside className="inspector">
          <div className="inspector-header">
            <div>
              <div className="sidebar-heading">INSPECTOR</div>
              <h2>Element details</h2>
            </div>
            <span className="inspector-icon">☷</span>
          </div>

          {selected ? (
            <>
              <div className="field-label">ELEMENT NAME</div>
              <div className="element-name">{selected.data.label}</div>

              <div className="field-label">TYPE</div>
              <div className="type-pill">
                {selected.data.kind || 'Element'}
              </div>

              <div className="field-label description-label">
                DESCRIPTION
              </div>

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />

              <button
                className="primary-button save-button"
                onClick={saveDescription}
              >
                Save description
              </button>

              <div className="inspector-divider" />

              <div className="field-label">DOCUMENTATION</div>

              <div className="documentation-card">
                <div className="doc-icon">M↓</div>
                <div>
                  <strong>Markdown notes</strong>
                  <span>Rich documentation editor — next step</span>
                </div>
              </div>

              <div className="documentation-card muted-card">
                <div className="doc-icon">⌁</div>
                <div>
                  <strong>Related components</strong>
                  <span>Relationship explorer — planned</span>
                </div>
              </div>
            </>
          ) : (
            <p className="empty-inspector">
              Select an element on the canvas.
            </p>
          )}

          <div className="inspector-bottom">
            QUIETGRIDLABS <span>·</span> C4 WORKSPACE
          </div>
        </aside>
      </div>
    </main>
  );
}

export default App;
