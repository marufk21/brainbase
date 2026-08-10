import type { Metadata } from "next";
import { LoginView } from "@/components/LoginView";

export const metadata: Metadata = {
  title: "Sign in · Brainbase",
};

export default function LoginPage() {
  return <LoginView />;
}
