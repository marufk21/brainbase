"use client";

import { useState } from "react";
import Link from "next/link";
import { useKnowledge } from "@/components/knowledge-store";
import { CheckCircleIcon, PlusIcon } from "@/components/icons";
import type { Client, Decision, Document, Person, Project, Topic } from "@/lib/knowledge";
import {
    ClientForm,
    DecisionForm,
    DocumentForm,
    PersonForm,
    ProjectForm,
    TopicForm,
} from "@/components/manage/entity-forms";
import { kinds, type EntityRecord, type Kind, type Saved } from "@/components/manage/types";

const labels: Record<Kind, string> = {
    client: "Client",
    person: "Person",
    project: "Project",
    topic: "Topic",
    decision: "Decision",
    document: "Document / Note",
};

export type { Kind } from "@/components/manage/types";

export function ManageView({ editKind, editId }: { editKind?: Kind; editId?: string }) {
    const store = useKnowledge();
    const [kind, setKind] = useState<Kind>(editKind ?? "decision");
    const [saved, setSaved] = useState<Saved | null>(null);
    const initial = editKind && editId ? findInitial(editKind, editId, store.collections) : undefined;
    const done = (item: Saved) => setSaved(item);
    const remove = (item: Saved) => {
        store.removeEntity(item.kind, item.id);
        done(item);
    };

    return (
        <div className="mx-auto w-full max-w-4xl">
            <p className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-teal-700 ring-1 ring-teal-100">
                <PlusIcon className="h-3.5 w-3.5" />
                Add / Edit
            </p>
            <h1 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">Manage knowledge</h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Create, update, or remove clients, people, projects, topics, decisions, and documents.
                Linked records update the knowledge graph immediately.
            </p>
            <div className="mt-6 flex flex-wrap gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
                {kinds.map((item) => (
                    <button
                        key={item}
                        onClick={() => {
                            setKind(item);
                            setSaved(null);
                        }}
                        className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${kind === item ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"}`}
                    >
                        Add {labels[item]}
                    </button>
                ))}
            </div>
            {saved ? (
                <SavedNotice saved={saved} onMore={() => setSaved(null)} />
            ) : (
                <Editor
                    kind={kind}
                    initial={initial}
                    onSave={done}
                    onDelete={
                        initial
                            ? () =>
                                remove({
                                    kind: editKind!,
                                    id: editId!,
                                    label: labelOf(initial),
                                })
                            : undefined
                    }
                />
            )}
        </div>
    );
}

function SavedNotice({ saved, onMore }: { saved: Saved; onMore: () => void }) {
    return (
        <div className="mt-6 rounded-2xl border border-teal-200 bg-teal-50 p-6 shadow-sm">
            <div className="flex gap-3">
                <CheckCircleIcon className="mt-0.5 h-6 w-6 shrink-0 text-teal-600" />
                <div>
                    <p className="font-semibold text-teal-900">Saved “{saved.label}”.</p>
                    <p className="mt-1 text-sm text-teal-800">Its connected knowledge is now updated.</p>
                </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
                <Link
                    href={`/knowledge?type=${saved.kind}&id=${saved.id}`}
                    className="rounded-xl bg-slate-950 px-4 py-2.5 text-sm font-semibold text-white"
                >
                    View in Knowledge
                </Link>
                <button
                    onClick={onMore}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold"
                >
                    Add another
                </button>
            </div>
        </div>
    );
}

function Editor({
    kind,
    initial,
    onSave,
    onDelete,
}: {
    kind: Kind;
    initial?: EntityRecord;
    onSave: (saved: Saved) => void;
    onDelete?: () => void;
}) {
    const store = useKnowledge();
    if (kind === "client")
        return (
            <ClientForm
                initial={initial as Client | undefined}
                onSave={(item) => {
                    store.upsertClient(item);
                    onSave({ kind, id: item.id, label: item.name });
                }}
                onDelete={onDelete}
            />
        );
    if (kind === "person")
        return (
            <PersonForm
                initial={initial as Person | undefined}
                onSave={(item) => {
                    store.upsertPerson(item);
                    onSave({ kind, id: item.id, label: item.name });
                }}
                onDelete={onDelete}
            />
        );
    if (kind === "topic")
        return (
            <TopicForm
                initial={initial as Topic | undefined}
                onSave={(item) => {
                    store.upsertTopic(item);
                    onSave({ kind, id: item.id, label: item.name });
                }}
                onDelete={onDelete}
            />
        );
    if (kind === "project")
        return (
            <ProjectForm
                initial={initial as Project | undefined}
                clients={store.collections.clients}
                people={store.collections.people}
                topics={store.collections.topics}
                onSave={(item) => {
                    store.upsertProject(item);
                    onSave({ kind, id: item.id, label: item.name });
                }}
                onDelete={onDelete}
            />
        );
    if (kind === "decision")
        return (
            <DecisionForm
                initial={initial as Decision | undefined}
                projects={store.collections.projects}
                people={store.collections.people}
                topics={store.collections.topics}
                onSave={(item) => {
                    store.upsertDecision(item);
                    onSave({ kind, id: item.id, label: item.title });
                }}
                onDelete={onDelete}
            />
        );
    return (
        <DocumentForm
            initial={initial as Document | undefined}
            projects={store.collections.projects}
            topics={store.collections.topics}
            onSave={(item) => {
                store.upsertDocument(item);
                onSave({ kind, id: item.id, label: item.label });
            }}
            onDelete={onDelete}
        />
    );
}

function labelOf(item: EntityRecord) {
    return "name" in item ? item.name : "title" in item ? item.title : item.label;
}

function findInitial(
    kind: Kind,
    id: string,
    collections: ReturnType<typeof useKnowledge>["collections"],
) {
    const map = {
        client: collections.clients,
        person: collections.people,
        project: collections.projects,
        topic: collections.topics,
        decision: collections.decisions,
        document: collections.documents,
    };
    return map[kind].find((item) => item.id === id);
}
