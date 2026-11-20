import { useMemo, useState } from 'react';

const emptySequence = () => ({
  id: crypto.randomUUID(),
  title: 'New sequence',
  description: '',
  linkedElementIds: [],
  source: '@startuml\ntitle New sequence\nactor User\nparticipant API\ndatabase DB\nUser -> API: Request\nAPI -> DB: Query\nDB --> API: Result\nAPI --> User: Response\n@enduml',
});
const emptyEntity = () => ({
  id: crypto.randomUUID(),
  name: 'NewEntity',
  columns: [{ id: crypto.randomUUID(), name: 'id', type: 'uuid', primaryKey: true, nullable: false }],
});
const emptyErModel = () => ({
  id: crypto.randomUUID(),
  title: 'New ER model',
  description: '',
  linkedElementIds: [],
  entities: [emptyEntity()],
  relationships: [],
});

export default function DiagramStudio({ diagrams, onChange, elements }) {
  const [tab, setTab] = useState('sequence');
  const [selectedSequenceId, setSelectedSequenceId] = useState(diagrams.sequences[0]?.id ?? null);
  const [selectedErId, setSelectedErId] = useState(diagrams.erModels[0]?.id ?? null);
  const [preview, setPreview] = useState({ status: 'idle', url: '', error: '' });
  const sequences = diagrams.sequences ?? [];
  const erModels = diagrams.erModels ?? [];
  const sequence = sequences.find((item) => item.id === selectedSequenceId) ?? sequences[0] ?? null;
  const erModel = erModels.find((item) => item.id === selectedErId) ?? erModels[0] ?? null;
  const elementOptions = useMemo(() => elements.map((item) => ({ id: item.id, label: item.data.label })), [elements]);

  const updateSequence = (patch) => {
    if (!sequence) return;
    onChange({ ...diagrams, sequences: sequences.map((item) => item.id === sequence.id ? { ...item, ...patch } : item) });
    setPreview({ status: 'idle', url: '', error: '' });
  };
  const updateErModel = (patch) => {
    if (!erModel) return;
    onChange({ ...diagrams, erModels: erModels.map((item) => item.id === erModel.id ? { ...item, ...patch } : item) });
  };
  const addSequence = () => {
    const item = emptySequence();
    onChange({ ...diagrams, sequences: [...sequences, item] });
    setSelectedSequenceId(item.id);
    setTab('sequence');
  };
  const addErModel = () => {
    const item = emptyErModel();
    onChange({ ...diagrams, erModels: [...erModels, item] });
    setSelectedErId(item.id);
    setTab('er');
  };
  const renderSequence = async () => {
    if (!sequence) return;
    if (!sequence.source.trim().startsWith('@startuml') || !sequence.source.includes('@enduml')) {
      setPreview({ status: 'error', url: '', error: 'PlantUML source must start with @startuml and contain @enduml.' });
      return;
    }
    setPreview({ status: 'loading', url: '', error: '' });
    try {
      const response = await fetch('https://kroki.io/plantuml/svg', {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain; charset=utf-8', Accept: 'image/svg+xml' },
        body: sequence.source,
      });
      if (!response.ok) throw new Error(`Renderer returned HTTP ${response.status}.`);
      const svg = await response.text();
      if (!svg.includes('<svg')) throw new Error('Renderer returned an invalid SVG document.');
      const url = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }));
      setPreview({ status: 'ready', url, error: '' });
    } catch (error) {
      setPreview({ status: 'error', url: '', error: error.message || 'Could not render PlantUML.' });
    }
  };
  const updateEntity = (entityId, patch) => updateErModel({
    entities: erModel.entities.map((entity) => entity.id === entityId ? { ...entity, ...patch } : entity),
  });
  const updateColumn = (entityId, columnId, patch) => updateErModel({
    entities: erModel.entities.map((entity) => entity.id !== entityId ? entity : {
      ...entity,
      columns: entity.columns.map((column) => column.id === columnId ? { ...column, ...patch } : column),
    }),
  });
  const addColumn = (entityId) => updateErModel({
    entities: erModel.entities.map((entity) => entity.id === entityId ? {
      ...entity,
      columns: [...entity.columns, { id: crypto.randomUUID(), name: 'new_column', type: 'text', primaryKey: false, nullable: true }],
    } : entity),
  });
  const addRelationship = () => {
    if (erModel.entities.length < 2) return;
    updateErModel({
      relationships: [...erModel.relationships, {
        id: crypto.randomUUID(),
        from: erModel.entities[0].id,
        to: erModel.entities[1].id,
        cardinality: 'one-to-many',
        label: 'references',
      }],
    });
  };

  return (
    <section className="diagram-studio">
      <div className="diagram-studio-header">
        <div>
          <div className="field-label">ARCHITECTURE ARTIFACTS</div>
          <h2>Diagram studio</h2>
          <p>Diagrams are stored in the project and included in JSON and ZIP backups.</p>
        </div>
        <div className="diagram-tabs">
          <button className={tab === 'sequence' ? 'active' : ''} onClick={() => setTab('sequence')}>UML Sequence</button>
          <button className={tab === 'er' ? 'active' : ''} onClick={() => setTab('er')}>ER models</button>
        </div>
      </div>

      {tab === 'sequence' ? (
        <div className="diagram-layout">
          <aside className="diagram-list">
            <button className="primary-button" onClick={addSequence}>＋ New sequence</button>
            {sequences.map((item) => (
              <button key={item.id} className={item.id === sequence?.id ? 'selected' : ''} onClick={() => { setSelectedSequenceId(item.id); setPreview({ status: 'idle', url: '', error: '' }); }}>
                <strong>{item.title}</strong><span>PlantUML source</span>
              </button>
            ))}
            {!sequences.length && <p className="diagram-empty">No sequence diagrams yet.</p>}
          </aside>
          {sequence ? (
            <div className="diagram-editor">
              <label>Diagram title<input value={sequence.title} onChange={(event) => updateSequence({ title: event.target.value })} /></label>
              <label>Linked C4 elements<select multiple value={sequence.linkedElementIds} onChange={(event) => updateSequence({ linkedElementIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>{elementOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              <label>PlantUML source<textarea className="diagram-source" spellCheck="false" value={sequence.source} onChange={(event) => updateSequence({ source: event.target.value })} /></label>
              <div className="diagram-actions">
                <button className="primary-button" onClick={renderSequence} disabled={preview.status === 'loading'}>{preview.status === 'loading' ? 'Rendering…' : 'Render preview'}</button>
                <button className="secondary-button" onClick={() => onChange({ ...diagrams, sequences: sequences.filter((item) => item.id !== sequence.id) })}>Delete diagram</button>
              </div>
              <p className="diagram-note">Preview sends the source to the public Kroki renderer. The original PlantUML source remains in this project and works offline.</p>
              {preview.error && <p className="diagram-error" role="alert">{preview.error}</p>}
              {preview.url && <div className="diagram-preview"><img src={preview.url} alt={sequence.title + ' rendered sequence diagram'} /></div>}
            </div>
          ) : <div className="diagram-editor diagram-empty">Create a sequence diagram to start.</div>}
        </div>
      ) : (
        <div className="diagram-layout">
          <aside className="diagram-list">
            <button className="primary-button" onClick={addErModel}>＋ New ER model</button>
            {erModels.map((item) => (
              <button key={item.id} className={item.id === erModel?.id ? 'selected' : ''} onClick={() => setSelectedErId(item.id)}>
                <strong>{item.title}</strong><span>{item.entities.length} tables</span>
              </button>
            ))}
            {!erModels.length && <p className="diagram-empty">No ER models yet.</p>}
          </aside>
          {erModel ? (
            <div className="diagram-editor">
              <label>Model title<input value={erModel.title} onChange={(event) => updateErModel({ title: event.target.value })} /></label>
              <label>Linked C4 elements<select multiple value={erModel.linkedElementIds} onChange={(event) => updateErModel({ linkedElementIds: Array.from(event.target.selectedOptions, (option) => option.value) })}>{elementOptions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select></label>
              <div className="er-canvas">
                {erModel.entities.map((entity) => (
                  <article className="er-entity" key={entity.id}>
                    <input className="er-entity-name" aria-label="Table name" value={entity.name} onChange={(event) => updateEntity(entity.id, { name: event.target.value })} />
                    {entity.columns.map((column) => (
                      <div className="er-column" key={column.id}>
                        <input aria-label="Column name" value={column.name} onChange={(event) => updateColumn(entity.id, column.id, { name: event.target.value })} />
                        <input aria-label="Column type" value={column.type} onChange={(event) => updateColumn(entity.id, column.id, { type: event.target.value })} />
                        <label title="Primary key"><input type="checkbox" checked={column.primaryKey} onChange={(event) => updateColumn(entity.id, column.id, { primaryKey: event.target.checked })} /> PK</label>
                        <label title="Nullable"><input type="checkbox" checked={column.nullable} onChange={(event) => updateColumn(entity.id, column.id, { nullable: event.target.checked })} /> NULL</label>
                        <button className="icon-button" title="Remove column" onClick={() => updateEntity(entity.id, { columns: entity.columns.filter((item) => item.id !== column.id) })}>×</button>
                      </div>
                    ))}
                    <button className="text-button" onClick={() => addColumn(entity.id)}>＋ Add column</button>
                    <button className="text-button danger" onClick={() => updateErModel({
                      entities: erModel.entities.filter((item) => item.id !== entity.id),
                      relationships: erModel.relationships.filter((item) => item.from !== entity.id && item.to !== entity.id),
                    })}>Remove table</button>
                  </article>
                ))}
                <button className="add-entity" onClick={() => updateErModel({ entities: [...erModel.entities, emptyEntity()] })}>＋ Add table</button>
              </div>
              <div className="er-relations">
                <div className="er-relations-heading"><strong>Relationships</strong><button className="secondary-button" onClick={addRelationship} disabled={erModel.entities.length < 2}>＋ Add relationship</button></div>
                {erModel.relationships.map((relation) => (
                  <div className="er-relation" key={relation.id}>
                    <select value={relation.from} onChange={(event) => updateErModel({ relationships: erModel.relationships.map((item) => item.id === relation.id ? { ...item, from: event.target.value } : item) })}>{erModel.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select>
                    <span>→</span>
                    <select value={relation.to} onChange={(event) => updateErModel({ relationships: erModel.relationships.map((item) => item.id === relation.id ? { ...item, to: event.target.value } : item) })}>{erModel.entities.map((entity) => <option key={entity.id} value={entity.id}>{entity.name}</option>)}</select>
                    <select value={relation.cardinality} onChange={(event) => updateErModel({ relationships: erModel.relationships.map((item) => item.id === relation.id ? { ...item, cardinality: event.target.value } : item) })}>
                      <option value="one-to-one">1 — 1</option><option value="one-to-many">1 — N</option><option value="many-to-many">N — N</option><option value="many-to-one">N — 1</option>
                    </select>
                    <input aria-label="Relationship label" value={relation.label} onChange={(event) => updateErModel({ relationships: erModel.relationships.map((item) => item.id === relation.id ? { ...item, label: event.target.value } : item) })} />
                    <button className="icon-button" onClick={() => updateErModel({ relationships: erModel.relationships.filter((item) => item.id !== relation.id) })}>×</button>
                  </div>
                ))}
                {!erModel.relationships.length && <p className="diagram-empty">Add relationships to describe foreign-key and cardinality rules.</p>}
              </div>
              <div className="diagram-actions"><button className="secondary-button" onClick={() => onChange({ ...diagrams, erModels: erModels.filter((item) => item.id !== erModel.id) })}>Delete ER model</button></div>
            </div>
          ) : <div className="diagram-editor diagram-empty">Create an ER model to start.</div>}
        </div>
      )}
    </section>
  );
}
