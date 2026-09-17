import type { ReactNode } from "react";
import { RouteLoadingOverlay } from "@/components/route-loading-overlay";
import { PageMotion } from "@/components/page-motion";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
};

export function AppShell({ children, header, bottomNav }: AppShellProps) {
  return (
    <div className="app-shell">
      {header}
      <div className="app-shell__body">
        <div className="app-shell__scroll"><PageMotion>{children}</PageMotion></div>
        <RouteLoadingOverlay />
      </div>
      {bottomNav}
    </div>
  );
}
