"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  knowledge as seedKnowledge,
  type Decision,
  type Document,
  type KnowledgeCollections,
} from "@/lib/knowledge";

const STORAGE_KEY = "brainbase.knowledge.v1";

type KnowledgeContextValue = {
  collections: KnowledgeCollections;
  upsertDecision: (decision: Decision) => void;
  upsertDocument: (document: Document) => void;
  removeEntity: (kind: "decision" | "document", id: string) => void;
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

function loadInitial(): KnowledgeCollections {
  if (typeof window === "undefined") return cloneSeed();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return cloneSeed();
    const parsed = JSON.parse(raw) as Partial<KnowledgeCollections>;
    return {
      clients: parsed.clients ?? seedKnowledge.clients,
      people: parsed.people ?? seedKnowledge.people,
      projects: parsed.projects ?? seedKnowledge.projects,
      decisions: parsed.decisions ?? seedKnowledge.decisions,
      topics: parsed.topics ?? seedKnowledge.topics,
      documents: parsed.documents ?? seedKnowledge.documents,
      slackMessages: parsed.slackMessages ?? seedKnowledge.slackMessages,
    };
  } catch {
    return cloneSeed();
  }
}

export function KnowledgeProvider({ children }: { children: React.ReactNode }) {
  const [collections, setCollections] = useState<KnowledgeCollections>(loadInitial);

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

  const removeEntity = useCallback((kind: "decision" | "document", id: string) => {
    setCollections((prev) =>
      kind === "decision"
        ? { ...prev, decisions: prev.decisions.filter((d) => d.id !== id) }
        : { ...prev, documents: prev.documents.filter((d) => d.id !== id) },
    );
  }, []);

  const reset = useCallback(() => {
    setCollections(cloneSeed());
  }, []);

  const value = useMemo(
    () => ({ collections, upsertDecision, upsertDocument, removeEntity, reset }),
    [collections, upsertDecision, upsertDocument, removeEntity, reset],
  );

  return (
    <KnowledgeContext.Provider value={value}>{children}</KnowledgeContext.Provider>
  );
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
