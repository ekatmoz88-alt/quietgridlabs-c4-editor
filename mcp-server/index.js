import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { validateProject } from '../src/projectSchema.js';
const baseUrl = process.env.SUPABASE_URL?.replace(/\/$/, '');
const apiKey = process.env.SUPABASE_ANON_KEY;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;
if (!baseUrl || !apiKey || !accessToken) throw new Error('Set SUPABASE_URL, SUPABASE_ANON_KEY and SUPABASE_ACCESS_TOKEN. Use a user access token, never a service-role key.');
async function api(path, options = {}) {
 const response = await fetch(baseUrl + '/rest/v1/' + path, { ...options, headers: { apikey: apiKey, Authorization: 'Bearer ' + accessToken, 'Content-Type': 'application/json', ...options.headers } });
 const body = response.status === 204 ? null : await response.json().catch(() => null);
 if (!response.ok) throw new Error(body?.message || body?.details || 'Supabase returned HTTP ' + response.status);
 return body;
}
async function getProject(id) { const rows = await api('cloud_projects?id=eq.' + encodeURIComponent(id) + '&select=id,name,project_data,revision'); if (!rows?.length) throw new Error('Project not found or access denied by row-level security.'); return rows[0]; }
const result = (data) => ({ content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] });
const server = new McpServer({ name: 'quietgridlabs-c4', version: '0.1.0' });
server.tool('list_projects', 'List architecture projects available to the authenticated Supabase user.', {}, async () => result(await api('cloud_projects?select=id,name,revision,updated_at&order=updated_at.desc')));
server.tool('read_project', 'Read a project model, C4 elements, diagrams and documentation. Access is restricted by Supabase RLS.', { project_id: z.string().uuid() }, async ({ project_id }) => { const row = await getProject(project_id); return result({ id: row.id, name: row.name, revision: row.revision, project: row.project_data }); });
server.tool('search_project', 'Search C4 elements, PlantUML sequence sources, ER entities and Markdown documentation.', { project_id: z.string().uuid(), query: z.string().min(1).max(200) }, async ({ project_id, query }) => {
 const row = await getProject(project_id); const needle = query.toLocaleLowerCase(); const matches = [];
 for (const [level, diagram] of Object.entries(row.project_data.model ?? {})) for (const node of diagram.nodes ?? []) if (JSON.stringify(node).toLocaleLowerCase().includes(needle)) matches.push({ type: 'element', level, id: node.id, label: node.data?.label, element: node });
 for (const [path, content] of Object.entries(row.project_data.documentationFiles ?? {})) if (content.toLocaleLowerCase().includes(needle)) matches.push({ type: 'documentation', path, excerpt: content.slice(0, 1200) });
 for (const item of row.project_data.diagrams?.sequences ?? []) if ((item.title + ' ' + item.source).toLocaleLowerCase().includes(needle)) matches.push({ type: 'sequence', id: item.id, title: item.title, source: item.source });
 for (const model of row.project_data.diagrams?.erModels ?? []) if (JSON.stringify(model).toLocaleLowerCase().includes(needle)) matches.push({ type: 'er-model', id: model.id, title: model.title, model });
 return result({ project_id, query, matches });
});
server.tool('apply_project_update', 'Replace a project snapshot after validating the expected revision. Requires confirmed=true; Supabase RLS limits access to the owner.', {
 project_id: z.string().uuid(), expected_revision: z.number().int().positive(), confirmed: z.literal(true), project: z.record(z.any()),
}, async ({ project_id, expected_revision, project }) => {
 const validation = validateProject(project); if (!validation.valid) throw new Error('Project validation failed: ' + validation.errors.join('; '));
 const rows = await api('cloud_projects?id=eq.' + encodeURIComponent(project_id) + '&revision=eq.' + expected_revision + '&select=id,revision', { method: 'PATCH', headers: { Prefer: 'return=representation' }, body: JSON.stringify({ name: validation.project.name, project_data: validation.project, revision: expected_revision + 1, updated_at: new Date().toISOString() }) });
 if (!rows?.length) throw new Error('Revision conflict or permission denied. Read the latest project before retrying.');
 return result({ updated: true, id: rows[0].id, revision: rows[0].revision });
});
await server.connect(new StdioServerTransport());