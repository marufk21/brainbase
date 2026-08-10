import type {
  AnswerResult,
  Client,
  Decision,
  Document,
  EntityKind,
  KnowledgeCollections,
  KnowledgeEdge,
  KnowledgeNode,
  Person,
  Project,
  SlackMessage,
  Topic,
} from "./types";

export type {
  AnswerResult,
  AnswerStep,
  Client,
  Decision,
  Document,
  EntityKind,
  KnowledgeCollections,
  KnowledgeEdge,
  KnowledgeNode,
  Person,
  Project,
  SlackMessage,
  Topic,
} from "./types";

const clients = [
  {
    id: "c001",
    name: "Lexora Legal",
    industry: "Legal Tech",
    size: "Mid-size",
    primary_contact: "Neha Kapoor",
    status: "Active",
    notes:
      "Building internal knowledge system for case law and contracts. High interest in structured retrieval.",
  },
  {
    id: "c002",
    name: "MediSync Health",
    industry: "Healthcare",
    size: "Enterprise",
    primary_contact: "Dr. Amit Rao",
    status: "Active",
    notes:
      "Need better way to connect clinical guidelines, internal protocols, and research papers.",
  },
  {
    id: "c003",
    name: "FinEdge Analytics",
    industry: "Finance",
    size: "Startup",
    primary_contact: "Karan Malhotra",
    status: "Past",
    notes: "Completed a RAG pilot for internal research reports. Project closed in March 2025.",
  },
  {
    id: "c004",
    name: "GreenGrid Energy",
    industry: "Energy",
    size: "Mid-size",
    primary_contact: "Meera Iyer",
    status: "Active",
    notes: "Exploring knowledge base for technical documentation and field reports.",
  },
] as const;

const people = [
  {
    id: "p001",
    name: "Ananya Sharma",
    role: "Founder & CEO",
    email: "ananya@aiconsult.co",
    skills: ["Strategy", "Client Management", "AI Product"],
  },
  {
    id: "p002",
    name: "Rahul Mehta",
    role: "Senior AI Engineer",
    email: "rahul@aiconsult.co",
    skills: ["LLM Systems", "RAG", "Backend"],
  },
  {
    id: "p003",
    name: "Priya Nair",
    role: "ML Engineer",
    email: "priya@aiconsult.co",
    skills: ["NLP", "Evaluation", "Data Pipelines"],
  },
  {
    id: "p004",
    name: "Vikram Singh",
    role: "Product Manager",
    email: "vikram@aiconsult.co",
    skills: ["Product", "Research", "Client Workshops"],
  },
  {
    id: "p005",
    name: "Sneha Patel",
    role: "Research Analyst",
    email: "sneha@aiconsult.co",
    skills: ["Domain Research", "Documentation", "Knowledge Management"],
  },
  {
    id: "p006",
    name: "Arjun Reddy",
    role: "Full Stack Engineer",
    email: "arjun@aiconsult.co",
    skills: ["Frontend", "Backend", "Infra"],
  },
] as const;

const projects = [
  {
    id: "proj001",
    name: "Lexora Knowledge Core",
    client_id: "c001",
    status: "In Progress",
    start_date: "2025-09-01",
    lead: "p002",
    team: ["p002", "p003", "p005"],
    description:
      "Build a structured knowledge system that connects case documents, statutes, internal memos, and lawyer notes. Beyond simple RAG.",
    key_topics: ["Legal Knowledge", "Document Linking", "Structured Retrieval"],
  },
  {
    id: "proj002",
    name: "MediSync Protocol Hub",
    client_id: "c002",
    status: "Discovery",
    start_date: "2025-11-15",
    lead: "p004",
    team: ["p004", "p003", "p001"],
    description:
      "Early exploration of how clinical guidelines, hospital protocols, and research can be connected for faster clinician access.",
    key_topics: ["Healthcare Knowledge", "Guideline Linking", "Clinical Decision Support"],
  },
  {
    id: "proj003",
    name: "FinEdge Research Assistant",
    client_id: "c003",
    status: "Completed",
    start_date: "2024-10-01",
    end_date: "2025-03-15",
    lead: "p002",
    team: ["p002", "p006"],
    description:
      "RAG-based assistant over internal research reports and market notes. Delivered and handed over.",
    key_topics: ["RAG", "Finance Research", "Report Search"],
  },
  {
    id: "proj004",
    name: "Internal Knowledge Base (v1)",
    client_id: null,
    status: "In Progress",
    start_date: "2025-07-01",
    lead: "p005",
    team: ["p005", "p006", "p001"],
    description:
      "Our own internal attempt to reduce knowledge scattered across tools. This assignment is related to improving this idea.",
    key_topics: ["Internal Knowledge", "Team Memory", "Decision Tracking"],
  },
] as const;

