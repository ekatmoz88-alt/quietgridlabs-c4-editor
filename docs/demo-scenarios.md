# Demo scenarios — no registration required

The public editor is local-first. The sample project is loaded by the application on a fresh browser profile; no account is needed for the scenarios below.

**Demo model:** Internet Banking System

- **System Context:** Customer, Internet Banking System, E-mail System and Mainframe Banking System.
- **Container:** Web Application, API Application, Database and Identity Provider.
- **Component:** SPA, API Gateway, Accounts Service and Payments Service.
- **Code:** PaymentController, PaymentService and PaymentRepository.

The model is illustrative and is intended to demonstrate editor workflows, not to describe a real banking platform.

## Scenario 1 — Explore all four C4 levels

1. Open the [public editor](https://ekatmoz88-alt.github.io/quietgridlabs-c4-editor/).
2. Inspect the System Context view and select the Internet Banking System.
3. Open its child Container view.
4. Select API Application and continue to Component.
5. Select Payments Service and open the Code view.
6. Use the level navigation/history controls to return to the higher-level views.

**What to verify:** model elements, relationships, descriptions and parent-child navigation are visible at each level.

## Scenario 2 — Read and edit element documentation

1. Select Customer or API Application.
2. Open the element documentation panel.
3. Edit the Markdown text and preview the result.
4. Switch to another element and confirm its document is separate.
5. Export the project as JSON or ZIP to preserve the changes.

**What to verify:** documentation is attached to individual C4 elements and remains part of the project data.

## Scenario 3 — Create a UML sequence diagram

1. Open **Sequence / ER**.
2. In **UML Sequence**, create a new sequence.
3. Add a title and edit the PlantUML source.
4. Associate the sequence with relevant C4 elements.
5. Select **Render preview**.

**What to verify:** the source remains editable and stored in the project; rendering is an explicit request to the public Kroki service. If Kroki is unavailable, the source remains available.

## Scenario 4 — Create a structured ER model

1. Open **Sequence / ER** and choose **ER models**.
2. Create a new ER model.
3. Add tables and columns; set data types, primary keys, foreign keys and nullability.
4. Add a relationship and choose its cardinality.
5. Associate the ER model with a C4 element and select **Render ER diagram**.

**What to verify:** table definitions and relationships are stored as structured project data, not only as a rendered image.

## Scenario 5 — Export and restore a project

1. Make a small change to a model element or its documentation.
2. Export the project as JSON.
3. Export a ZIP backup.
4. Import the JSON or ZIP and confirm the replacement when prompted.

**What to verify:** the restored project retains its C4 model, documentation and diagram artifacts. Import validation runs before the active project is replaced.

## Reset the demo

The editor persists changes in LocalStorage for the current browser origin. To restore the original sample, use a separate browser profile or clear LocalStorage for the GitHub Pages site, then reload the application.

## Scope of this demo

These scenarios exercise local browser functionality. They do not require registration. Supabase sign-in/cloud save and MCP client integration are optional workflows and require their respective backend/client configuration; they are not part of the no-registration demo.
