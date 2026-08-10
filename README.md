# Brainbase

Brainbase is a connected-knowledge MVP for a small AI consulting team (8–15 people). It stores **people, clients, projects, decisions, topics, documents, and Slack-style messages** as linked records, so answers can follow **relationships** between things — not just match keywords.

It was built for a take-home assignment. All sample data is **entirely fictional**.

## Why it exists

The team's knowledge is scattered across Notion, Slack, Google Docs, emails, and people's heads. Connections between things get lost, the same questions are asked again and again, and new people ramp up slowly.

Brainbase tackles this by making links first-class:

- Every record declares its connections (a decision links to its project, author, participants, and topics).
- A knowledge graph is rebuilt from those records, so edges always reflect current data.
- Answers show the **evidence** they used and the **path** they followed.

## Features

- **Knowledge browsing** — view every entity type and its labeled relationships.
- **Relationship exploration** — click through edges like `works on`, `has decision`, `covers`, and `about`.
- **Ask Brainbase** — relationship-aware answers for natural-language questions, with visible evidence and reasoning path.
- **Full CRUD** — create, edit, and delete clients, people, projects, topics, decisions, and documents; the graph updates immediately.
- **Two persistence modes** — works out of the box with browser `localStorage`; switches to PostgreSQL automatically when `DATABASE_URL` is set.
- **Demo login** — frontend-only authentication for the assignment (see [Demo authentication](#demo-authentication)).
- **Automated tests** — graph validity, new-decision linking, the example answer flows, and auth logic.

## Tech stack

| Layer     | Choice                                              |
| --------- | --------------------------------------------------- |
| Framework | Next.js 16 (App Router) + React 19                  |
| Language  | TypeScript                                          |
| Styling   | Tailwind CSS 4                                      |
| Database  | PostgreSQL (optional; `pg` driver)                  |
| Tests     | Node built-in test runner (`node --test`) via `tsc` |
| Tooling   | pnpm 11, ESLint 9, Prettier 3                       |

No LLM, no external API keys, and no mandatory database are required for the demo. The answer layer is deterministic and fully inspectable.

## Quick start

Prerequisites: Node.js 20+ and pnpm 11 (`corepack enable` will pick up the pinned version from `package.json`).

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000. You are redirected to `/login`; sign in with the demo account below.

> `npm install` / `npm run dev` also work, but the lockfile is managed with pnpm.

## Demo authentication

|          |                        |
| -------- | ---------------------- |
| Email    | `test@brainbase.local` |
| Password | `Brainbase123!`        |

This is **frontend-only demo authentication** for the assignment:

- Credentials are checked in the browser against the hard-coded demo account ([lib/auth.ts](lib/auth.ts)); nothing is sent to any API.
- The session lives in `sessionStorage`, survives page refreshes, and is cleared by **Log out** in the header.
- Protected views redirect unauthenticated visitors to `/login`; logged-in users on `/login` are sent back to the app.
- It is intentionally **not** production security.

## App tour

| Route        | What it does                                                            |
| ------------ | ----------------------------------------------------------------------- |
| `/`          | Overview dashboard of the knowledge base                                |
| `/ask`       | Ask questions and get answers with evidence and a visible path          |
| `/knowledge` | Browse all entities and explore their labeled relationships             |
| `/manage`    | Add/edit/delete clients, people, projects, topics, decisions, documents |
| `/login`     | Demo sign-in                                                            |

## Example questions

Try these in **Ask Brainbase**:

1. **Who worked on the Lexora project and what key decisions were made?**
   Returns the team linked to the project plus the decisions made about it, with who made them and when.
2. **What did FinEdge teach us that is useful for Lexora?**
   Connects a lesson from the FinEdge handover to the later decision made for Lexora — one project influencing another.
3. **Why didn't we integrate Slack in the internal knowledge base?**
   Returns the decision itself, the people involved, the reasoning, and the documents/messages discussing the same topic.

These mirror the three answer styles from the assignment: structured, natural-language, and exploration.

## Optional: PostgreSQL mode

The demo runs with no database (browser `localStorage`). To run the DB-backed path:

1. Create an empty PostgreSQL database and set `DATABASE_URL` in `.env.local`:

   ```bash
   DATABASE_URL=postgres://user:password@localhost:5432/brainbase
   ```

2. Apply the schema and fictional seed data:

   ```bash
   node db/apply.mjs
   ```

3. Restart `pnpm dev`. The API routes and the Ask engine now read from PostgreSQL, and CRUD writes go to the database.

The schema ([db/schema.sql](db/schema.sql)) keeps graph semantics explicit through typed edge tables (e.g. `project_team`, `decision_people`, `document_topics`) with foreign keys and business-rule constraints. Full instructions: [db/README.md](db/README.md).

## API endpoints

With `DATABASE_URL` configured, these REST endpoints are live:

| Endpoint                  | Methods          | Purpose                                  |
| ------------------------- | ---------------- | ---------------------------------------- |
| `/api/knowledge`          | GET              | Full snapshot: entities + edges          |
| `/api/people` and friends | GET, POST        | Create/list records                      |
| `/api/{entity}/[id]`      | GET, PUT, DELETE | Read/update/delete a single record       |
| `/api/relationships/[id]` | GET              | Labeled relationships for one entity     |
| `/api/ask`                | POST             | Relationship-aware answer for a question |

`{entity}` is one of: `people`, `clients`, `projects`, `topics`, `decisions`, `documents`.

Without `DATABASE_URL`, the UI transparently falls back to the local engine (see the [design document](docs/design.md#5-dual-persistence-by-design)).

## Quality checks

```bash
pnpm lint          # ESLint
pnpm test          # TypeScript compile + node --test (knowledge + auth suites)
pnpm build         # production build
pnpm format        # Prettier write
pnpm format:check  # Prettier verify
```

The tests validate that every graph edge points to a real node, that a newly added decision produces the expected edges, that each example question returns its expected evidence/path, and the auth session logic.

## Project structure

```
app/            Next.js App Router pages and API routes
components/     Views (Knowledge, Ask, Manage, Login) + knowledge store
  manage/       Manage view split: page shell, entity forms, form controls
hooks/          use-auth, use-ask — UI never calls fetch directly
lib/            Shared logic:
                  types.ts         client-safe domain types
                  knowledge.ts     seed data, graph builder, local answer engine
                  auth.ts          demo auth logic
  client/
    api-client.ts  only place that talks HTTP (must stay server-free)
  server/       server-only modules (Postgres-backed):
    database.ts      Postgres connection
    entity-api.ts    DB-backed CRUD service
    ask-engine.ts    DB-backed answer engine
    relationships.ts DB-backed relationship lookup
data/
  seed/         Fictional JSON fixtures loaded by db/seed.mjs
  sources/      Fictional Markdown documents and Slack excerpt
db/             schema.sql, seed.mjs, apply.mjs — PostgreSQL setup
tests/          knowledge.test.ts, auth.test.ts
docs/           Design document and the original problem statement
```

File names follow **kebab-case** (e.g. `components/app-shell.tsx`, `hooks/use-ask.ts`); exported symbols keep PascalCase for components and camelCase for hooks/functions.

## Documentation

- [Design document](docs/design.md) — architecture, data model, trade-offs, and limitations.
- [Problem statement](docs/Problem_Statement.md) — the original assignment brief.
- [Database setup](db/README.md) — how to apply the PostgreSQL schema and seed.
- [Sample data](data/README.md) — what the fictional dataset contains.

## Limitations (by design)

- Persistence without `DATABASE_URL` is local to one browser.
- The answer interpreter supports high-value deterministic intents, not unrestricted natural language.
- Message-to-topic linking uses simple text recognition because the dataset is intentionally small.
- There are no real external integrations; the assignment provides sample files instead.

## Disclaimer

All names, companies, projects, and decisions in `data/` are fictional and were created only for this assignment. Do not treat them as real or reuse them outside this assessment.