const decisions = [
  {
    id: "d001",
    title: "Prefer structured knowledge over pure vector RAG for Lexora",
    date: "2025-09-20",
    project_id: "proj001",
    made_by: "p002",
    participants: ["p001", "p002", "p003", "p005"],
    summary:
      "After initial experiments, pure vector search missed important legal relationships (case -> statute -> amendment). Decided to invest in richer linking between entities.",
    related_topics: ["Legal Knowledge", "Document Linking", "Structured Retrieval"],
  },
  {
    id: "d002",
    title: "Do not build full Slack integration in v1 of internal KB",
    date: "2025-08-05",
    project_id: "proj004",
    made_by: "p001",
    participants: ["p001", "p005", "p006"],
    summary:
      "Slack has too much noise. For first version, focus on documents, decisions, people and projects. Slack can be added later if needed.",
    related_topics: ["Internal Knowledge", "Scope Control"],
  },
  {
    id: "d003",
    title: "Use Gemini for generation tasks in client demos",
    date: "2025-10-12",
    project_id: null,
    made_by: "p001",
    participants: ["p001", "p002", "p004"],
    summary:
      "Company decision to standardise on Gemini for most generation and analysis tasks in client work, unless client has strong preference otherwise.",
    related_topics: ["AI Stack", "Vendor Choice"],
  },
  {
    id: "d004",
    title: "MediSync project stays in discovery until clinical advisor is onboarded",
    date: "2025-12-01",
    project_id: "proj002",
    made_by: "p004",
    participants: ["p001", "p004"],
    summary:
      "Healthcare domain needs stronger domain expertise before architecture decisions. Waiting for part-time clinical advisor.",
    related_topics: ["Healthcare Knowledge", "Domain Expertise"],
  },
] as const;

const topics = [
  {
    id: "t001",
    name: "Legal Knowledge",
    description:
      "Systems and methods for organising case law, statutes, contracts and internal legal notes.",
  },
  {
    id: "t002",
    name: "Document Linking",
    description:
      "Creating and maintaining meaningful connections between documents and other entities.",
  },
  {
    id: "t003",
    name: "Structured Retrieval",
    description: "Going beyond keyword or pure vector search by using structure and relationships.",
  },
  {
    id: "t004",
    name: "Healthcare Knowledge",
    description:
      "Clinical guidelines, protocols, research papers and how they relate to each other.",
  },
  {
    id: "t005",
    name: "Internal Knowledge",
    description: "How a small team keeps track of its own decisions, projects, people and lessons.",
  },
  {
    id: "t006",
    name: "RAG",
    description: "Retrieval Augmented Generation patterns and their limitations.",
  },
  {
    id: "t007",
    name: "AI Stack",
    description: "Choices around models, tools and infrastructure used in projects.",
  },
  {
    id: "t008",
    name: "Scope Control",
    description: "Decisions about what to include or exclude in early versions of systems.",
  },
  {
    id: "t009",
    name: "Domain Expertise",
    description:
      "Need for subject matter experts when building knowledge systems in specialised fields.",
  },
  {
    id: "t010",
    name: "Team Memory",
    description:
      "Capturing why decisions were made and what was learned so the team does not repeat work.",
  },
  {
    id: "t011",
    name: "Guideline Linking",
    description:
      "Linking clinical conditions, guidelines, local protocols, and supporting evidence.",
  },
  {
    id: "t012",
    name: "Decision Tracking",
    description: "Recording decisions, their rationale, participants, and downstream impact.",
  },
] as const;

const slackMessages = [
  {
    ts: "2025-09-04T11:20:00Z",
    user: "Rahul Mehta",
    text: "After the Lexora kickoff I'm more convinced pure RAG won't cut it. Legal docs have heavy cross-references. We need proper linking.",
  },
  {
    ts: "2025-09-04T11:24:00Z",
    user: "Ananya Sharma",
    text: "Agreed. Let's capture that as a decision once the team aligns. Also flag it for the internal KB - same pattern keeps appearing.",
  },
  {
    ts: "2025-08-06T09:15:00Z",
    user: "Sneha Patel",
    text: "For internal KB v1 I'm skipping Slack import. Too much noise. We'll start with docs + decisions + people + projects.",
  },
  {
    ts: "2025-11-29T16:40:00Z",
    user: "Vikram Singh",
    text: "MediSync workshop confirmed the same thing we saw in legal: clinicians care about the chain Condition -> Guideline -> Our protocol -> Evidence. Connections > documents.",
  },
  {
    ts: "2025-03-20T14:05:00Z",
    user: "Rahul Mehta",
    text: "FinEdge handover done. Biggest lesson: analysts still kept private notes because the system didn't capture how reports relate or evolve. We should not repeat that.",
  },
] as const;

