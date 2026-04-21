import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import * as cms from "../api/cms";
import { useAuth } from "../context/AuthContext";
import { Skeleton } from "../components/ui/Skeleton";
import type { DashboardStats } from "../types/models";
import {useTranslation} from "react-i18next";


const POLL_MS = 30_000;

export function DashboardPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const s = await cms.fetchDashboardStats();
    setStats(s);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch(() => setLoading(false));
    const id = setInterval(() => load().catch(() => {}), POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  if (loading || !stats) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("dashboard")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t("dashboard_desc")}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("total_complaints")}</p>
          <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stats.total_complaints}</p>
        </div>
        {(user?.role === "Student" || user?.role === "Faculty") && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("my_open_complaints")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stats.my_open_complaints}</p>
            <Link className="mt-3 inline-block text-sm text-brand-600 hover:underline" to="/complaints">
              {t("view_list")}
            </Link>
          </div>
        )}
        {user?.role === "HOD" && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/40">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-800 dark:text-amber-200">
              {t("pending_maintenance_approvals")}
            </p>
            <p className="mt-2 text-3xl font-semibold text-amber-950 dark:text-amber-50">
              {stats.pending_maintenance_approvals}
            </p>
            <Link className="mt-3 inline-block text-sm font-medium text-amber-900 hover:underline dark:text-amber-100" to="/approvals">
              {t("approval_queue")}
            </Link>
          </div>
        )}
        {user?.role === "Staff" && (
          <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t("open_tasks_assigned_to_me")}</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900 dark:text-white">{stats.open_assignments_for_me}</p>
            <Link className="mt-3 inline-block text-sm text-brand-600 hover:underline" to="/tasks">
              {t("my_tasks")}
            </Link>
          </div>
        )}
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("by_status")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {Object.entries(stats.by_status).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{t(`enum_${k}`)}</span>
                <span className="font-medium text-slate-900 dark:text-white">{v}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("by_type")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
            {Object.entries(stats.by_type).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span>{t(`enum_${k}`)}</span>
                <span className="font-medium text-slate-900 dark:text-white">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
