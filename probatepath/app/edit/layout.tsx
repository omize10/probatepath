import type { ReactNode } from "react";

export default function EditLayout({ children }: { children: ReactNode }) {
  return (
    // Override the main layout's padding/max-width so Puck gets full viewport
    <div className="fixed inset-0 z-50 overflow-auto bg-white" style={{ margin: 0, padding: 0, maxWidth: "none" }}>
      {children}
    </div>
  );
}
