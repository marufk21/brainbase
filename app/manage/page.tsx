import { AppShell } from "@/components/app-shell";
import { ManageView } from "@/components/manage-view";

const manageKinds = ["client", "person", "project", "topic", "decision", "document"] as const;
type ManageKind = (typeof manageKinds)[number];

export default async function ManagePage(props: PageProps<"/manage">) {
  const searchParams = await props.searchParams;
  const editKind = manageKinds.includes(searchParams.kind as ManageKind)
    ? (searchParams.kind as ManageKind)
    : undefined;
  const editId = typeof searchParams.id === "string" ? searchParams.id : undefined;

  return (
    <AppShell>
      <ManageView editKind={editKind} editId={editId} />
    </AppShell>
  );
}
