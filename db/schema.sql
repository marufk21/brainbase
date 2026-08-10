-- Brainbase PostgreSQL schema
-- Apply with: psql "$DATABASE_URL" -f db/schema.sql
--
-- Relationship tables are deliberate: they preserve the graph semantics while
-- retaining relational integrity, migrations, and straightforward reporting.

BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE project_status AS ENUM ('discovery', 'in_progress', 'completed', 'paused', 'cancelled');
CREATE TYPE client_status AS ENUM ('lead', 'active', 'past', 'inactive');
CREATE TYPE decision_person_role AS ENUM ('owner', 'participant');

CREATE TABLE people (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  skills TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  industry TEXT,
  company_size TEXT,
  primary_contact TEXT,
  status client_status NOT NULL DEFAULT 'lead',
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  status project_status NOT NULL DEFAULT 'discovery',
  start_date DATE NOT NULL,
  end_date DATE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT projects_date_range CHECK (end_date IS NULL OR end_date >= start_date)
);

CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  decided_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  summary TEXT NOT NULL DEFAULT '',
  content_markdown TEXT NOT NULL DEFAULT '',
  source_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'manual_note',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Slack-style source messages are retained as evidence, not flattened into a
-- document, so their author and timestamp remain queryable.
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  occurred_at TIMESTAMPTZ NOT NULL,
  body TEXT NOT NULL,
  channel TEXT NOT NULL DEFAULT 'general',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Edges: client -> project. A project has zero or one current client, but the
-- separate table keeps the relationship explicit and can support history later.
CREATE TABLE project_clients (
  project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
  client_id UUID NOT NULL REFERENCES clients(id) ON DELETE RESTRICT,
  linked_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Edges: person -> project. `is_lead` makes a project lead explicit.
CREATE TABLE project_team (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  is_lead BOOLEAN NOT NULL DEFAULT false,
  joined_at DATE,
  PRIMARY KEY (project_id, person_id)
);
CREATE UNIQUE INDEX project_team_one_lead ON project_team (project_id) WHERE is_lead;

-- Edges: project -> topic.
CREATE TABLE project_topics (
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  PRIMARY KEY (project_id, topic_id)
);

-- Edges: project -> decision. A decision can be global or tied to one project.
CREATE TABLE decision_projects (
  decision_id UUID PRIMARY KEY REFERENCES decisions(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT
);

-- Edges: person -> decision, including owner and participants.
CREATE TABLE decision_people (
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  relationship decision_person_role NOT NULL,
  PRIMARY KEY (decision_id, person_id)
);
CREATE UNIQUE INDEX decision_people_one_owner ON decision_people (decision_id) WHERE relationship = 'owner';

-- Edges: decision -> topic.
CREATE TABLE decision_topics (
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  PRIMARY KEY (decision_id, topic_id)
);

-- Document evidence links. These keep foreign keys and make provenance
-- queryable without a weak polymorphic entity_id column.
CREATE TABLE document_projects (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'mentions',
  PRIMARY KEY (document_id, project_id, relationship_label)
);
CREATE TABLE document_topics (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'covers',
  PRIMARY KEY (document_id, topic_id, relationship_label)
);
CREATE TABLE document_decisions (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  decision_id UUID NOT NULL REFERENCES decisions(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'supports',
  PRIMARY KEY (document_id, decision_id, relationship_label)
);
CREATE TABLE document_people (
  document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'authored_by',
  PRIMARY KEY (document_id, person_id, relationship_label)
);

CREATE TABLE message_people (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  person_id UUID NOT NULL REFERENCES people(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'wrote',
  PRIMARY KEY (message_id, person_id, relationship_label)
);
CREATE TABLE message_projects (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'mentions',
  PRIMARY KEY (message_id, project_id, relationship_label)
);
CREATE TABLE message_topics (
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  topic_id UUID NOT NULL REFERENCES topics(id) ON DELETE RESTRICT,
  relationship_label TEXT NOT NULL DEFAULT 'signals',
  PRIMARY KEY (message_id, topic_id, relationship_label)
);

CREATE INDEX project_clients_client_id_idx ON project_clients(client_id);
CREATE INDEX project_team_person_id_idx ON project_team(person_id);
CREATE INDEX project_topics_topic_id_idx ON project_topics(topic_id);
CREATE INDEX decision_projects_project_id_idx ON decision_projects(project_id);
CREATE INDEX decision_people_person_id_idx ON decision_people(person_id);
CREATE INDEX decision_topics_topic_id_idx ON decision_topics(topic_id);
CREATE INDEX document_projects_project_id_idx ON document_projects(project_id);
CREATE INDEX document_topics_topic_id_idx ON document_topics(topic_id);
CREATE INDEX document_decisions_decision_id_idx ON document_decisions(decision_id);
CREATE INDEX document_people_person_id_idx ON document_people(person_id);
CREATE INDEX message_people_person_id_idx ON message_people(person_id);
CREATE INDEX message_projects_project_id_idx ON message_projects(project_id);
CREATE INDEX message_topics_topic_id_idx ON message_topics(topic_id);

COMMIT;
