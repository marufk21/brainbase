"use client";

import { useState } from "react";
import type { Client, Decision, Document, Person, Project, Topic } from "@/lib/knowledge";
import { Area, Checks, Field, Form, Select } from "@/components/manage/form-controls";
import { makeId, splitList, type FormProps } from "@/components/manage/types";

export function ClientForm({ initial, onSave, onDelete }: FormProps<Client>) {
    const [name, setName] = useState(initial?.name ?? "");
    const [industry, setIndustry] = useState(initial?.industry ?? "");
    const [size, setSize] = useState(initial?.size ?? "");
    const [contact, setContact] = useState(initial?.primary_contact ?? "");
    const [status, setStatus] = useState(initial?.status ?? "Active");
    const [notes, setNotes] = useState(initial?.notes ?? "");
    return (
        <Form
            onSubmit={() =>
                onSave({
                    id: initial?.id ?? makeId("client"),
                    name,
                    industry,
                    size,
                    primary_contact: contact,
                    status,
                    notes,
                })
            }
            onDelete={onDelete}
        >
            <Field label="Client name" value={name} setValue={setName} required />
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Industry" value={industry} setValue={setIndustry} />
                <Field label="Size" value={size} setValue={setSize} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Primary contact" value={contact} setValue={setContact} />
                <Field label="Status" value={status} setValue={setStatus} />
            </div>
            <Area label="Notes" value={notes} setValue={setNotes} />
        </Form>
    );
}

export function PersonForm({ initial, onSave, onDelete }: FormProps<Person>) {
    const [name, setName] = useState(initial?.name ?? "");
    const [role, setRole] = useState(initial?.role ?? "");
    const [email, setEmail] = useState(initial?.email ?? "");
    const [skills, setSkills] = useState(initial?.skills.join(", ") ?? "");
    return (
        <Form
            onSubmit={() =>
                onSave({
                    id: initial?.id ?? makeId("person"),
                    name,
                    role,
                    email,
                    skills: splitList(skills),
                })
            }
            onDelete={onDelete}
        >
            <Field label="Full name" value={name} setValue={setName} required />
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Role" value={role} setValue={setRole} />
                <Field label="Email" value={email} setValue={setEmail} type="email" />
            </div>
            <Field label="Skills (comma separated)" value={skills} setValue={setSkills} />
        </Form>
    );
}

export function TopicForm({ initial, onSave, onDelete }: FormProps<Topic>) {
    const [name, setName] = useState(initial?.name ?? "");
    const [description, setDescription] = useState(initial?.description ?? "");
    return (
        <Form
            onSubmit={() => onSave({ id: initial?.id ?? makeId("topic"), name, description })}
            onDelete={onDelete}
        >
            <Field label="Topic name" value={name} setValue={setName} required />
            <Area label="Description" value={description} setValue={setDescription} />
        </Form>
    );
}

export function ProjectForm({
    initial,
    clients,
    people,
    topics,
    onSave,
    onDelete,
}: FormProps<Project> & {
    clients: Client[];
    people: Person[];
    topics: Topic[];
}) {
    const [name, setName] = useState(initial?.name ?? "");
    const [clientId, setClientId] = useState(initial?.client_id ?? "");
    const [status, setStatus] = useState(initial?.status ?? "In Progress");
    const [start, setStart] = useState(initial?.start_date ?? new Date().toISOString().slice(0, 10));
    const [end, setEnd] = useState(initial?.end_date ?? "");
    const [lead, setLead] = useState(initial?.lead ?? people[0]?.id ?? "");
    const [team, setTeam] = useState(initial?.team ?? []);
    const [topicNames, setTopicNames] = useState(initial?.key_topics ?? []);
    const [description, setDescription] = useState(initial?.description ?? "");
    return (
        <Form
            onSubmit={() =>
                onSave({
                    id: initial?.id ?? makeId("project"),
                    name,
                    client_id: clientId || null,
                    status,
                    start_date: start,
                    ...(end ? { end_date: end } : {}),
                    lead,
                    team,
                    key_topics: topicNames,
                    description,
                })
            }
            onDelete={onDelete}
        >
            <Field label="Project name" value={name} setValue={setName} required />
            <Area label="Description" value={description} setValue={setDescription} />
            <div className="grid gap-5 md:grid-cols-2">
                <Select
                    label="Client"
                    value={clientId}
                    setValue={setClientId}
                    items={clients.map((item) => ({ id: item.id, label: item.name }))}
                    empty="Internal project"
                />
                <Field label="Status" value={status} setValue={setStatus} />
            </div>
            <div className="grid gap-5 md:grid-cols-2">
                <Field label="Start date" value={start} setValue={setStart} type="date" />
                <Field label="End date" value={end} setValue={setEnd} type="date" />
            </div>
            <Select
                label="Project lead"
                value={lead}
                setValue={setLead}
                items={people.map((item) => ({ id: item.id, label: item.name }))}
            />
            <Checks
                legend="Team members"
                items={people.map((item) => ({ id: item.id, label: item.name }))}
                selected={team}
                setSelected={setTeam}
            />
            <Checks
                legend="Key topics"
                items={topics.map((item) => ({ id: item.name, label: item.name }))}
                selected={topicNames}
                setSelected={setTopicNames}
            />
        </Form>
    );
}

