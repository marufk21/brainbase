# Brainbase design document

This document explains how Brainbase works, why it was designed this way, and what it does not do yet. For setup steps, see the [README](../README.md).

## 1. Problem understanding

A small consulting team (8–15 people) keeps its knowledge in Notion, Slack, Google Docs, emails, and people's heads. The core pain is not finding a single document — it is losing the **connections** between people, projects, decisions, and topics.

So the key requirement is: **answers must show how things are connected, with inspectable evidence.** Brainbase therefore prioritises explicit links over broad but opaque keyword search.

## 2. Architecture overview

Brainbase is a Next.js App Router application. Interactive views are client components because they need forms and browser persistence.

The layers are strictly separated, and data flows one way:

```
UI components → hooks → API service (lib/api-client.ts) → API routes → server services → PostgreSQL
```

Rules this design follows:

- **Components never call `fetch` directly.** All HTTP lives in [lib/api-client.ts](../lib/api-client.ts).
- **Hooks own request state.** `hooks/use-ask.ts` handles the `/api/ask` request with loading and error state.
- **Types are shared and client-safe.** All domain types live in [lib/types.ts](../lib/types.ts) with no `server-only` imports, so client, server, and tests use one model.
- **The persistence source is swappable.** The knowledge store is isolated so a database can replace browser storage without touching the UI.

## 3. Data model

Seven entity types, defined in [lib/types.ts](../lib/types.ts):

| Entity   | Represents                             | Key links                             |
| -------- | -------------------------------------- | ------------------------------------- |
| client   | A client organisation                  | —                                     |
| person   | A team member                          | skills                                |
| project  | Client work over time                  | client, lead + team, topics           |
| decision | A recorded decision with context       | project, owner + participants, topics |
| topic    | A recurring concept                    | —                                     |
| document | A note, summary, or excerpt            | projects, topics                      |
| message  | A Slack-style message kept as evidence | author, mentioned projects/topics     |

### Relationships are explicit edges

Every reference from one record to another becomes a labeled, directed edge. The graph builder in [lib/knowledge.ts](../lib/knowledge.ts) creates one node per entity and edges such as:

- person `works on` project, and `leads` it when they are the lead
- client `owns project` project
- project `uses topic` topic
- project `has decision` decision; the decision is `made by` its owner and people `participated` in it
- decision `about` topic
- document `mentions` project and `covers` topic
- person `wrote` message; a message `mentions` projects and `signals` topics

Views rebuild the graph from the current collections, so a saved decision or document appears in exploration and answer evidence immediately.

## 4. The answer engine

Answering a question is a three-step, deterministic process:

1. **Pick an intent** — the question is classified into a supported intent (team + decisions of a project, lessons transferred between projects, everything around a decision, …).
2. **Walk the graph** — the engine gathers the project, decision, document, people, topic, and message records connected to the subject.
3. **Explain itself** — the answer returns an `answer`, an `evidence` list of supporting records, and a `path` using the same labels as the graph (e.g. Lexora → has decision → Prefer structured linking).

This keeps answers **deterministic and inspectable**: you can always click through to the records that produced the answer. There are two engines with identical behaviour:

- **Local engine** in [lib/knowledge.ts](../lib/knowledge.ts) — runs in the browser, used by tests and as the fallback.
- **DB engine** in [lib/ask-engine.ts](../lib/ask-engine.ts) — runs server-side against PostgreSQL via `POST /api/ask`.

## 5. Dual persistence by design

The demo must run with zero credentials, but the design should show a real production path. So there are two deliberate fallbacks:

| If…                                                 | Then…                                                                                                           |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `/api/knowledge` is unreachable (no `DATABASE_URL`) | The store falls back to `localStorage` seeded with the fictional sample data; CRUD edits still survive reloads. |
| `/api/ask` is unreachable                           | The Ask view uses the deterministic local engine, and the UI says so.                                           |

When `DATABASE_URL` is set, the DB-backed path takes precedence for both reads and writes.

### Why PostgreSQL, and why explicit edge tables

PostgreSQL fits because Brainbase has a small, well-defined set of entities and needs reliable CRUD, constraints, migrations, and simple tooling. It also supports recursive CTEs if multi-hop queries are needed later. Neo4j was rejected for now: it would add a second data platform without improving the MVP; it becomes worth it only if arbitrary deep graph traversal becomes the dominant workload.

The schema in [db/schema.sql](../db/schema.sql) keeps graph semantics in typed join tables: `project_clients`, `project_team`, `project_topics`, `decision_projects`, `decision_people`, `decision_topics`, and typed document/message link tables. Two conscious choices:

- **Typed link tables instead of one polymorphic `entity_id` edge table** — PostgreSQL can then enforce a foreign key on every endpoint, so an edge can never point at a missing record.
- **Unique constraints encode business rules** — one active client link per project, one project lead (`project_team_one_lead`), one decision owner (`decision_people_one_owner`).

[db/seed.mjs](../db/seed.mjs) parses every JSON, Markdown, and Slack source under `data/`, creates deterministic UUIDs, and populates records and edges. [db/apply.mjs](../db/apply.mjs) applies schema + seed to an empty database.

## 6. Authentication

Authentication is **frontend-only and intentionally not production-grade** (the assignment allows basic auth):

- One hard-coded demo account, checked in the browser in [lib/auth.ts](../lib/auth.ts).
- Session stored in `sessionStorage`; survives refreshes, cleared on logout.
- A single `resolveAuthRedirect()` function decides redirects: protected views send visitors to `/login`, and logged-in users on `/login` go home.
- The auth logic accepts an injected storage object, so it is fully testable without a browser (see `tests/auth.test.ts`).

## 7. What works

- Knowledge browsing across all core entity types.
- Relationship exploration with labels and click-through navigation.
- Relationship-aware answers for the three example question styles.
- Full CRUD for clients, people, projects, topics, decisions, and documents, with immediate graph updates and persistence.
- Optional PostgreSQL mode with the same API surface.
- Automated tests for graph validity, new-decision edges, the three example answers, and auth.

## 8. Trade-offs and incomplete work

| Decision                                                | Why                                      | What a production version would do                                          |
| ------------------------------------------------------- | ---------------------------------------- | --------------------------------------------------------------------------- |
| Browser `localStorage` fallback                         | Demo must run with no credentials        | Database, authenticated API, migrations, audit history                      |
| Deterministic intents instead of free-form NL reasoning | Answers must be inspectable and testable | Add an LLM that retrieves graph-backed evidence and cites the links it used |
| Simple text recognition for message→topic links         | Sample dataset is intentionally small    | Structured metadata at ingestion plus human review                          |
| No real external integrations                           | Assignment permits sample files          | Ingest one source (e.g. Google Docs or Slack) properly                      |

## 9. Testing and validation

Automated checks:

```bash
pnpm lint
pnpm test
pnpm build
```

The tests verify that:

- every graph edge points to a real node;
- adding a linked decision produces the expected new edges;
- each of the three example questions returns its expected evidence and path;
- login, logout, session parsing, and redirect logic behave correctly.

Recommended manual QA: log in, create a decision and a document, follow their links in Knowledge, ask one of the example questions, and check the mobile layout.

## 10. Future improvements

1. Real authentication with roles.
2. Ingest one live source (Google Docs or Slack).
3. Document parsing with citations.
4. Graph-grounded LLM answers with provenance and feedback evaluation.
5. Multi-hop traversal (recursive CTEs, or Neo4j if that becomes the dominant workload).
