# Sample Data (NOT real data)

These files are **fictional sample data** created only for this take-home assignment.

- Do **not** treat any of this information as real.
- Do **not** use these names, companies, or details outside this assessment.
- The data exists so you can build and test your system without spending time on real integrations.

You are free to:

- Use these files as-is
- Extend them
- Replace them with your own sample data

Just make sure your system can work with realistic connected information.

## What is included

| File / Folder          | Description                                  |
| ---------------------- | -------------------------------------------- |
| seed/                  | JSON fixtures loaded by `db/seed.mjs`        |
| seed/people.json       | Team members                                 |
| seed/clients.json      | Client organisations                         |
| seed/projects.json     | Projects (linked to clients and people)      |
| seed/decisions.json    | Important decisions with context             |
| seed/topics.json       | Recurring concepts / themes                  |
| sources/documents/     | Markdown notes and summaries                 |
| sources/slack-exports/ | Small fictional Slack-style message excerpts |

The data is intentionally connected. Projects link to people and clients. Decisions link to projects and topics. Documents and messages refer to the same entities. A good solution will make use of these connections.
