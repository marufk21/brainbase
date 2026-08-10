# Brainbase design document

## Problem understanding

A small consulting team needs a shared memory for client work. The important requirement is not document search alone: a useful answer must expose how people, projects, decisions, source documents, topics, and discussion messages are connected. Brainbase therefore prioritises explicit links and inspectable evidence over a broad but opaque search experience.

## Architecture

The application is a Next.js App Router application. Interactive views are client components because they need form state and browser persistence. The root provider owns the current `KnowledgeCollections` state and persists it to `localStorage`; it is deliberately isolated so a future API/database implementation can replace it.

`lib/knowledge.ts` contains the typed data model, seed data, graph builder, answer logic, and relationship lookup helper. The graph builder creates one node per entity and labeled directed edges such as `works on`, `has decision`, `covers`, and `about`. Views rebuild their graph from the current collection, so a saved decision or document immediately appears in exploration and answer evidence.

## Data flow and intentional dual paths

The client data flow is `UI → hooks/store → API service (lib/api-client.ts) → API routes → server services (lib/entity-api.ts, lib/ask-engine.ts, lib/relationships.ts) → PostgreSQL`. Components never call `fetch` directly: `hooks/useAsk.ts` owns the `/api/ask` request with loading and error state, and `components/knowledge-store.tsx` hydrates collections through `fetchKnowledgeSnapshot()`.

Two deliberate fallbacks keep the demo runnable without any credentials:

- If `/api/knowledge` is unreachable (no `DATABASE_URL`), the store falls back to locally persisted collections (`localStorage`) seeded from the fictional sample data, so CRUD edits still survive reloads.
- If `/api/ask` is unreachable, the Ask view shows the answer from the deterministic local engine in `lib/knowledge.ts`, which is also the engine exercised by the automated tests. When the database is reachable, the DB-backed answer takes precedence and the UI says so when it is not.

Shared domain types live in `lib/types.ts`, which is client-safe by design (no `server-only` imports); `lib/knowledge.ts` re-exports them for the tests and views.

## Database decision: PostgreSQL with explicit edge tables

The production persistence design uses PostgreSQL, defined in [`db/schema.sql`](../db/schema.sql). PostgreSQL is the right first choice because Brainbase has a small, well-defined set of entities, needs reliable CRUD, constraints, migrations, and simple operational tooling. It also supports recursive CTEs when multi-hop relationship queries are needed. Neo4j would make sense later if arbitrary deep graph traversal became the dominant workload, but it adds a second data platform without improving the current assignment MVP enough to justify it.

The schema keeps graph semantics explicit through join tables: `project_clients`, `project_team`, `project_topics`, `decision_projects`, `decision_people`, `decision_topics`, and typed document-link tables. Typed document links are preferred over one polymorphic `entity_id` edge table because PostgreSQL can enforce foreign keys for every endpoint. Unique constraints encode important business rules such as one active client link per project, one project lead, and one decision owner. `db/seed.mjs` parses every JSON, Markdown, and Slack excerpt source under `data/`, creates deterministic UUIDs, and populates both records and edges.

## Data model and relationship approach

The main entity types are client, project, person, decision, topic, document, and message. IDs are normalized and each reference creates an edge. For example, a decision links to its project, author, participants, and topics. Documents link to their projects and topics. Slack excerpts link to their author and recognized project/topic references.

The answer layer selects a supported intent, then obtains the project, decision, document, people, topic, and message evidence from the current collections. It produces a visible path using the same relationship labels used in the graph. This keeps example answers deterministic and makes their supporting records inspectable.

## What works

- Knowledge browsing across all required core entity types.
- Direct relationship exploration with labels and click-through navigation.
- Relationship-aware answers for the three supplied example styles.
- Full CRUD for clients, people, projects, topics, decisions, and documents, with immediate graph updates and local persistence.
- Automated tests for graph validity, newly added decision links, and the three example answer flows.

## Trade-offs and incomplete work

- Persistence is local to one browser. A production system should use a database, authenticated API, migrations, and audit history.
- The answer interpreter supports high-value deterministic intents rather than unrestricted natural-language reasoning. An LLM can be added later, but it should retrieve graph-backed evidence and cite the links it used.
- Message-to-topic links use simple text recognition because the assignment data is intentionally small. A production ingestion pipeline would use structured metadata and human review.
- There is no real external integration. The assignment permits sample files and does not require every source to be integrated.

## Testing and validation

Run `npm run lint`, `npm run test`, and `npm run build`. Tests validate that every edge points to a real node, a new linked decision produces expected graph edges, and each example question returns its expected linked evidence/path. Manual QA should include creating a decision and document, following their links in Knowledge, and verifying the mobile layout.

## Future improvements

Move collections to SQLite or Postgres, add authentication and roles, ingest a single source such as Google Docs or Slack, add document parsing and citations, and use graph-grounded LLM answers with provenance and feedback evaluation.
