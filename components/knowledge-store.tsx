"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  knowledge as seedKnowledge,
  type Client,
  type Decision,
  type Document,
  type KnowledgeCollections,
  type Person,
  type Project,
  type Topic,
} from "@/lib/knowledge";

const STORAGE_KEY = "brainbase.knowledge.v1";

type KnowledgeContextValue = {
  collections: KnowledgeCollections;
  upsertClient: (client: Client) => void;
  upsertPerson: (person: Person) => void;
  upsertProject: (project: Project) => void;
  upsertTopic: (topic: Topic) => void;
  upsertDecision: (decision: Decision) => void;
  upsertDocument: (document: Document) => void;
  removeEntity: (
    kind: "client" | "person" | "project" | "topic" | "decision" | "document",
    id: string,
  ) => void;
  reset: () => void;
};

const KnowledgeContext = createContext<KnowledgeContextValue | null>(null);

function cloneSeed(): KnowledgeCollections {
  return {
    clients: [...seedKnowledge.clients],
    people: [...seedKnowledge.people],
    projects: [...seedKnowledge.projects],
    decisions: [...seedKnowledge.decisions],
    topics: [...seedKnowledge.topics],
    documents: [...seedKnowledge.documents],
    slackMessages: [...seedKnowledge.slackMessages],
  };
}

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  // Do not read localStorage during initial render: server and browser must
  // render the same tree before client-side data hydration begins.
  const [collections, setCollections] = useState<KnowledgeCollections>(cloneSeed);

  useEffect(() => {
    fetch("/api/knowledge")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => {
        const topicId = new Map<string, { name: string }>(
          data.topics.map((x: { id: string; name: string }) => [x.id, x]),
        );
        const projectClient = new Map(
          data.edges.pc.map((x: { project_id: string; client_id: string }) => [
            x.project_id,
            x.client_id,
          ]),
        );
        const team = new Map<string, string[]>();
        data.edges.pt.forEach((x: { project_id: string; person_id: string; is_lead: boolean }) =>
          team.set(x.project_id, [...(team.get(x.project_id) ?? []), x.person_id]),
        );
        const lead = new Map(
          data.edges.pt
            .filter((x: { is_lead: boolean }) => x.is_lead)
            .map((x: { project_id: string; person_id: string }) => [x.project_id, x.person_id]),
        );
        const projectTopics = new Map<string, string[]>();
        data.edges.pj.forEach((x: { project_id: string; topic_id: string }) =>
          projectTopics.set(
            x.project_id,
            [...(projectTopics.get(x.project_id) ?? []), topicId.get(x.topic_id)?.name].filter(
              (name): name is string => Boolean(name),
            ),
          ),
        );
        const decisionProject = new Map(
          data.edges.dp.map((x: { decision_id: string; project_id: string }) => [
            x.decision_id,
            x.project_id,
          ]),
        );
        const decisionPeople = new Map<string, string[]>();
        data.edges.dpe.forEach(
          (x: { decision_id: string; person_id: string; relationship: string }) =>
            decisionPeople.set(x.decision_id, [
              ...(decisionPeople.get(x.decision_id) ?? []),
              x.person_id,
            ]),
        );
        const decisionOwner = new Map(
          data.edges.dpe
            .filter((x: { relationship: string }) => x.relationship === "owner")
            .map((x: { decision_id: string; person_id: string }) => [x.decision_id, x.person_id]),
        );
        const decisionTopics = new Map<string, string[]>();
        data.edges.dt.forEach((x: { decision_id: string; topic_id: string }) =>
          decisionTopics.set(
            x.decision_id,
            [...(decisionTopics.get(x.decision_id) ?? []), topicId.get(x.topic_id)?.name].filter(
              (name): name is string => Boolean(name),
            ),
          ),
        );
        setCollections({
          clients: data.clients.map(
            (x: {
              id: string;
              name: string;
              industry: string;
              company_size: string;
              primary_contact: string;
              status: string;
              notes: string;
            }) => ({
              id: x.id,
              name: x.name,
              industry: x.industry,
              size: x.company_size,
              primary_contact: x.primary_contact,
              status: x.status,
              notes: x.notes,
            }),
          ),
          people: data.people.map(
            (x: { id: string; name: string; role: string; email: string; skills: string[] }) => x,
          ),
          topics: data.topics.map((x: { id: string; name: string; description: string }) => x),
          projects: data.projects.map(
            (x: {
              id: string;
              name: string;
              status: string;
              start_date: string;
              end_date?: string;
              description: string;
            }) => ({
              ...x,
              client_id: projectClient.get(x.id) ?? null,
              lead: lead.get(x.id) ?? team.get(x.id)?.[0] ?? "",
              team: team.get(x.id) ?? [],
              key_topics: projectTopics.get(x.id) ?? [],
            }),
          ),
          decisions: data.decisions.map(
            (x: { id: string; title: string; summary: string; decided_at: string }) => ({
              id: x.id,
              title: x.title,
              summary: x.summary,
              date: x.decided_at,
              project_id: decisionProject.get(x.id) ?? null,
              made_by: decisionOwner.get(x.id) ?? "",
              participants: decisionPeople.get(x.id) ?? [],
              related_topics: decisionTopics.get(x.id) ?? [],
            }),
          ),
          documents: data.documents.map((x: { id: string; title: string; summary: string }) => ({
            id: x.id,
            label: x.title,
            summary: x.summary,
            projects: data.edges.docp
              .filter((edge: { document_id: string }) => edge.document_id === x.id)
              .map((edge: { project_id: string }) => edge.project_id),
            topics: data.edges.doct
              .filter((edge: { document_id: string }) => edge.document_id === x.id)
              .map((edge: { topic_id: string }) => topicId.get(edge.topic_id)?.name)
              .filter((name: string | undefined): name is string => Boolean(name)),
          })),
          slackMessages: [],
        });
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));
    } catch {
      // ignore storage failures
    }
  }, [collections]);

  const upsertDecision = useCallback((decision: Decision) => {
    setCollections((prev) => {
      const exists = prev.decisions.some((d) => d.id === decision.id);
      return {
        ...prev,
        decisions: exists
          ? prev.decisions.map((d) => (d.id === decision.id ? decision : d))
          : [decision, ...prev.decisions],
      };
    });
  }, []);

  const upsertClient = useCallback((client: Client) => {
    setCollections((prev) => ({
      ...prev,
      clients: prev.clients.some((item) => item.id === client.id)
        ? prev.clients.map((item) => (item.id === client.id ? client : item))
        : [client, ...prev.clients],
    }));
  }, []);

  const upsertPerson = useCallback((person: Person) => {
    setCollections((prev) => ({
      ...prev,
      people: prev.people.some((item) => item.id === person.id)
        ? prev.people.map((item) => (item.id === person.id ? person : item))
        : [person, ...prev.people],
    }));
  }, []);

  const upsertProject = useCallback((project: Project) => {
    setCollections((prev) => ({
      ...prev,
      projects: prev.projects.some((item) => item.id === project.id)
        ? prev.projects.map((item) => (item.id === project.id ? project : item))
        : [project, ...prev.projects],
    }));
  }, []);

  const upsertTopic = useCallback((topic: Topic) => {
    setCollections((prev) => ({
      ...prev,
      topics: prev.topics.some((item) => item.id === topic.id)
        ? prev.topics.map((item) => (item.id === topic.id ? topic : item))
        : [topic, ...prev.topics],
    }));
  }, []);

  const upsertDocument = useCallback((document: Document) => {
    setCollections((prev) => {
      const exists = prev.documents.some((d) => d.id === document.id);
      return {
        ...prev,
        documents: exists
          ? prev.documents.map((d) => (d.id === document.id ? document : d))
          : [document, ...prev.documents],
      };
    });
  }, []);

  const removeEntity = useCallback(
    (
      kind: KnowledgeContextValue["removeEntity"] extends (kind: infer K, id: string) => void
        ? K
        : never,
      id: string,
    ) => {
      setCollections((prev) => {
        if (kind === "client") {
          return {
            ...prev,
            clients: prev.clients.filter((item) => item.id !== id),
            projects: prev.projects.map((project) =>
              project.client_id === id ? { ...project, client_id: null } : project,
            ),
          };
        }
        if (kind === "project") {
          return {
            ...prev,
            projects: prev.projects.filter((item) => item.id !== id),
            decisions: prev.decisions.map((decision) =>
              decision.project_id === id ? { ...decision, project_id: null } : decision,
            ),
            documents: prev.documents.map((document) => ({
              ...document,
              projects: document.projects.filter((projectId) => projectId !== id),
            })),
          };
        }
        if (kind === "person") {
          const remainingPeople = prev.people.filter((item) => item.id !== id);
          return {
            ...prev,
            people: remainingPeople,
            projects: prev.projects.map((project) => ({
              ...project,
              lead:
                project.lead === id
                  ? (project.team.find((personId) => personId !== id) ??
                    remainingPeople[0]?.id ??
                    "")
                  : project.lead,
              team: project.team.filter((personId) => personId !== id),
            })),
            decisions: prev.decisions.map((decision) => ({
              ...decision,
              made_by: decision.made_by === id ? (remainingPeople[0]?.id ?? "") : decision.made_by,
              participants: decision.participants.filter((personId) => personId !== id),
            })),
          };
        }
        if (kind === "topic") {
          const topicName = prev.topics.find((item) => item.id === id)?.name;
          return {
            ...prev,
            topics: prev.topics.filter((item) => item.id !== id),
            projects: prev.projects.map((project) => ({
              ...project,
              key_topics: project.key_topics.filter((name) => name !== topicName),
            })),
            decisions: prev.decisions.map((decision) => ({
              ...decision,
              related_topics: decision.related_topics.filter((name) => name !== topicName),
            })),
            documents: prev.documents.map((document) => ({
              ...document,
              topics: document.topics.filter((name) => name !== topicName),
            })),
          };
        }
        return kind === "decision"
          ? {
              ...prev,
              decisions: prev.decisions.filter((item) => item.id !== id),
            }
          : {
              ...prev,
              documents: prev.documents.filter((item) => item.id !== id),
            };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setCollections(cloneSeed());
  }, []);

  const value = useMemo(
    () => ({
      collections,
      upsertClient,
      upsertPerson,
      upsertProject,
      upsertTopic,
      upsertDecision,
      upsertDocument,
      removeEntity,
      reset,
    }),
    [
      collections,
      upsertClient,
      upsertPerson,
      upsertProject,
      upsertTopic,
      upsertDecision,
      upsertDocument,
      removeEntity,
      reset,
    ],
  );

  return <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>;
}

export function useKnowledge() {
  const context = useContext(KnowledgeContext);
  if (!context) {
    throw new Error("useKnowledge must be used within KnowledgeProvider");
  }
  return context;
}

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
