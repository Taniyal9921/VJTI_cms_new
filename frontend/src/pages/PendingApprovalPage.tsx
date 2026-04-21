import { useAuth } from "../context/AuthContext";

export function PendingApprovalPage() {
  const { logout, user } = useAuth();

  return (
    <div className="pending-page">
      <div className="pending-card">
        {/* Logo */}
        <div className="pending-logo-section">
          <img
            src="/assets/vjti-logo.png"
            alt="VJTI Logo"
            className="pending-logo-img"
          />
        </div>

        {/* Animated Icon */}
        <div className="pending-icon-ring">
          <div className="pending-icon-pulse"></div>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#c62828"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pending-icon-svg"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        </div>

        {/* Message */}
        <h1 className="pending-title">Account Pending Approval</h1>
        <p className="pending-desc">
          Hello <strong>{user?.name || "User"}</strong>, your account has been
          registered successfully! An administrator will review and verify your
          details shortly.
        </p>
        <p className="pending-desc pending-desc--secondary">
          You will be able to access the system once your account is approved.
          Please check back later.
        </p>

        {/* Status Info */}
        <div className="pending-info-box">
          <div className="pending-info-row">
            <span className="pending-info-label">Email</span>
            <span className="pending-info-value">{user?.email || "—"}</span>
          </div>
          <div className="pending-info-row">
            <span className="pending-info-label">Role</span>
            <span className="pending-info-value">{user?.role || "—"}</span>
          </div>
          <div className="pending-info-row">
            <span className="pending-info-label">Status</span>
            <span className="pending-info-value pending-status-badge">Pending</span>
          </div>
        </div>

        {/* Logout */}
        <button className="pending-logout-btn" onClick={logout}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </div>
  );
}
