import type { ReactNode } from "react";
import { AppShell } from "@/components/app-shell";
import { BottomNav } from "@/components/bottom-nav";

export default function AppGroupLayout({ children }: { children: ReactNode }) {
  return <AppShell bottomNav={<BottomNav />}>{children}</AppShell>;
}
