import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import * as cms from "../api/cms";
import type { User } from "../types/models";

type Tab = "pending" | "all";

interface AdminStats {
  pending: number;
  active: number;
  rejected: number;
  total: number;
}

export function AdminDashboardPage() {
  const [tab, setTab] = useState<Tab>("pending");
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<AdminStats>({ pending: 0, active: 0, rejected: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    userId: number;
    userName: string;
    action: "approve" | "reject";
  } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersData, statsData] = await Promise.all([
        tab === "pending" ? cms.fetchAdminUsers("pending") : cms.fetchAdminUsers(),
        cms.fetchAdminStats(),
      ]);
      setUsers(usersData);
      setStats(statsData);
    } catch {
      // interceptor handles toast
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async () => {
    if (!confirmModal) return;
    setActionBusy(confirmModal.userId);
    try {
      if (confirmModal.action === "approve") {
        await cms.approveUser(confirmModal.userId);
        toast.success(`✅ ${confirmModal.userName} has been approved`);
      } else {
        await cms.rejectUser(confirmModal.userId);
        toast.success(`❌ ${confirmModal.userName} has been rejected`);
      }
      setConfirmModal(null);
      await loadData();
    } catch {
      // interceptor handles toast
    } finally {
      setActionBusy(null);
    }
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatRole = (role: string) => {
    const map: Record<string, string> = {
      Student: "Student",
      Faculty: "Faculty",
      HOD: "HOD",
      HK_Manager: "HK Manager",
      Maint_Manager: "Maint Manager",
      Staff: "Staff",
      Admin: "Admin",
    };
    return map[role] || role;
  };

  const getStatusBadgeClass = (status: string) => {
    const s = status.toLowerCase();
    if (s === "active") return "admin-badge admin-badge--active";
    if (s === "rejected") return "admin-badge admin-badge--rejected";
    return "admin-badge admin-badge--pending";
  };

  return (
    <div className="admin-page">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-left">
            <img
              src="/assets/vjti-logo-wide.png"
              alt="VJTI Logo"
              className="admin-logo-img"
            />
          </div>
          <div className="admin-header-right">
            <h1 className="admin-title">Admin Dashboard</h1>
            <p className="admin-subtitle">User Verification & Management</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="admin-stats-row">
        <div className="admin-stat-card admin-stat-card--pending">
          <div className="admin-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.pending}</span>
            <span className="admin-stat-label">Pending</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--active">
          <div className="admin-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.active}</span>
            <span className="admin-stat-label">Active</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--rejected">
          <div className="admin-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.rejected}</span>
            <span className="admin-stat-label">Rejected</span>
          </div>
        </div>
        <div className="admin-stat-card admin-stat-card--total">
          <div className="admin-stat-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="admin-stat-info">
            <span className="admin-stat-number">{stats.total}</span>
            <span className="admin-stat-label">Total Users</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${tab === "pending" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("pending")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          Pending Approval
          {stats.pending > 0 && (
            <span className="admin-tab-badge">{stats.pending}</span>
          )}
        </button>
        <button
          className={`admin-tab ${tab === "all" ? "admin-tab--active" : ""}`}
          onClick={() => setTab("all")}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
          All Users
        </button>
      </div>

      {/* Table */}
      <div className="admin-table-container">
        {loading ? (
          <div className="admin-loading">
            <div className="admin-spinner"></div>
            <p>Loading users...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="admin-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="11" x2="25" y2="11" />
            </svg>
            <p>No {tab === "pending" ? "pending" : ""} users found</p>
          </div>
        ) : (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Details</th>
                  <th>Registered</th>
                  <th>Status</th>
                  {tab === "pending" && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.user_id} className={u.status.toLowerCase() === "pending" ? "admin-row--pending" : ""}>
                    <td className="admin-td-num">{i + 1}</td>
                    <td className="admin-td-name">
                      <div className="admin-user-avatar">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      {u.name}
                    </td>
                    <td>{u.email}</td>
                    <td>{u.phone || "—"}</td>
                    <td>
                      <span className="admin-role-chip">{formatRole(u.role)}</span>
                    </td>
                    <td>{u.department_id ? `Dept #${u.department_id}` : "—"}</td>
                    <td className="admin-td-details">
                      {u.student_reg_no && <span>ID: {u.student_reg_no}</span>}
                      {u.year_of_study && <span>Year: {u.year_of_study}</span>}
                      {u.designation && <span>{u.designation}</span>}
                      {!u.student_reg_no && !u.year_of_study && !u.designation && "—"}
                    </td>
                    <td>{formatDate(u.created_at)}</td>
                    <td>
                      <span className={getStatusBadgeClass(u.status)}>{u.status}</span>
                    </td>
                    {tab === "pending" && (
                      <td className="admin-td-actions">
                        <button
                          className="admin-action-btn admin-action-btn--approve"
                          disabled={actionBusy === u.user_id}
                          onClick={() =>
                            setConfirmModal({
                              userId: u.user_id,
                              userName: u.name,
                              action: "approve",
                            })
                          }
                          title="Approve"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                          Approve
                        </button>
                        <button
                          className="admin-action-btn admin-action-btn--reject"
                          disabled={actionBusy === u.user_id}
                          onClick={() =>
                            setConfirmModal({
                              userId: u.user_id,
                              userName: u.name,
                              action: "reject",
                            })
                          }
                          title="Reject"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                          Reject
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="admin-modal-overlay" onClick={() => setConfirmModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`admin-modal-icon ${confirmModal.action === "approve" ? "admin-modal-icon--approve" : "admin-modal-icon--reject"}`}>
              {confirmModal.action === "approve" ? (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              ) : (
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              )}
            </div>
            <h3 className="admin-modal-title">
              {confirmModal.action === "approve" ? "Approve User" : "Reject User"}
            </h3>
            <p className="admin-modal-desc">
              Are you sure you want to{" "}
              <strong>{confirmModal.action === "approve" ? "approve" : "reject"}</strong>{" "}
              <strong>{confirmModal.userName}</strong>?
              {confirmModal.action === "approve"
                ? " They will be able to access the system."
                : " They will not be able to access the system."}
            </p>
            <div className="admin-modal-actions">
              <button
                className="admin-modal-btn admin-modal-btn--cancel"
                onClick={() => setConfirmModal(null)}
              >
                Cancel
              </button>
              <button
                className={`admin-modal-btn ${confirmModal.action === "approve" ? "admin-modal-btn--approve" : "admin-modal-btn--reject"}`}
                onClick={handleAction}
                disabled={actionBusy !== null}
              >
                {actionBusy !== null
                  ? "Processing..."
                  : confirmModal.action === "approve"
                  ? "Yes, Approve"
                  : "Yes, Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
