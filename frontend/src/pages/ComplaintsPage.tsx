import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as cms from "../api/cms";
import { useAuth } from "../context/AuthContext";
import { ComplaintCard } from "../components/ComplaintCard";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Skeleton } from "../components/ui/Skeleton";
import type { Complaint, ComplaintStatus, ComplaintType } from "../types/models";
import {useTranslation} from "react-i18next";

const POLL_MS = 25_000;

export function ComplaintsPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [items, setItems] = useState<Complaint[]>([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const limit = 10;
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<ComplaintStatus | "">("");
  const [ctype, setCtype] = useState<ComplaintType | "">("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(
    async (skipOverride?: number) => {
      const s = skipOverride ?? skip;
      const { items: rows, total: t } = await cms.fetchComplaints({
        skip: s,
        limit,
        q: q || undefined,
        status: status || undefined,
        complaint_type: ctype || undefined,
      });
      setItems(rows);
      setTotal(t);
      setLoading(false);
    },
    [skip, limit, q, status, ctype],
  );

  useEffect(() => {
    setSkip(0);
  }, [status, ctype]);

  useEffect(() => {
    setLoading(true);
    load().catch(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    const id = setInterval(() => load().catch(() => {}), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("complaints")}</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            {t("complaints_list_desc")}
          </p>
        </div>
        {(user?.role === "Student" || user?.role === "Faculty") && (
          <Link to="/complaints/new">
            <Button type="button">{t("new_complaint")}</Button>
          </Link>
        )}
      </div>

      <div className="mt-6 grid gap-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900 md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="text-xs font-medium text-slate-500">{t("search")}</label>
          <Input placeholder={t("title_or_desc")} value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">{t("status")}</label>
          <Select value={status} onChange={(e) => setStatus((e.target.value || "") as ComplaintStatus | "")}>
            <option value="">{t("opt_any")}</option>
            {["Submitted", "Approved", "Assigned", "In Progress", "Completed", "Closed"].map((s) => (
              <option key={s} value={s}>
                {t(`enum_${s}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-500">{t("type")}</label>
          <Select value={ctype} onChange={(e) => setCtype((e.target.value || "") as ComplaintType | "")}>
            <option value="">{t("opt_any")}</option>
            <option value="Housekeeping">{t("enum_Housekeeping")}</option>
            <option value="Maintenance">{t("enum_Maintenance")}</option>
          </Select>
        </div>
        <div className="md:col-span-4 flex gap-2">
          <Button
            type="button"
            onClick={() => {
              setSkip(0);
              setLoading(true);
              void load(0);
            }}
          >
            {t("apply_filters")}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setQ("");
              setStatus("");
              setCtype("");
              setSkip(0);
              setLoading(true);
              cms
                .fetchComplaints({ skip: 0, limit })
                .then(({ items: rows, total: t }) => {
                  setItems(rows);
                  setTotal(t);
                })
                .finally(() => setLoading(false));
            }}
          >
            {t("reset")}
          </Button>
        </div>
      </div>

      <p className="mt-4 text-xs text-slate-500">{t("auto_refresh", { ms: POLL_MS / 1000, total: total })}</p>

      <div className="mt-6 space-y-4">
        {loading ? (
          <>
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-600 dark:text-slate-300">{t("no_complaints")}</p>
        ) : (
          items.map((c) => <ComplaintCard key={c.complaint_id} c={c} />)
        )}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button type="button" variant="secondary" disabled={skip === 0} onClick={() => setSkip((s) => Math.max(0, s - limit))}>
          {t("btn_prev")}
        </Button>
        <span className="text-sm text-slate-600 dark:text-slate-300">
          {t("showing_pagination", { start: skip + 1, end: Math.min(skip + limit, total), total: total })}
        </span>
        <Button type="button" variant="secondary" disabled={skip + limit >= total} onClick={() => setSkip((s) => s + limit)}>
          {t("btn_next")}
        </Button>
      </div>
    </div>
  );
}
