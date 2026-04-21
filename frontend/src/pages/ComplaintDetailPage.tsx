import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import * as cms from "../api/cms";
import { mediaUrl } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { Modal } from "../components/Modal";
import { StatusBadge } from "../components/StatusBadge";
import { Timeline } from "../components/Timeline";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { TextArea } from "../components/ui/TextArea";
import { Skeleton } from "../components/ui/Skeleton";
import type { ComplaintDetail, User } from "../types/models";
import {useTranslation} from "react-i18next";

export function ComplaintDetailPage() {
  const { t } = useTranslation();
  const { id } = useParams();
  const complaintId = Number(id);
  const { user } = useAuth();
  const [c, setC] = useState<ComplaintDetail | null>(null);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [assignTo, setAssignTo] = useState<number | "">("");
  const [modal, setModal] = useState<"assign" | "feedback" | null>(null);
  const [remarks, setRemarks] = useState("");
  const [rating, setRating] = useState(5);
  const [fbText, setFbText] = useState("");
  const [fbConfirm, setFbConfirm] = useState(true);

  const load = useCallback(async () => {
    const d = await cms.fetchComplaint(complaintId);
    setC(d);
  }, [complaintId]);

  useEffect(() => {
    if (!Number.isFinite(complaintId)) return;
    load().catch(() => {});
    const t_int = setInterval(() => load().catch(() => {}), 20_000);
    return () => clearInterval(t_int);
  }, [load, complaintId]);

  useEffect(() => {
    if (user?.role === "HK_Manager" || user?.role === "Maint_Manager") {
      cms.fetchUsers({ role: "Staff" }).then(setStaffUsers).catch(() => {});
    }
  }, [user?.role]);

  const latestAssignment = useMemo(() => {
    if (!c?.assignments?.length) return null;
    return [...c.assignments].sort((a, b) => b.assignment_id - a.assignment_id)[0];
  }, [c]);

  const myAssignment = useMemo(() => {
    if (!c || !user) return null;
    return c.assignments.find((a) => a.assigned_to === user.user_id) ?? null;
  }, [c, user]);

  const canHodAct =
    user?.role === "HOD" &&
    c?.complaint_type === "Maintenance" &&
    c.approval_status === "Pending";

  const canAssign =
    c &&
    ((user?.role === "HK_Manager" && c.complaint_type === "Housekeeping") ||
      (user?.role === "Maint_Manager" && c.complaint_type === "Maintenance" && c.approval_status === "Approved")) &&
    c.status !== "Closed" &&
    c.status !== "Completed" &&
    !c.assignments.some((a) => a.assignment_status === "Pending" || a.assignment_status === "In Progress");

  if (!Number.isFinite(complaintId)) {
    return <p className="text-sm text-red-600">{t("toast_invalid_id")}</p>;
  }

  if (!c) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div>
      <Link to="/complaints" className="text-sm text-brand-600 hover:underline">
        {t("back_to_list")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{c.title}</h1>
          {c.location && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-800 dark:text-slate-200">{t("location")}: </span>
              {c.location.building_name} · {t("floor")} {c.location.floor_number}
              {c.location.room_number && c.location.room_number !== "—" ? ` · ${c.location.room_number}` : ""}
            </p>
          )}
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700 dark:text-slate-200">{c.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusBadge kind="type" value={c.complaint_type} />
          <StatusBadge kind="priority" value={c.priority} />
          <StatusBadge kind="status" value={c.status} />
          <StatusBadge kind="approval" value={c.approval_status} />
        </div>
      </div>

      {c.attachments && c.attachments.length > 0 && (
        <section className="mt-6 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("photos_videos")}</h2>
          <p className="mt-1 text-xs text-slate-500">{t("photos_videos_desc")}</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {c.attachments.map((a) => (
              <figure key={a.attachment_id} className="overflow-hidden rounded-lg border border-slate-100 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/50">
                {a.file_type === "image" ? (
                  <img
                    src={mediaUrl(a.url)}
                    alt={a.file_name}
                    className="max-h-96 w-full object-contain"
                    loading="lazy"
                  />
                ) : a.file_type === "video" ? (
                  <video src={mediaUrl(a.url)} className="max-h-96 w-full bg-black" controls playsInline preload="metadata" />
                ) : (
                  <a
                    href={mediaUrl(a.url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block p-4 text-sm font-medium text-brand-600 hover:underline"
                  >
                    {a.file_name}
                  </a>
                )}
                <figcaption className="truncate px-2 py-1.5 text-xs text-slate-500 dark:text-slate-400">{a.file_name}</figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white">{t("status_timeline")}</h2>
            <p className="mt-1 text-xs text-slate-500">{t("timeline_desc")}</p>
            <div className="mt-4">
              <Timeline items={c.status_history} />
            </div>
          </section>
        </div>

        <div className="space-y-4">
          {canHodAct && (
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-900 dark:bg-amber-950/30">
              <h2 className="text-sm font-semibold text-amber-950 dark:text-amber-50">{t("hod_approval")}</h2>
              <TextArea className="mt-2" placeholder={t("optional_remarks")} value={remarks} onChange={(e) => setRemarks(e.target.value)} />
              <div className="mt-3 flex gap-2">
                <Button
                  type="button"
                  onClick={async () => {
                    await cms.approveComplaint(c.complaint_id, remarks || undefined);
                    toast.success(t("toast_approved"));
                    setRemarks("");
                    load();
                  }}
                >
                  {t("approve")}
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={async () => {
                    await cms.rejectComplaint(c.complaint_id, remarks || undefined);
                    toast.success(t("toast_rejected"));
                    setRemarks("");
                    load();
                  }}
                >
                  {t("reject")}
                </Button>
              </div>
            </section>
          )}

          {canAssign && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">{t("assign_staff")}</h2>
              <p className="mt-1 text-xs text-slate-500">{t("assign_staff_desc")}</p>
              <Button type="button" className="mt-3 w-full" onClick={() => setModal("assign")}>
                {t("open_assignment_panel")}
              </Button>
            </section>
          )}

          {myAssignment && user?.role === "Staff" && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">{t("my_task")}</h2>
              <p className="mt-2 text-xs text-slate-500">{t("assignment_id", { id: myAssignment.assignment_id })}</p>
              <Select
                className="mt-2"
                value={myAssignment.assignment_status}
                onChange={async (e) => {
                  const v = e.target.value;
                  await cms.patchAssignment(myAssignment.assignment_id, { assignment_status: v });
                  toast.success(t("toast_updated"));
                  load();
                }}
              >
                <option value="Pending">{t("enum_Pending")}</option>
                <option value="In Progress">{t("enum_In Progress")}</option>
                <option value="Done">{t("enum_Done")}</option>
              </Select>
            </section>
          )}

          {user && c.raised_by === user.user_id && c.status === "Completed" && !c.feedback && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">{t("feedback")}</h2>
              <Button type="button" className="mt-2 w-full" onClick={() => setModal("feedback")}>
                {t("submit_feedback")}
              </Button>
            </section>
          )}

          {c.feedback && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h2 className="text-sm font-semibold">{t("feedback_received")}</h2>
              <p className="mt-2 text-sm">{t("rating")}: {c.feedback.rating}/5</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{c.feedback.feedback_comment}</p>
              <p className="mt-2 text-xs text-slate-500">{t("confirmed")}: {c.feedback.confirmed ? t("yes") : t("no")}</p>
            </section>
          )}

          {user &&
            c.raised_by === user.user_id &&
            c.status === "Completed" &&
            c.feedback?.confirmed &&
            latestAssignment?.assignment_status === "Done" && (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
                <h2 className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">{t("close_complaint")}</h2>
                <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-200">
                    {t("close_complaint_desc")}
                </p>
                <Button
                  type="button"
                  className="mt-3"
                  onClick={async () => {
                    await cms.statusUpdate(c.complaint_id, "Closed");
                    toast.success(t("toast_closed"));
                    load();
                  }}
                >
                  {t("mark_closed")}
                </Button>
              </section>
            )}

          {latestAssignment && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 text-sm dark:border-slate-800 dark:bg-slate-900">
              <h2 className="font-semibold">{t("latest_assignment")}</h2>
              <p className="mt-2 text-slate-600 dark:text-slate-300">{t("latest_assignment_user", { id: latestAssignment.assigned_to })}</p>
              <p className="mt-1 text-slate-600 dark:text-slate-300">{t("latest_assignment_status", { status: t(`enum_${latestAssignment.assignment_status}`) })}</p>
            </section>
          )}
        </div>
      </div>

      <Modal
        open={modal === "assign"}
        title={t("assign_staff_modal")}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                if (assignTo === "") {
                  toast.error(t("toast_pick_staff"));
                  return;
                }
                await cms.createAssignment({ complaint_id: c.complaint_id, assigned_to: assignTo as number });
                toast.success(t("toast_assigned"));
                setModal(null);
                load();
              }}
            >
              {t("assign_btn")}
            </Button>
          </>
        }
      >
        <Select value={assignTo === "" ? "" : String(assignTo)} onChange={(e) => setAssignTo(e.target.value ? Number(e.target.value) : "")}>
          <option value="">{t("select_staff")}</option>
          {staffUsers.map((u) => (
            <option key={u.user_id} value={u.user_id}>
              {u.name} (#{u.user_id})
            </option>
          ))}
        </Select>
      </Modal>

      <Modal
        open={modal === "feedback"}
        title={t("submit_feedback_modal")}
        onClose={() => setModal(null)}
        footer={
          <>
            <Button variant="secondary" type="button" onClick={() => setModal(null)}>
              {t("cancel")}
            </Button>
            <Button
              type="button"
              onClick={async () => {
                await cms.submitFeedback({
                  complaint_id: c.complaint_id,
                  rating,
                  feedback_comment: fbText,
                  confirmed: fbConfirm,
                });
                toast.success(t("toast_feedback_saved"));
                setModal(null);
                load();
              }}
            >
              {t("submit_btn")}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600">{t("rating_label")}</label>
            <Input type="number" min={1} max={5} value={rating} onChange={(e) => setRating(Number(e.target.value))} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600">{t("comment_label")}</label>
            <TextArea value={fbText} onChange={(e) => setFbText(e.target.value)} required />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={fbConfirm} onChange={(e) => setFbConfirm(e.target.checked)} />
            {t("confirm_resolved_label")}
          </label>
        </div>
      </Modal>
    </div>
  );
}
