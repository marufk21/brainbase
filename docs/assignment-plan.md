# Brainbase Assignment Plan

## Goal

Build a working knowledge system for a small AI consulting team. The system should help users store, connect, explore, and ask questions about people, projects, clients, documents, decisions, and topics.

The most important idea is that answers should use relationships between information, not only keyword search.

## Recommended Technologies

### Core Stack

- Next.js for the web application.
- React for the user interface.
- TypeScript for safer data models and relationship logic.
- Tailwind CSS for fast, consistent styling.

### Data Layer

- Start with local JSON seed data from the assignment.
- Convert the sample data into a graph model in code.
- Use SQLite or Postgres later if persistent create, update, and delete features are needed.

### Knowledge Model

- Represent each item as a node.
- Represent each relationship as an edge.
- Keep relationship labels explicit, such as `works on`, `belongs to`, `made by`, `mentions`, and `about`.

### Search and Answers

- Start with deterministic graph traversal and rule-based question handling.
- Return answers with evidence and relationship paths.
- Add an LLM later only after the graph model works.

### Testing

- Use unit tests for graph creation and relationship traversal.
- Use UI tests for the main question-answer flow.
- Keep test coverage focused on the knowledge logic, because that is the assignment's core risk.

### Deployment

- Deploy the app on Vercel.
- Include local setup instructions in the README.

## Data Model

### Main Entities

- People
- Clients
- Projects
- Documents
- Decisions
- Topics
- Messages or external notes

### Example Relationships

- A client owns a project.
- A person works on a project.
- A person leads a project.
- A decision belongs to a project.
- A decision was made by a person.
- A document mentions a project.
- A document covers a topic.
- A message discusses a decision or topic.
- A project uses several topics.

## Step-By-Step Tasks

### 1. Understand the Problem

- Read the problem statement fully.
- Identify what the evaluator cares about:
  - data modeling
  - relationships
  - architecture
  - working product
  - clear documentation
- Avoid spending too much time on real integrations.

### 2. Set Up the Application

- Create a Next.js app.
- Add TypeScript and Tailwind CSS.
- Confirm the app runs locally.
- Keep the folder structure simple.

### 3. Load Sample Data

- Add the provided sample JSON and markdown files.
- Create TypeScript types for all entities.
- Normalize IDs so relationships are easy to follow.
- Add helper functions for finding people, projects, decisions, topics, and documents.

### 4. Build the Graph Layer

- Convert entities into graph nodes.
- Convert links between entities into graph edges.
- Add relationship labels.
- Add helper functions to:
  - find connected nodes
  - find paths between entities
  - get evidence for an answer
  - group related information by project, topic, or decision

### 5. Build the Main UI

- Add a dashboard with counts for entities and relationships.
- Show lists of projects, people, clients, decisions, documents, and topics.
- Add detail sections that show connected entities.
- Make the interface useful immediately instead of building a marketing landing page.

### 6. Build Relationship-Aware Q&A

- Add a question input.
- Support a few high-quality example questions:
  - Who worked on the Lexora project and what key decisions were made?
  - What did we learn from FinEdge that is useful for Lexora?
  - Show everything related to the decision about not integrating Slack in the internal KB.
- Each answer should include:
  - direct answer
  - evidence
  - relationship path
  - connected people, projects, decisions, documents, or topics

### 7. Add Knowledge Management

- Add forms to create or edit at least one or two entity types.
- Good MVP choices:
  - add a decision
  - add a document or note
  - link a document to a project and topics
- Make sure new information updates the relationship graph.

### 8. Add Graph Exploration

- Add filters by entity type.
- Show relationship labels.
- Let users inspect what connects to a project, decision, topic, or person.
- A simple list-based graph explorer is acceptable for MVP.
- A visual graph can be added later if time allows.

### 9. Add Tests

- Test that graph nodes are created correctly.
- Test that graph edges are created correctly.
- Test the example questions.
- Test that adding a new decision creates the expected links.

### 10. Write Documentation

- Write a clear README with:
  - project overview
  - setup steps
  - commands
  - example questions
  - test instructions
- Write a design document with:
  - problem understanding
  - architecture
  - data model
  - graph relationship approach
  - trade-offs
  - incomplete work
  - future improvements

### 11. Validate the App

- Run lint.
- Run tests.
- Run production build.
- Manually test the three main example questions.
- Check that the UI is readable on desktop and mobile.

### 12. Submit

- Push the code to a separate repository.
- Include the README and design document.
- Include local run instructions.
- Include deployment link if available.

## MVP Scope

The best MVP is small but complete:

- Load sample data.
- Build a graph of entities and relationships.
- Show an entity explorer.
- Answer three relationship-aware questions.
- Add or edit at least one entity type.
- Provide tests for the graph and answer logic.
- Provide a clear README and design document.

## Suggested Folder Structure

```text
app/
  page.tsx
  globals.css
components/
  EntityCard.tsx
  GraphExplorer.tsx
  QuestionAnswerPanel.tsx
lib/
  knowledge.ts
  graph.ts
  answers.ts
data/
  clients.json
  projects.json
  people.json
  decisions.json
  topics.json
docs/
  design.md
  assignment-plan.md
tests/
  graph.test.ts
  answers.test.ts
```

## Trade-Offs

- Local JSON is faster for a take-home assignment, but it is not enough for a real multi-user app.
- Rule-based answers are reliable for sample data, but an LLM would be useful for broader natural-language questions.
- A simple graph explorer is easier to evaluate than a complex visual graph with weak data behavior.
- One good integration is better than several incomplete integrations.

## Future Improvements

- Add persistent storage with SQLite or Postgres.
- Add authentication.
- Add document upload and parsing.
- Add one real integration, such as Google Docs or Slack.
- Add LLM-based answer generation grounded in graph evidence.
- Add permissions and audit history.
- Add visual graph layout for exploration.
