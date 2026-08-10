# Database schema

`schema.sql` is the initial PostgreSQL schema for Brainbase. It uses UUID primary keys, relational foreign keys, and explicit join tables for every graph relationship.

Create the schema, then seed every JSON and Markdown file from `data/`:

```bash
psql "$DATABASE_URL" -f db/schema.sql
node db/seed.mjs | psql "$DATABASE_URL" -v ON_ERROR_STOP=1
```

Alternatively, with `DATABASE_URL` in `.env.local`, use the bundled Node runner:

```bash
node db/apply.mjs
```

The seed is deterministic and idempotent: a sample record gets the same UUID on every run and uses `ON CONFLICT` updates. Inspect the generated transaction without connecting to a database with `node db/seed.mjs --dry-run` (the flag is optional; the script always writes SQL to stdout).

This schema is intentionally not wired into the browser-only MVP yet. That migration is a separate application change: replace the `localStorage` provider with server-side CRUD endpoints/Server Actions and map existing seed IDs to UUIDs.

## REST API

After setting `DATABASE_URL`, the Next.js route handlers expose CRUD for all core entities:

```text
GET, POST             /api/people | clients | projects | topics | decisions | documents
GET, PUT, DELETE      /api/:entity/:uuid
```

Requests and responses use JSON. `POST` accepts the database column names for the entity; `PUT` accepts the changed fields. The routes use parameterized SQL and return `503` with a configuration error if `DATABASE_URL` is absent.

### Relationship traversal

```text
GET /api/relationships/:uuid
```

Returns every directly linked entity from the edge tables, with relationship label, `incoming`/`outgoing` direction, and display-ready target fields. For example, requesting a project returns its owning client, team members/lead, topics, decisions, and linked documents or messages.
