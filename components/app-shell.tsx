import type { ReactNode } from "react";
import { RouteLoadingOverlay } from "@/components/route-loading-overlay";
import { PageMotion } from "@/components/page-motion";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
  /** Floats above the screen (snackbars). Lives outside PageMotion so page transforms cannot offset it. */
  overlay?: ReactNode;
};

export function AppShell({ children, header, bottomNav, overlay }: AppShellProps) {
  return (
    <div className="app-shell">
      {overlay}
      {header}
      <div className="app-shell__body">
        <div className="app-shell__scroll"><PageMotion>{children}</PageMotion></div>
        <RouteLoadingOverlay />
      </div>
      {bottomNav}
    </div>
  );
}