const documents = [
  {
    id: "doc-finedge-handover",
    label: "FinEdge handover notes",
    summary:
      "Pure document retrieval was useful but missed how reports relate, evolve, or contradict each other.",
    topics: ["RAG", "Structured Retrieval", "Team Memory"],
    projects: ["proj003", "proj001", "proj004"],
  },
  {
    id: "doc-decision-log",
    label: "Decision log excerpt",
    summary:
      "Selected decisions covering Lexora architecture, internal KB scope, model vendor preference, and MediSync discovery.",
    topics: ["Document Linking", "Scope Control", "AI Stack", "Healthcare Knowledge"],
    projects: ["proj001", "proj002", "proj004"],
  },
  {
    id: "doc-internal-kb-vision",
    label: "Internal KB vision",
    summary:
      "A small-team memory system should preserve project context, decision rationale, and reusable lessons.",
    topics: ["Internal Knowledge", "Team Memory", "Decision Tracking"],
    projects: ["proj004"],
  },
  {
    id: "doc-lexora-kickoff",
    label: "Lexora kickoff notes",
    summary:
      "Lexora needs faster discovery of related cases, statutes, memos, and lawyer notes, with linked entities instead of another chat-with-PDF tool.",
    topics: ["Legal Knowledge", "Document Linking", "Structured Retrieval"],
    projects: ["proj001"],
  },
  {
    id: "doc-medisync-discovery",
    label: "MediSync discovery summary",
    summary:
      "Clinicians need connections between conditions, guidelines, hospital protocols, and evidence, so MediSync should remain in discovery until domain expertise is available.",
    topics: ["Healthcare Knowledge", "Domain Expertise", "Guideline Linking"],
    projects: ["proj002"],
  },
] as const;

export const knowledge: KnowledgeCollections = {
  clients: clients as unknown as Client[],
  decisions: decisions as unknown as Decision[],
  documents: documents as unknown as Document[],
  people: people as unknown as Person[],
  projects: projects as unknown as Project[],
  slackMessages: slackMessages as unknown as SlackMessage[],
  topics: topics as unknown as Topic[],
};

export const sampleQuestions = [
  "Who worked on the Lexora project and what key decisions were made?",
  "What did FinEdge teach us that is useful for Lexora?",
  "Why didn't we integrate Slack in the internal knowledge base?",
];

