import type { StatusHistoryRow } from "../types/models";

export function Timeline({ items }: { items: StatusHistoryRow[] }) {
  const sorted = [...items].sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());
  return (
    <ol className="relative border-l border-slate-200 dark:border-slate-700 ml-3 space-y-6 py-2">
      {sorted.map((h) => (
        <li key={h.history_id} className="ml-6">
          <span className="absolute -left-1.5 mt-1.5 flex h-3 w-3 items-center justify-center rounded-full bg-brand-500 ring-4 ring-white dark:ring-slate-950" />
          <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3 dark:border-slate-800 dark:bg-slate-900/60">
            <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
              {h.old_status ? `${h.old_status} → ${h.new_status}` : h.new_status}
            </p>
            {h.remarks ? <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{h.remarks}</p> : null}
            <p className="mt-2 text-xs text-slate-500">{new Date(h.changed_at).toLocaleString()} · user #{h.changed_by}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
