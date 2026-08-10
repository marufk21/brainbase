import { AppShell } from "@/components/AppShell";
import { ManageView } from "@/components/ManageView";

type ManageKind = "decision" | "document";

export default async function ManagePage(props: PageProps<"/manage">) {
  const searchParams = await props.searchParams;
  const editKind =
    searchParams.kind === "decision" || searchParams.kind === "document"
      ? (searchParams.kind as ManageKind)
      : undefined;
  const editId =
    typeof searchParams.id === "string" ? searchParams.id : undefined;

  return (
    <AppShell>
      <ManageView editKind={editKind} editId={editId} />
    </AppShell>
  );
}