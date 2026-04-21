import { NavLink } from "react-router-dom";
import type { UserRole } from "../types/models";
import { useTranslation } from "react-i18next";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `block rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive
      ? "bg-brand-600 text-white dark:bg-brand-500"
      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800"
  }`;

function linksForRole(role: UserRole | undefined) {
  if (role === "Admin") {
    return [{ to: "/admin", label: "admin_dashboard" }];
  }
  // Student experience: keep it focused (no dashboard).
  if (role === "Student") {
    return [
      { to: "/complaints", label: "complaints" },
      { to: "/complaints/new", label: "new_complaint" },
    ];
  }
  // Faculty: similar to students (no dashboard).
  if (role === "Faculty") {
    return [
      { to: "/complaints", label: "complaints" },
      { to: "/complaints/new", label: "new_complaint" },
    ];
  }

  const base = [
    { to: "/", label: "dashboard" },
    { to: "/complaints", label: "complaints" },
  ];
  if (role === "Student" || role === "Faculty") {
    return [...base, { to: "/complaints/new", label: "new_complaint" }];
  }
  if (role === "HOD") {
    return [...base, { to: "/approvals", label: "approval_queue" }];
  }
  if (role === "HK_Manager" || role === "Maint_Manager") {
    return [...base, { to: "/assign", label: "assignments" }];
  }
  if (role === "Staff") {
    return [...base, { to: "/tasks", label: "my_tasks" }];
  }
  return base;
}

export function Sidebar({ role, onNavigate }: { role: UserRole | undefined; onNavigate?: () => void }) {
  const { t } = useTranslation();
  const items = linksForRole(role);
  return (
    <nav className="space-y-1 p-4">
      {items.map((l) => (
        <NavLink key={l.to} to={l.to} className={linkClass} onClick={onNavigate}>
          {t(l.label)}
        </NavLink>
      ))}
    </nav>
  );
}
