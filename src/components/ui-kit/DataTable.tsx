import { Surface } from "./Surface";


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
    <Surface className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left" style={{ minWidth }}>
          <thead className="bg-muted/60 text-sm font-medium text-muted-foreground">
            {headers}
          </thead>
          <tbody className="divide-y divide-border text-sm">{children}</tbody>
        </table>
      </div>
    </Surface>
  );
}

export function EmptyRow({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-6 py-14 text-center text-sm text-muted-foreground">
        {children}
      </td>
    </tr>
  );
}