export function DecisionForm({
    initial,
    projects,
    people,
    topics,
    onSave,
    onDelete,
}: FormProps<Decision> & {
    projects: Project[];
    people: Person[];
    topics: Topic[];
}) {
    const [title, setTitle] = useState(initial?.title ?? "");
    const [summary, setSummary] = useState(initial?.summary ?? "");
    const [projectId, setProjectId] = useState(initial?.project_id ?? "");
    const [madeBy, setMadeBy] = useState(initial?.made_by ?? people[0]?.id ?? "");
    const [participants, setParticipants] = useState(initial?.participants ?? []);
    const [topicNames, setTopicNames] = useState(initial?.related_topics ?? []);
    return (
        <Form
            onSubmit={() =>
                onSave({
                    id: initial?.id ?? makeId("decision"),
                    title,
                    date: initial?.date ?? new Date().toISOString().slice(0, 10),
                    project_id: projectId || null,
                    made_by: madeBy,
                    participants,
                    summary,
                    related_topics: topicNames,
                })
            }
            onDelete={onDelete}
        >
            <Field label="Decision title" value={title} setValue={setTitle} required />
            <Area label="Reasoning / summary" value={summary} setValue={setSummary} />
            <div className="grid gap-5 md:grid-cols-2">
                <Select
                    label="Project"
                    value={projectId}
                    setValue={setProjectId}
                    items={projects.map((item) => ({ id: item.id, label: item.name }))}
                    empty="None (internal)"
                />
                <Select
                    label="Made by"
                    value={madeBy}
                    setValue={setMadeBy}
                    items={people.map((item) => ({ id: item.id, label: item.name }))}
                />
            </div>
            <Checks
                legend="People involved"
                items={people.map((item) => ({ id: item.id, label: item.name }))}
                selected={participants}
                setSelected={setParticipants}
            />
            <Checks
                legend="Related topics"
                items={topics.map((item) => ({ id: item.name, label: item.name }))}
                selected={topicNames}
                setSelected={setTopicNames}
            />
        </Form>
    );
}

export function DocumentForm({
    initial,
    projects,
    topics,
    onSave,
    onDelete,
}: FormProps<Document> & { projects: Project[]; topics: Topic[] }) {
    const [label, setLabel] = useState(initial?.label ?? "");
    const [summary, setSummary] = useState(initial?.summary ?? "");
    const [projectIds, setProjectIds] = useState(initial?.projects ?? []);
    const [topicNames, setTopicNames] = useState(initial?.topics ?? []);
    return (
        <Form
            onSubmit={() =>
                onSave({
                    id: initial?.id ?? makeId("document"),
                    label,
                    summary,
                    projects: projectIds,
                    topics: topicNames,
                })
            }
            onDelete={onDelete}
        >
            <Field label="Title / name" value={label} setValue={setLabel} required />
            <Area label="Summary / note" value={summary} setValue={setSummary} />
            <Checks
                legend="Related projects"
                items={projects.map((item) => ({ id: item.id, label: item.name }))}
                selected={projectIds}
                setSelected={setProjectIds}
            />
            <Checks
                legend="Related topics"
                items={topics.map((item) => ({ id: item.name, label: item.name }))}
                selected={topicNames}
                setSelected={setTopicNames}
            />
        </Form>
    );
}
