import type { ApprovalStatus, AssignmentStatus, ComplaintStatus, ComplaintType, Priority } from "../types/models";
import { useTranslation } from "react-i18next";

const tone = (s: string) => {
  if (s === "Emergency" || s === "Rejected" || s === "Cancelled") return "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-200";
  if (s === "High" || s === "Pending") return "bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-100";
  if (s === "Completed" || s === "Approved" || s === "Done" || s === "Closed")
    return "bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-100";
  if (s === "In Progress" || s === "Assigned") return "bg-sky-100 text-sky-900 dark:bg-sky-950 dark:text-sky-100";
  if (s === "Maintenance") return "bg-violet-100 text-violet-900 dark:bg-violet-950 dark:text-violet-100";
  if (s === "Housekeeping") return "bg-teal-100 text-teal-900 dark:bg-teal-950 dark:text-teal-100";
  return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-100";
};

type Props =
  | { kind: "status"; value: ComplaintStatus }
  | { kind: "approval"; value: ApprovalStatus }
  | { kind: "priority"; value: Priority }
  | { kind: "type"; value: ComplaintType }
  | { kind: "assignment"; value: AssignmentStatus };

export function StatusBadge(props: Props) {
  const { t } = useTranslation();
  const value =
    props.kind === "status"
      ? props.value
      : props.kind === "approval"
        ? props.value
        : props.kind === "priority"
          ? props.value
          : props.kind === "type"
            ? props.value
            : props.value;
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tone(value)}`}>
      {t(`enum_${value}`)}
    </span>
  );
}
