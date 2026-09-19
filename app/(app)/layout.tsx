import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { BottomNav } from "@/components/bottom-nav";
import { getSessionUser } from "@/lib/session";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/welcome");

  return <AppShell bottomNav={<BottomNav />}>{children}</AppShell>;
}
