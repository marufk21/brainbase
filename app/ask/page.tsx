import { AppShell } from "@/components/app-shell";
import { AskView } from "@/components/ask-view";

export default async function AskPage(props: PageProps<"/ask">) {
  const searchParams = await props.searchParams;
  // Deep links (/ask?q=...) only pre-fill the draft; the answer never
  // appears until the user explicitly submits the question form.
  const question =
    typeof searchParams.q === "string" && searchParams.q.trim() ? searchParams.q : "";

  return (
    <AppShell>
      <AskView initialQuestion={question} />
    </AppShell>
  );
}
