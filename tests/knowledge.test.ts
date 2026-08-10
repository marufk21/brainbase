import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  answerQuestion,
  buildKnowledgeGraph,
  knowledge,
  type KnowledgeCollections,
} from "../lib/knowledge";

describe("knowledge graph", () => {
  it("creates nodes and only connects to valid nodes", () => {
    const graph = buildKnowledgeGraph();
    const nodeIds = new Set(graph.nodes.map((node) => node.id));

    assert.ok(graph.nodes.length > 30);
    assert.ok(graph.edges.length > 50);
    assert.ok(graph.edges.every((edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to)));
  });

  it("adds graph edges for a newly linked decision", () => {
    const collections: KnowledgeCollections = {
      ...knowledge,
      decisions: [
        ...knowledge.decisions,
        {
          id: "d-test",
          title: "Test linked decision",
          date: "2026-08-10",
          project_id: "proj001",
          made_by: "p001",
          participants: ["p001", "p002"],
          summary: "A test decision linked to a project, people, and a topic.",
          related_topics: ["Structured Retrieval"],
        },
      ],
    };
    const graph = buildKnowledgeGraph(collections);
    const testEdges = graph.edges.filter((edge) => edge.from === "d-test" || edge.to === "d-test");

    assert.ok(testEdges.some((edge) => edge.from === "proj001" && edge.to === "d-test" && edge.label === "has decision"));
    assert.ok(testEdges.some((edge) => edge.from === "p001" && edge.to === "d-test" && edge.label === "made by"));
  });

  it("connects newly created client, person, project, and topic records", () => {
    const collections: KnowledgeCollections = {
      ...knowledge,
      clients: [...knowledge.clients, { id: "c-test", name: "Test Client", industry: "Testing", size: "Small", primary_contact: "Casey", status: "Active", notes: "Created through CRUD." }],
      people: [...knowledge.people, { id: "p-test", name: "Casey Tester", role: "QA", email: "casey@example.com", skills: ["Testing"] }],
      topics: [...knowledge.topics, { id: "t-test", name: "CRUD Testing", description: "Testing managed records." }],
      projects: [...knowledge.projects, { id: "proj-test", name: "CRUD Project", client_id: "c-test", status: "Discovery", start_date: "2026-08-10", lead: "p-test", team: ["p-test"], description: "A project created for graph verification.", key_topics: ["CRUD Testing"] }],
    };
    const graph = buildKnowledgeGraph(collections);

    assert.ok(graph.edges.some((edge) => edge.from === "c-test" && edge.to === "proj-test" && edge.label === "owns project"));
    assert.ok(graph.edges.some((edge) => edge.from === "p-test" && edge.to === "proj-test" && edge.label === "works on"));
    assert.ok(graph.edges.some((edge) => edge.from === "proj-test" && edge.to === "t-test" && edge.label === "uses topic"));
  });
});

describe("relationship-aware answers", () => {
  it("answers the Lexora team and decision question from linked records", () => {
    const answer = answerQuestion("Who worked on the Lexora project and what key decisions were made?");
    assert.match(answer.answer, /Rahul Mehta/);
    assert.ok(answer.path.map((step) => step.title).includes("Lexora Knowledge Core"));
    assert.ok(answer.evidence.some((item) => item.includes("pure vector search")));
  });

  it("connects the FinEdge lesson to Lexora", () => {
    const answer = answerQuestion("What did FinEdge teach us that is useful for Lexora?");
    assert.equal(answer.title, "FinEdge lesson reused for Lexora");
    assert.ok(answer.path.map((step) => step.title).includes("Structured Retrieval"));
  });

  it("explains the Slack scope decision with evidence", () => {
    const answer = answerQuestion("Why didn't we integrate Slack in the internal knowledge base?");
    assert.match(answer.answer, /too much noise/);
    assert.ok(answer.evidence.some((item) => item.includes("Sneha Patel")));
    assert.ok(answer.path.map((step) => step.title).includes("Scope Control"));
  });
});