export function buildKnowledgeGraph(collections: KnowledgeCollections = knowledge) {
  const { clients, people, projects, decisions, topics, documents, slackMessages } = collections;
  const projectNodes = projects.map((project) => ({
    id: project.id,
    kind: "project" as const,
    label: project.name,
    summary: project.description,
    meta: project.status,
  }));

  const nodes: KnowledgeNode[] = [
    ...clients.map((client) => ({
      id: client.id,
      kind: "client" as const,
      label: client.name,
      summary: client.notes,
      meta: `${client.industry} · ${client.status}`,
    })),
    ...projectNodes,
    ...people.map((person) => ({
      id: person.id,
      kind: "person" as const,
      label: person.name,
      summary: person.skills.join(", "),
      meta: person.role,
    })),
    ...decisions.map((decision) => ({
      id: decision.id,
      kind: "decision" as const,
      label: decision.title,
      summary: decision.summary,
      meta: decision.date,
    })),
    ...topics.map((topic) => ({
      id: topic.id,
      kind: "topic" as const,
      label: topic.name,
      summary: topic.description,
    })),
    ...documents.map((document) => ({
      id: document.id,
      kind: "document" as const,
      label: document.label,
      summary: document.summary,
    })),
    ...slackMessages.map((message, index) => ({
      id: `msg-${index + 1}`,
      kind: "message" as const,
      label: `${message.user} in #general`,
      summary: message.text,
      meta: new Date(message.ts).toLocaleDateString("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
    })),
  ];

  const nodeIds = new Set(nodes.map((node) => node.id));
  const edges: KnowledgeEdge[] = [
    ...projects.flatMap((project) => [
      ...(project.client_id
        ? [{ from: project.client_id, to: project.id, label: "owns project" }]
        : []),
      { from: project.lead, to: project.id, label: "leads" },
      ...project.team.map((personId) => ({
        from: personId,
        to: project.id,
        label: "works on",
      })),
      ...project.key_topics.map((topicName) => ({
        from: project.id,
        to: topicIdByName(topics, topicName),
        label: "uses topic",
      })),
    ]),
    ...decisions.flatMap((decision) => [
      ...(decision.project_id
        ? [{ from: decision.project_id, to: decision.id, label: "has decision" }]
        : []),
      { from: decision.made_by, to: decision.id, label: "made by" },
      ...decision.participants.map((personId) => ({
        from: personId,
        to: decision.id,
        label: "participated",
      })),
      ...decision.related_topics.map((topicName) => ({
        from: decision.id,
        to: topicIdByName(topics, topicName),
        label: "about",
      })),
    ]),
    ...documents.flatMap((document) => [
      ...document.projects.map((projectId) => ({
        from: document.id,
        to: projectId,
        label: "mentions",
      })),
      ...document.topics.map((topicName) => ({
        from: document.id,
        to: topicIdByName(topics, topicName),
        label: "covers",
      })),
    ]),
    ...slackMessages.flatMap((message, index) => {
      const messageId = `msg-${index + 1}`;
      return [
        { from: personIdByName(people, message.user), to: messageId, label: "wrote" },
        ...projects
          .filter((project) => message.text.includes(project.name.split(" ")[0]))
          .map((project) => ({ from: messageId, to: project.id, label: "mentions" })),
        ...topics
          .filter((topic) =>
            message.text.toLowerCase().includes(topic.name.toLowerCase().split(" ")[0]),
          )
          .map((topic) => ({ from: messageId, to: topic.id, label: "signals" })),
      ];
    }),
  ].filter((edge) => edge.from && edge.to && nodeIds.has(edge.from) && nodeIds.has(edge.to));

  return { nodes, edges };
}

export function answerQuestion(
  question: string,
  collections: KnowledgeCollections = knowledge,
): AnswerResult {
  const { people, projects, decisions, documents, topics, slackMessages } = collections;
  const normalized = question.toLowerCase();
  const graph = buildKnowledgeGraph(collections);
  const projectById = (id: string) => projects.find((project) => project.id === id);
  const personName = (id: string) => personById(people, id)?.name ?? "Unknown person";
  const topicByName = (name: string) => topics.find((topic) => topic.name === name);
  const pathFor = (nodes: Array<{ title: string; via?: string }>) => nodes;

  if (normalized.includes("lexora") && normalized.includes("worked")) {
    const project = projects.find((item) => item.name.toLowerCase().includes("lexora"));
    if (!project) return emptyAnswer(projects);
    const team = project.team.map((id) => personById(people, id));
    const projectDecisions = decisions.filter((decision) => decision.project_id === project.id);
    const client = project.client_id
      ? collections.clients.find((item) => item.id === project.client_id)
      : undefined;

    return {
      title: "Lexora team and architecture decisions",
      answer: `${project.name} is led by ${personName(project.lead)} with ${team
        .filter(Boolean)
        .map((person) => person.name)
        .join(
          ", ",
        )} on the team. ${projectDecisions[0] ? `The key linked decision was “${projectDecisions[0].title}” because ${projectDecisions[0].summary}` : "No project decisions have been recorded yet."}`,
      evidence: [
        project.description,
        ...team.map((person) => `${person.name}: ${person.role}`),
        ...projectDecisions.map((decision) => `${decision.date}: ${decision.summary}`),
      ],
      path: pathFor([
        ...(client ? [{ title: client.name }] : []),
        { title: project.name, via: client ? "owns project" : undefined },
        ...(projectDecisions[0] ? [{ title: projectDecisions[0].title, via: "has decision" }] : []),
        ...(projectDecisions[0] && topicByName(projectDecisions[0].related_topics[0])
          ? [{ title: topicByName(projectDecisions[0].related_topics[0])!.name, via: "about" }]
          : []),
      ]),
    };
  }

  if (normalized.includes("finedge") && normalized.includes("lexora")) {
    const finEdge = projects.find((project) => project.name.toLowerCase().includes("finedge"));
    const lexora = projects.find((project) => project.name.toLowerCase().includes("lexora"));
    const handover = documents.find((document) => document.projects.includes(finEdge?.id ?? ""));
    const lexoraDecision = decisions.find((decision) => decision.project_id === lexora?.id);
    const sharedTopic = (handover?.topics ?? []).find((name) => lexora?.key_topics.includes(name));
    return {
      title: "FinEdge lesson reused for Lexora",
      answer: `${handover?.summary ?? "FinEdge has no linked handover document."} ${lexoraDecision ? `This supports Lexora’s later decision: ${lexoraDecision.summary}` : "No Lexora decision is linked yet."}`,
      evidence: [
        ...(handover ? [`${handover.label}: ${handover.summary}`] : []),
        ...(lexoraDecision ? [`${lexoraDecision.date}: ${lexoraDecision.summary}`] : []),
        ...slackMessages
          .filter((message) => message.text.toLowerCase().includes("finedge"))
          .map((message) => `Slack, ${message.user}: ${message.text}`),
      ],
      path: pathFor([
        ...(finEdge ? [{ title: finEdge.name }] : []),
        ...(handover ? [{ title: handover.label, via: "mentions" }] : []),
        ...(sharedTopic ? [{ title: sharedTopic, via: "covers" }] : []),
        ...(lexoraDecision ? [{ title: lexoraDecision.title, via: "about" }] : []),
      ]),
    };
  }

  if (normalized.includes("slack")) {
    const decision = decisions.find((item) => item.title.toLowerCase().includes("slack"));
    const project = decision?.project_id ? projectById(decision.project_id) : undefined;
    const relatedMessages = slackMessages.filter((message) =>
      message.text.toLowerCase().includes("slack"),
    );
    return {
      title: "Internal KB Slack scope decision",
      answer: `${decision?.summary ?? "No Slack decision has been recorded."} ${decision ? `It was made by ${personName(decision.made_by)} with ${decision.participants.map(personName).join(", ")} participating.` : ""}`,
      evidence: [
        ...(decision ? [`${decision.date}: ${decision.title}`] : []),
        ...relatedMessages.map((message) => `Slack, ${message.user}: ${message.text}`),
        ...(decision ? [`Related topics: ${decision.related_topics.join(", ")}`] : []),
      ],
      path: pathFor([
        ...(project ? [{ title: project.name }] : []),
        ...(decision ? [{ title: decision.title, via: "has decision" }] : []),
        ...(decision &&
        topicByName(decision.related_topics.find((name) => name === "Scope Control") ?? "")
          ? [{ title: "Scope Control", via: "about" }]
          : []),
        ...(relatedMessages[0]
          ? [{ title: `${relatedMessages[0].user} in #general`, via: "signalled by" }]
          : []),
      ]),
    };
  }

  const connected = graph.nodes.filter((node) =>
    graph.edges.some((edge) => edge.from === node.id || edge.to === node.id),
  );
  return {
    title: "Relationship-aware answer",
    answer:
      "The strongest matches are connected through projects, decisions, people, and topics. Try asking about Lexora, FinEdge lessons, MediSync discovery, or the Slack integration decision to see a richer explanation path.",
    evidence: connected.slice(0, 3).map((node) => `${node.label}: ${node.summary}`),
    path: [
      { title: "Projects" },
      { title: "People", via: "works on" },
      { title: "Decisions", via: "made by" },
      { title: "Topics", via: "about" },
    ],
  };
}

function emptyAnswer(projects: Project[]): AnswerResult {
  return {
    title: "No connected answer found",
    answer: "There is not enough linked knowledge to answer that question yet.",
    evidence: projects.slice(0, 3).map((project) => `${project.name}: ${project.description}`),
    path: [{ title: "Projects" }],
  };
}

export function getEntityRelationships(
  type: EntityKind,
  entityId: string,
  collections: KnowledgeCollections = knowledge,
) {
  const graph = buildKnowledgeGraph(collections);
  const entity =
    graph.nodes.find((node) => node.kind === type && node.id === entityId) ??
    graph.nodes.find((node) => node.id === entityId);

  if (!entity) {
    return {
      entity: graph.nodes.find((node) => node.kind === "project")!,
      relationships: [],
    };
  }

  const relationships = graph.edges
    .filter((edge) => edge.from === entity.id || edge.to === entity.id)
    .map((edge) => {
      const direction = edge.from === entity.id ? "outgoing" : "incoming";
      const targetId = edge.from === entity.id ? edge.to : edge.from;
      const target = graph.nodes.find((node) => node.id === targetId);

      return {
        direction,
        label: edge.label,
        target,
      };
    })
    .filter(
      (
        relationship,
      ): relationship is {
        direction: "incoming" | "outgoing";
        label: string;
        target: KnowledgeNode;
      } => relationship.target !== undefined,
    );

  return { entity, relationships };
}

function personById(people: Person[], personId: string) {
  return people.find((person) => person.id === personId)!;
}

function personIdByName(people: Person[], name: string) {
  return people.find((person) => person.name === name)?.id ?? "";
}

function topicIdByName(topics: Topic[], name: string) {
  return topics.find((topic) => topic.name === name)?.id ?? name;
}
