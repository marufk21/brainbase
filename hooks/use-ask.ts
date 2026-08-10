"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { askRemoteQuestion } from "@/lib/client/api-client";
import type { AskResult } from "@/lib/types";

/**
 * Owns the DB-backed answer request (POST /api/ask).
 * The local deterministic engine in lib/knowledge.ts stays the always-available
 * fallback; this hook layers the database answer on top with loading/error state.
 */
export function useAsk(initialQuestion: string) {
  const [remote, setRemote] = useState<AskResult | null>(null);
  const [isLoading, setIsLoading] = useState(() => Boolean(initialQuestion.trim()));
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);

  const run = useCallback((question: string) => {
    const requestId = ++requestIdRef.current;
    askRemoteQuestion(question)
      .then((result) => {
        if (requestIdRef.current === requestId) setRemote(result);
      })
      .catch(() => {
        if (requestIdRef.current !== requestId) return;
        setRemote(null);
        setError("Database-backed answer unavailable — showing the local knowledge engine.");
      })
      .finally(() => {
        if (requestIdRef.current === requestId) setIsLoading(false);
      });
  }, []);

  const ask = useCallback(
    (question: string) => {
      if (!question.trim()) return;
      setIsLoading(true);
      setError(null);
      run(question);
    },
    [run],
  );

  // Deep links (/ask?q=...) should hit the DB engine too, not only the local one.
  useEffect(() => {
    if (initialQuestion.trim()) run(initialQuestion);
  }, [initialQuestion, run]);

  return { remote, isLoading, error, ask };
}
