import { AppShell } from "@/components/AppShell";
import { AskView } from "@/components/AskView";
import { sampleQuestions } from "@/lib/knowledge";

export default async function AskPage(props: PageProps<"/ask">) {
  const searchParams = await props.searchParams;
  const question =
    typeof searchParams.q === "string" && searchParams.q.trim()
      ? searchParams.q
      : sampleQuestions[0];

  return (
    <AppShell>
      <AskView initialQuestion={question} />
    </AppShell>
  );
}
