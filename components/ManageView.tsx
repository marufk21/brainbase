"use client";

import { useState } from "react";
import Link from "next/link";
import { useKnowledge } from "@/components/knowledge-store";
import { CheckCircleIcon, PlusIcon } from "@/components/icons";
import type {
  Decision,
  Document,
  Person,
  Project,
  Topic,
} from "@/lib/knowledge";

type Kind = "decision" | "document";

export function ManageView({
  editKind,
  editId,
}: {
  editKind?: Kind;
  editId?: string;
}) {
  const { collections, upsertDecision, upsertDocument, removeEntity } =
    useKnowledge();
  const [kind, setKind] = useState<Kind>(editKind ?? "decision");
  const [saved, setSaved] = useState<{
    kind: Kind;
    id: string;
    label: string;
  } | null>(null);

  const switchKind = (next: Kind) => {
    setKind(next);
    setSaved(null);
  };

  const editingDecision =
    editKind === "decision" && editId
      ? collections.decisions.find((d) => d.id === editId)
      : undefined;
  const editingDocument =
    editKind === "document" && editId
      ? collections.documents.find((d) => d.id === editId)
      : undefined;

  return (
    <div className="mx-auto w-full max-w-4xl">
      <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
        <PlusIcon className="h-3.5 w-3.5" />
        Add / Edit
      </p>
      <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
        Add knowledge
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
        Record a decision or a note/document and link it to the projects,
        people, and topics it relates to. Everything saved here appears in
        Knowledge and is used by Ask Brainbase.
      </p>

      <div className="mt-6 inline-flex w-full gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm sm:w-auto">
        {(["decision", "document"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none ${
              kind === k
                ? "bg-slate-950 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            }`}
          >
            {k === "decision" ? "Add Decision" : "Add Document / Note"}
          </button>
        ))}
      </div>

      {saved ? (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
            <div>
              <p className="text-base font-semibold text-teal-900">
                Saved “{saved.label}”.
              </p>
              <p className="mt-1 text-sm text-teal-800">
                It is now part of the knowledge system and its relationships.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/knowledge?type=${saved.kind}&id=${saved.id}`}
              className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800"
            >
              View in Knowledge
            </Link>
            <button
              onClick={() => setSaved(null)}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-teal-500"
            >
              Add another
            </button>
          </div>
        </div>
      ) : kind === "decision" ? (
        <DecisionForm
          projects={collections.projects}
          people={collections.people}
          topics={collections.topics}
          initial={editingDecision}
          onSave={(decision) => {
            upsertDecision(decision);
            setSaved({ kind: "decision", id: decision.id, label: decision.title });
          }}
          onDelete={
            editingDecision
              ? () => {
                  removeEntity("decision", editingDecision.id);
                  setSaved({
                    kind: "decision",
                    id: editingDecision.id,
                    label: editingDecision.title,
                  });
                }
              : undefined
          }
        />
      ) : (
        <DocumentForm
          projects={collections.projects}
          topics={collections.topics}
          initial={editingDocument}
          onSave={(document) => {
            upsertDocument(document);
            setSaved({ kind: "document", id: document.id, label: document.label });
          }}
        />
      )}
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 font-normal outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20";

function DecisionForm({
  projects,
  people,
  topics,
  initial,
  onSave,
  onDelete,
}: {
  projects: Project[];
  people: Person[];
  topics: Topic[];
  initial?: Decision;
  onSave: (decision: Decision) => void;
  onDelete?: () => void;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [projectId, setProjectId] = useState(initial?.project_id ?? "");
  const [madeBy, setMadeBy] = useState(initial?.made_by ?? "");
  const [participants, setParticipants] = useState<string[]>(
    initial?.participants ?? [],
  );
  const [topicIds, setTopicIds] = useState<string[]>(
    (initial?.related_topics ?? [])
      .map((name) => topics.find((t) => t.name === name)?.id ?? "")
      .filter(Boolean),
  );

  const toggle = (
    list: string[],
    setList: (next: string[]) => void,
    value: string,
  ) => setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = () => {
    if (!title.trim()) return;
    onSave({
      id: initial?.id ?? String(Date.now()),
      title: title.trim(),
      date: initial?.date ?? new Date().toISOString().slice(0, 10),
      project_id: projectId || null,
      made_by: madeBy || people[0]?.id || "",
      participants,
      summary: summary.trim(),
      related_topics: topicIds
        .map((id) => topics.find((t) => t.id === id)?.name ?? "")
        .filter(Boolean),
    });
  };

  return (
    <form
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">
          Decision title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Use structured retrieval over pure RAG for Lexora"
            className={inputClass}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Reasoning / summary
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="Why was this decided, and what does it mean going forward?"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 font-normal leading-7 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Project
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className={inputClass}
            >
              <option value="">None (internal)</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm font-semibold">
            Made by
            <select
              value={madeBy}
              onChange={(e) => setMadeBy(e.target.value)}
              className={inputClass}
            >
              {people.map((person) => (
                <option key={person.id} value={person.id}>
                  {person.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <CheckboxGroup
          legend="People involved"
          items={people.map((p) => ({ id: p.id, label: p.name }))}
          selected={participants}
          onToggle={(id) => toggle(participants, setParticipants, id)}
        />

        <CheckboxGroup
          legend="Related topics"
          items={topics.map((t) => ({ id: t.id, label: t.name }))}
          selected={topicIds}
          onToggle={(id) => toggle(topicIds, setTopicIds, id)}
        />

        <div className="flex flex-wrap gap-3 pt-1">
          <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]">
            {initial ? "Save changes" : "Save decision"}
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-11 rounded-xl border border-rose-300 bg-white px-5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              Delete
            </button>
          ) : null}
        </div>
      </div>
    </form>
  );
}

function DocumentForm({
  projects,
  topics,
  initial,
  onSave,
}: {
  projects: Project[];
  topics: Topic[];
  initial?: Document;
  onSave: (document: Document) => void;
}) {
  const [label, setLabel] = useState(initial?.label ?? "");
  const [summary, setSummary] = useState(initial?.summary ?? "");
  const [projectIds, setProjectIds] = useState<string[]>(initial?.projects ?? []);
  const [topicIds, setTopicIds] = useState<string[]>(
    (initial?.topics ?? [])
      .map((name) => topics.find((t) => t.name === name)?.id ?? "")
      .filter(Boolean),
  );

  const toggle = (
    list: string[],
    setList: (next: string[]) => void,
    value: string,
  ) => setList(list.includes(value) ? list.filter((v) => v !== value) : [...list, value]);

  const submit = () => {
    if (!label.trim()) return;
    onSave({
      id: initial?.id ?? String(Date.now()),
      label: label.trim(),
      summary: summary.trim(),
      projects: projectIds,
      topics: topicIds
        .map((id) => topics.find((t) => t.id === id)?.name ?? "")
        .filter(Boolean),
    });
  };

  return (
    <form
      className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm font-semibold">
          Title / name
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="e.g. Lexora discovery notes"
            className={inputClass}
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Summary / note
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="What does this document cover?"
            className="w-full resize-none rounded-xl border border-slate-300 bg-white p-3.5 font-normal leading-7 outline-none transition focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
          />
        </label>

        <CheckboxGroup
          legend="Related projects"
          items={projects.map((p) => ({ id: p.id, label: p.name }))}
          selected={projectIds}
          onToggle={(id) => toggle(projectIds, setProjectIds, id)}
        />

        <CheckboxGroup
          legend="Related topics"
          items={topics.map((t) => ({ id: t.id, label: t.name }))}
          selected={topicIds}
          onToggle={(id) => toggle(topicIds, setTopicIds, id)}
        />

        <div className="flex flex-wrap gap-3 pt-1">
          <button className="h-11 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-800 active:scale-[0.99]">
            {initial ? "Save changes" : "Save document"}
          </button>
        </div>
      </div>
    </form>
  );
}

function CheckboxGroup({
  legend,
  items,
  selected,
  onToggle,
}: {
  legend: string;
  items: { id: string; label: string }[];
  selected: string[];
  onToggle: (id: string) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-slate-200 p-4">
      <legend className="px-2 text-sm font-semibold">{legend}</legend>
      {items.length > 0 ? (
        <div className="mt-1 grid gap-2 sm:grid-cols-2">
          {items.map((item) => {
            const checked = selected.includes(item.id);
            return (
              <label
                key={item.id}
                className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm font-medium transition ${
                  checked
                    ? "border-teal-500 bg-teal-50 text-teal-900"
                    : "border-slate-200 bg-white text-slate-700 hover:border-teal-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.id)}
                  className="h-4 w-4 shrink-0 accent-teal-600"
                />
                {item.label}
              </label>
            );
          })}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Nothing available to link yet.</p>
      )}
    </fieldset>
  );
}
