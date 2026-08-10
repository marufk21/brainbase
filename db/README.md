# Brainbase database setup

The production persistence layer is PostgreSQL. The schema and seed tooling in this folder are optional for the demo app (which persists to `localStorage`), but they power the CRUD REST endpoints at `/api/people`, `/api/clients`, `/api/projects`, `/api/topics`, `/api/decisions`, `/api/documents`, `/api/relationships/[id]`, and `/api/ask`.

## Files

- `schema.sql` – tables for clients, projects, people, decisions, topics, documents, and messages, plus explicit relationship (edge) tables with foreign keys and business-rule constraints.
- `seed.mjs` – parses the fictional sources under `data/` (JSON, Markdown, Slack excerpt) and prints a deterministic seed transaction with stable UUIDs.
- `apply.mjs` – applies `schema.sql` and the generated seed transaction to an empty database.

## Apply to an empty database

1. Create an empty PostgreSQL database and set `DATABASE_URL`, either as an environment variable or in `.env.local` at the repository root:

   ```bash
   DATABASE_URL=postgres://user:password@localhost:5432/brainbase
   ```

2. Run the apply script from the repository root:

   ```bash
   node db/apply.mjs
   ```

   On success it prints `Database schema and sample data applied successfully.`

3. Start the app with `npm run dev`. The API routes now read from PostgreSQL.

`apply.mjs` is idempotent only against an empty database; to reseed, drop and recreate the database first. The seed data is entirely fictional assignment data.
