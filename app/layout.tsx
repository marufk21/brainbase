import type { Metadata } from "next";
import "./globals.css";
import { KnowledgeProvider } from "@/components/knowledge-store";

export const metadata: Metadata = {
  title: "Brainbase",
  description: "Connected knowledge system for AI consulting teams",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <KnowledgeProvider>{children}</KnowledgeProvider>
      </body>
    </html>
  );
}
