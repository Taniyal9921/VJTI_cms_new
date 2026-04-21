import { Link } from "react-router-dom";
import { mediaUrl } from "../api/client";
import type { Complaint } from "../types/models";
import { StatusBadge } from "./StatusBadge";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

function formatComplaintLocation(c: Complaint, t: (key: string) => string): string | null {
  if (!c.location) return null;
  const { building_name, floor_number, room_number } = c.location;
  const parts = [building_name, `${t("floor")} ${floor_number}`];
  if (room_number && room_number !== "—") parts.push(room_number);
  return parts.join(" · ");
}

export function ComplaintCard({ c }: { c: Complaint }) {
  const { t } = useTranslation();
  const locLabel = formatComplaintLocation(c, t);
  const thumb = c.attachments?.find((a) => a.file_type === "image");
  return (
    <Link
      to={`/complaints/${c.complaint_id}`}
      className="block rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-slate-900 dark:text-slate-50">{c.title}</p>
          <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">{c.description}</p>
        </div>
        {thumb && (
          <img
            src={mediaUrl(thumb.url)}
            alt=""
            className="h-16 w-16 shrink-0 rounded-md object-cover ring-1 ring-slate-200 dark:ring-slate-600"
          />
        )}
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="type" value={c.complaint_type} />
          <StatusBadge kind="priority" value={c.priority} />
          <StatusBadge kind="status" value={c.status} />
        </div>
      </div>
      {locLabel && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{locLabel}</p>}
      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        #{c.complaint_id} · {t("updated_at", { defaultValue: "Updated" })} {new Date(c.updated_at).toLocaleString()}
      </p>
    </Link>
  );
}
