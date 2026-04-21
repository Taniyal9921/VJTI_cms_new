import { useEffect, useState } from "react";
import * as cms from "../api/cms";
import { ComplaintCard } from "../components/ComplaintCard";
import { Skeleton } from "../components/ui/Skeleton";
import type { Complaint } from "../types/models";
import {useTranslation} from "react-i18next";

/** HOD queue: maintenance tickets pending approval in their department (API-enforced). */
export function ApprovalsPage() {
  const { t } = useTranslation();
  const [items, setItems] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { items: rows } = await cms.fetchComplaints({
        complaint_type: "Maintenance",
        status: "Submitted",
        limit: 50,
      });
      setItems(rows.filter((x) => x.approval_status === "Pending"));
      setLoading(false);
    })().catch(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("approval_queue")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
       {t("approval_desc")}
      </p>
      <div className="mt-8 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("no_pending_approvals")}</p>
        ) : (
          items.map((c) => <ComplaintCard key={c.complaint_id} c={c} />)
        )}
      </div>
    </div>
  );
}
