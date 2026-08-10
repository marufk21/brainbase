import { AppShell } from "@/components/AppShell";
import { KnowledgeView } from "@/components/KnowledgeView";

const tabs = ["project", "person", "client", "decision", "document", "topic"] as const;

type TabKind = (typeof tabs)[number];

export default async function KnowledgePage(props: PageProps<"/knowledge">) {
  const searchParams = await props.searchParams;
  const selectedType = tabs.includes(searchParams.type as TabKind)
    ? (searchParams.type as TabKind)
    : "project";
  const selectedId = typeof searchParams.id === "string" ? searchParams.id : undefined;

  return (
    <AppShell>
      <KnowledgeView initialType={selectedType} initialId={selectedId} />
    </AppShell>
  );
}
