# Brainbase

Brainbase is a working connected-knowledge MVP for a small AI consulting team. It stores people, clients, projects, decisions, documents, topics, and Slack excerpts as linked records so answers can follow relationships rather than only matching words.

## Features

- Browse entity records and their labeled relationships.
- Ask relationship-aware questions with evidence and a visible path.
- Full CRUD for clients, people, projects, topics, decisions, and documents.
- Persist changes locally in the browser with `localStorage`.
- Start from fictional assignment seed data only.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality checks

```bash
npm run lint
npm run test
npm run build
```

## Example questions

- Who worked on the Lexora project and what key decisions were made?
- What did FinEdge teach us that is useful for Lexora?
- Why didn't we integrate Slack in the internal knowledge base?

## Technical notes

The app uses Next.js, React, TypeScript, and local JSON-derived seed data. The graph is built in `lib/knowledge.ts`; entity changes update the in-browser collection, and graph edges are rebuilt from those records. This MVP intentionally uses browser-only persistence and a deterministic answer layer, so it does not require credentials, a database, or an LLM.

See [the design document](docs/design.md) for the architecture, trade-offs, and remaining limitations.
