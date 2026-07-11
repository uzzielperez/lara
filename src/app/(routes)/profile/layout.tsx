import type { ReactNode } from "react";

/** Full-height dashboard shell (below site header). */
export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <div className="h-[calc(100vh-4rem)] -mx-0 overflow-hidden">{children}</div>
  );
}
