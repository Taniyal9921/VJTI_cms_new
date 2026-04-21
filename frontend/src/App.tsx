import type { ReactElement } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { ApprovalsPage } from "./pages/ApprovalsPage";
import { AssignPage } from "./pages/AssignPage";
import { ComplaintDetailPage } from "./pages/ComplaintDetailPage";
import { ComplaintsPage } from "./pages/ComplaintsPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LandingPage } from "./pages/LandingPage";
import { AboutPage } from "./pages/AboutPage";
import { ContactPage } from "./pages/ContactPage";
import { LoginPage } from "./pages/LoginPage";
import { NewComplaintPage } from "./pages/NewComplaintPage";
import { PendingApprovalPage } from "./pages/PendingApprovalPage";
import { SignupPage } from "./pages/SignupPage";
import { TasksPage } from "./pages/TasksPage";
import type { UserRole } from "./types/models";
import { useTranslation } from "react-i18next";

function Protected() {
  const { t } = useTranslation();
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-slate-600 dark:text-slate-300">
        {t("submitting")}
      </div>
    );
  }
  if (!user) return <Navigate to="/" replace />;
  // Pending users get redirected to the pending approval page
  if ((user.status || "").toLowerCase() === "pending") {
    return <Navigate to="/pending-approval" replace />;
  }
  return (
    <Layout>
      <Outlet/>
    </Layout>
  );
}

function RoleRoute({ allow, children }: { allow: UserRole[]; children: ReactElement }) {
  const { user } = useAuth();
  if (!user || !allow.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
}

function DashboardEntry() {
  const { user } = useAuth();
  if (user?.role === "Student" || user?.role === "Faculty") {
    return <Navigate to="/complaints" replace />;
  }
  return <DashboardPage />;
}

export default function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />

      {/* Authenticated pages */}
      <Route element={<Protected />}>
        <Route path="/dashboard" element={<DashboardEntry />} />
        <Route
          path="/admin"
          element={
            <RoleRoute allow={["Admin"]}>
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route path="/complaints" element={<ComplaintsPage />} />
        <Route path="/complaints/new" element={<NewComplaintPage />} />
        <Route path="/complaints/:id" element={<ComplaintDetailPage />} />
        <Route
          path="/approvals"
          element={
            <RoleRoute allow={["HOD"]}>
              <ApprovalsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/assign"
          element={
            <RoleRoute allow={["HK_Manager", "Maint_Manager"]}>
              <AssignPage />
            </RoleRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <RoleRoute allow={["Staff"]}>
              <TasksPage />
            </RoleRoute>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

