"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { fetchKnowledgeSnapshot } from "@/lib/client/api-client";
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

/** Reads back locally persisted collections so edits survive reloads without a DB. */
function readStoredCollections(): KnowledgeCollections | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as KnowledgeCollections;
    const keys = [
      "clients",
      "people",
      "projects",
      "decisions",
      "topics",
      "documents",
      "slackMessages",
    ] as const;
    if (!keys.every((key) => Array.isArray(parsed[key]))) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  // Do not read localStorage during initial render: server and browser must
  // render the same tree before client-side data hydration begins.
  const [collections, setCollections] = useState<KnowledgeCollections>(cloneSeed);

  useEffect(() => {
    let cancelled = false;
    // The database snapshot wins when available; otherwise fall back to the
    // locally persisted collections so CRUD edits survive a reload.
    fetchKnowledgeSnapshot()
      .then((snapshot) => {
        if (!cancelled) setCollections(snapshot);
      })
      .catch(() => {
        if (cancelled) return;
        const stored = readStoredCollections();
        if (stored) setCollections(stored);
      });
    return () => {
      cancelled = true;
    };
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
