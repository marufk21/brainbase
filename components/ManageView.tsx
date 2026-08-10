"use client";

import { useState } from "react";
import Link from "next/link";
import { useKnowledge } from "@/components/knowledge-store";
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
    <div className="max-w-5xl">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-teal-700">
        Add / Edit
      </p>
      <h1 className="mt-2 text-3xl font-semibold tracking-normal md:text-4xl">
        Add knowledge
      </h1>
      <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
        Record a decision or a note/document and link it to the projects, people,
        and topics it relates to. Everything saved here appears in Knowledge and is
        used by Ask Brainbase.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {(["decision", "document"] as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => switchKind(k)}
            className={`border px-3 py-2 text-sm font-semibold transition ${
              kind === k
                ? "border-slate-950 bg-slate-950 text-white"
                : "border-slate-300 bg-white text-slate-700 hover:border-teal-500"
            }`}
          >
            {k === "decision" ? "Add Decision" : "Add Document / Note"}
          </button>
        ))}
      </div>

      {saved ? (
        <div className="mt-6 border border-teal-200 bg-teal-50 p-5">
          <p className="text-base font-semibold text-teal-900">
            Saved “{saved.label}”.
          </p>
          <p className="mt-1 text-sm text-teal-800">
            It is now part of the knowledge system and its relationships.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/knowledge?type=${saved.kind}&id=${saved.id}`}
              className="border border-slate-950 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
            >
              View in Knowledge
            </Link>
            <button
              onClick={() => setSaved(null)}
              className="border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
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
      className="mt-6 border border-slate-200 bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Decision title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Use structured retrieval over pure RAG for Lexora"
            className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Reasoning / summary
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="Why was this decided, and what does it mean going forward?"
            className="resize-none border border-slate-300 p-3 font-normal leading-7 outline-none focus:border-teal-700"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold">
            Project
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700"
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
              className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700"
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

        <div className="flex flex-wrap gap-3">
          <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
            {initial ? "Save changes" : "Save decision"}
          </button>
          {onDelete ? (
            <button
              type="button"
              onClick={onDelete}
              className="h-11 border border-rose-300 bg-white px-4 text-sm font-semibold text-rose-700 hover:bg-rose-50"
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
      className="mt-6 border border-slate-200 bg-white p-5"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <div className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold">
          Title / name
          <input
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            required
            placeholder="e.g. Lexora discovery notes"
            className="h-11 border border-slate-300 px-3 font-normal outline-none focus:border-teal-700"
          />
        </label>

        <label className="grid gap-2 text-sm font-semibold">
          Summary / note
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={4}
            placeholder="What does this document cover?"
            className="resize-none border border-slate-300 p-3 font-normal leading-7 outline-none focus:border-teal-700"
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

        <div className="flex flex-wrap gap-3">
          <button className="h-11 border border-slate-950 bg-slate-950 px-4 text-sm font-semibold text-white transition hover:bg-teal-800">
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
    <fieldset className="border border-slate-200 p-4">
      <legend className="px-2 text-sm font-semibold">{legend}</legend>
      {items.length > 0 ? (
        <div className="mt-2 grid gap-2 md:grid-cols-2">
          {items.map((item) => (
            <label key={item.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={selected.includes(item.id)}
                onChange={() => onToggle(item.id)}
              />
              {item.label}
            </label>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">Nothing available to link yet.</p>
      )}
    </fieldset>
  );
}

