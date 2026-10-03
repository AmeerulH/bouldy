import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SnackbarHost } from "@/components/ui/snackbar";
import { BottomNav } from "@/components/bottom-nav";
import { getSessionUser } from "@/lib/session";

export default async function AppGroupLayout({ children }: { children: ReactNode }) {
  const user = await getSessionUser();
  if (!user) redirect("/welcome");

  return <AppShell bottomNav={<BottomNav />} overlay={<Suspense fallback={null}><SnackbarHost /></Suspense>}>{process.env.NODE_ENV === "development" && process.env.BOULDY_LOCAL_API ? <p className="border-b border-hairline px-5 py-2 text-xs font-semibold text-ink-muted">Sample journal · local preview</p> : null}{children}</AppShell>;
}
