# Brainbase design document

## Problem understanding

A small consulting team needs a shared memory for client work. The important requirement is not document search alone: a useful answer must expose how people, projects, decisions, source documents, topics, and discussion messages are connected. Brainbase therefore prioritises explicit links and inspectable evidence over a broad but opaque search experience.

## Architecture

The application is a Next.js App Router application. Interactive views are client components because they need form state and browser persistence. The root provider owns the current `KnowledgeCollections` state and persists it to `localStorage`; it is deliberately isolated so a future API/database implementation can replace it.

`lib/knowledge.ts` contains the typed data model, seed data, graph builder, answer logic, and relationship lookup helper. The graph builder creates one node per entity and labeled directed edges such as `works on`, `has decision`, `covers`, and `about`. Views rebuild their graph from the current collection, so a saved decision or document immediately appears in exploration and answer evidence.

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
