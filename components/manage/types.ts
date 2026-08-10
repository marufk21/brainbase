import type { Client, Decision, Document, Person, Project, Topic } from "@/lib/knowledge";

export const kinds = ["client", "person", "project", "topic", "decision", "document"] as const;
export type Kind = (typeof kinds)[number];
export type Saved = { kind: Kind; id: string; label: string };
export type EntityRecord = Client | Person | Project | Topic | Decision | Document;

export type FormProps<T> = {
  initial?: T;
  onSave: (item: T) => void;
  onDelete?: () => void;
};

export function makeId(prefix: string) {
  return `${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export function splitList(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}
