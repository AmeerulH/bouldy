import type { ReactNode } from "react";

type AppShellProps = {
  children: ReactNode;
  header?: ReactNode;
  bottomNav?: ReactNode;
};

export function AppShell({ children, header, bottomNav }: AppShellProps) {
  return (
    <div className="app-shell">
      {header}
      <div className="app-shell__scroll">{children}</div>
      {bottomNav}
    </div>
  );
}
