import { useEffect, useState } from "react";
import * as cms from "../api/cms";
import { useAuth } from "../context/AuthContext";
import { ComplaintCard } from "../components/ComplaintCard";
import { Skeleton } from "../components/ui/Skeleton";
import type { Complaint } from "../types/models";
import {useTranslation} from "react-i18next";




/** Manager workbench: complaints ready for assignment (approved housekeeping/maintenance per role). */
export function AssignPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { items: rows } = await cms.fetchComplaints({ limit: 100 });
      const filtered = rows.filter((c) => {
        if (user?.role === "HK_Manager") {
          return c.complaint_type === "Housekeeping" && ["Approved", "Assigned", "In Progress"].includes(c.status);
        }
        if (user?.role === "Maint_Manager") {
          return (
            c.complaint_type === "Maintenance" &&
            c.approval_status === "Approved" &&
            ["Approved", "Assigned", "In Progress"].includes(c.status)
          );
        }
        return false;
      });
      setItems(filtered);
      setLoading(false);
    })().catch(() => setLoading(false));
  }, [user?.role]);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("assignment_panel")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t("assignment_desc")}
      </p>
      <div className="mt-8 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("no_assignments")}</p>
        ) : (
          items.map((c) => <ComplaintCard key={c.complaint_id} c={c} />)
        )}
      </div>
    </div>
  );
}
