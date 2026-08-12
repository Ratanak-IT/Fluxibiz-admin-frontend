import React from "react";

export function DataTable({
  headers,
  minWidth = "46rem",
  children,
}: {
  headers: React.ReactNode;
  minWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className="bg-muted/70 text-xs sm:text-sm font-bold text-foreground border-b border-border">
            {headers}
          </thead>
          <tbody className="divide-y divide-border text-sm">{children}</tbody>
        </table>
      </div>
    </div>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-12 text-center text-sm text-muted-foreground sm:py-14">
        {children}
      </td>
    </tr>
  );
}
