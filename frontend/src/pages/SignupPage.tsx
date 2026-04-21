import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as cms from "../api/cms";
import { useTranslation } from "react-i18next";

/** API role strings; Staff_Maint / Staff_HK map to Staff on the server. */
type SignupRole =
  | "Student"
  | "Faculty"
  | "HOD"
  | "Maint_Manager"
  | "HK_Manager"
  | "Staff_Maint"
  | "Staff_HK";

const ROLE_OPTIONS: SignupRole[] = [
  "Student",
  "Faculty",
  "HOD",
  "Maint_Manager",
  "HK_Manager",
  "Staff_Maint",
  "Staff_HK",
];

const DEPARTMENT_NAMES = [
  "Computer Science",
  "Civil Engineering",
  "Textile Engineering",
  "Electrical Engineering",
  "Mechanical Engineering",
  "Information Technology",
  "Production Engineering",
  "Chemical Engineering",
  "Electronics and Telecommunication Engineering",
] as const;

export function SignupPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [busy, setBusy] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "Student" as SignupRole,
    department_name: "",
  });

  const [studentFields, setStudentFields] = useState({ student_id: "", year: "" });
  const [facultyFields, setFacultyFields] = useState({ designation: "" });

  const needsDepartment = ["Student", "Faculty", "HOD", "Staff_Maint", "Staff_HK"].includes(formData.role);
  const departmentRequired = ["Student", "Faculty", "HOD"].includes(formData.role);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === "role") {
      setFormData((prev) => ({ ...prev, role: value as SignupRole, department_name: "" }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);

    const department_name = formData.department_name.trim() || undefined;
    const phone = formData.phone.trim() || undefined;

    const body: Parameters<typeof cms.register>[0] = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      phone,
      password: formData.password,
      role: formData.role,
      department_name,
    };

    if (formData.role === "Student") {
      const studentId = studentFields.student_id.trim();
      const year = studentFields.year.trim();
      if (!studentId) {
        toast.error(t("toast_req_student_id"));
        setBusy(false);
        return;
      }
      if (!year) {
        toast.error(t("toast_req_year"));
        setBusy(false);
        return;
      }
      body.student_reg_no = studentId;
      body.year_of_study = year;
    }
    if (formData.role === "Faculty") {
      const designation = facultyFields.designation.trim();
      if (!designation) {
        toast.error(t("toast_req_designation"));
        setBusy(false);
        return;
      }
      body.designation = designation;
    }

    try {
      await cms.register(body);
      toast.success(t("toast_reg_success"));
      nav("/login");
    } catch {
      // Interceptor handles toast error
    } finally {
      setBusy(false);
    }
  }

  const departmentSelect = (required: boolean) => (
    <div className="vjti-input-wrapper">
      <select
        name="department_name"
        required={required}
        value={formData.department_name}
        onChange={handleChange}
        className="vjti-input vjti-select"
      >
        <option value="">{required ? t("opt_select") : t("opt_any")}</option>
        {DEPARTMENT_NAMES.map((name) => (
          <option key={name} value={name}>
            {t(`dept_${name}`)}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="vjti-auth-page">
      {/* Scrolling Ticker */}
      <div className="vjti-ticker">
        <div className="vjti-ticker-content">
          <span>📢 Welcome to VJTI Complaint Management System — Report issues, track resolutions, and help improve campus life.&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;🔧 Maintenance requests are processed Monday to Saturday, 9:00 AM to 5:00 PM.&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;📋 New users: Please sign up with your official VJTI email address.</span>
        </div>
      </div>

      <div className="vjti-auth-container">
        {/* Left Panel - Gate Image */}
        <div className="vjti-auth-image-panel">
          <img
            src="/assets/vjti-gate.png"
            alt="VJTI Gate Entrance"
            className="vjti-auth-gate-img"
          />
        </div>

        {/* Right Panel - Signup Form */}
        <div className="vjti-auth-form-panel vjti-signup-panel">
          <div className="vjti-auth-form-inner">
            {/* Logo */}
            <div className="vjti-logo-section">
              <img
                src="/assets/vjti-logo.png"
                alt="Veermata Jijabai Technological Institute"
                className="vjti-logo-img"
              />
            </div>

            {/* Sign Up Heading */}
            <h1 className="vjti-auth-heading">{t("join_vjti")}</h1>
            <p className="vjti-auth-subheading">{t("signup_desc")}</p>

            <form onSubmit={onSubmit} className="vjti-auth-form vjti-signup-form">
              {/* Row: Full Name & Email */}
              <div className="vjti-form-row">
                <div className="vjti-field-group">
                  <label className="vjti-field-label">{t("full_name")}</label>
                  <div className="vjti-input-wrapper">
                    <input
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={t("placeholder_name")}
                      className="vjti-input"
                    />
                    <span className="vjti-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="vjti-field-group">
                  <label className="vjti-field-label">{t("email_official")}</label>
                  <div className="vjti-input-wrapper">
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="rahul@vjti.ac.in"
                      className="vjti-input"
                    />
                    <span className="vjti-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                        <polyline points="22,6 12,13 2,6"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Row: Phone & Password */}
              <div className="vjti-form-row">
                <div className="vjti-field-group">
                  <label className="vjti-field-label">{t("phone_number")}</label>
                  <div className="vjti-input-wrapper">
                    <input
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91..."
                      className="vjti-input"
                    />
                    <span className="vjti-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </span>
                  </div>
                </div>

                <div className="vjti-field-group">
                  <label className="vjti-field-label">{t("password")}</label>
                  <div className="vjti-input-wrapper">
                    <input
                      name="password"
                      type="password"
                      required
                      minLength={8}
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Min 8 characters"
                      className="vjti-input"
                    />
                    <span className="vjti-input-icon">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="vjti-divider"></div>

              {/* Role */}
              <div className="vjti-field-group">
                <label className="vjti-field-label">{t("role")}</label>
                <div className="vjti-input-wrapper">
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="vjti-input vjti-select"
                  >
                    {ROLE_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {t(`role_${o}`)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Student Fields */}
              {formData.role === "Student" && (
                <div className="vjti-conditional-fields">
                  <div className="vjti-form-row">
                    <div className="vjti-field-group">
                      <label className="vjti-field-label">{t("student_id")}</label>
                      <div className="vjti-input-wrapper">
                        <input
                          required
                          value={studentFields.student_id}
                          onChange={(e) => setStudentFields((s) => ({ ...s, student_id: e.target.value }))}
                          placeholder="e.g. 211080001"
                          className="vjti-input"
                        />
                      </div>
                    </div>
                    <div className="vjti-field-group">
                      <label className="vjti-field-label">{t("year_of_study")}</label>
                      <div className="vjti-input-wrapper">
                        <select
                          required
                          value={studentFields.year}
                          onChange={(e) => setStudentFields((s) => ({ ...s, year: e.target.value }))}
                          className="vjti-input vjti-select"
                        >
                          <option value="">{t("select_year")}</option>
                          <option value="FY">{t("fy")}</option>
                          <option value="SY">{t("sy")}</option>
                          <option value="TY">{t("ty")}</option>
                          <option value="Final">{t("final_year")}</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="vjti-field-group">
                    <label className="vjti-field-label">{t("department")}</label>
                    {departmentSelect(true)}
                  </div>
                </div>
              )}

              {/* Faculty Fields */}
              {formData.role === "Faculty" && (
                <div className="vjti-conditional-fields">
                  <div className="vjti-field-group">
                    <label className="vjti-field-label">{t("department")}</label>
                    {departmentSelect(true)}
                  </div>
                  <div className="vjti-field-group">
                    <label className="vjti-field-label">{t("designation")}</label>
                    <div className="vjti-input-wrapper">
                      <input
                        required
                        value={facultyFields.designation}
                        onChange={(e) => setFacultyFields({ designation: e.target.value })}
                        placeholder="e.g. Assistant Professor"
                        className="vjti-input"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* HOD Department */}
              {formData.role === "HOD" && (
                <div className="vjti-conditional-fields">
                  <div className="vjti-field-group">
                    <label className="vjti-field-label">{t("department")}</label>
                    {departmentSelect(true)}
                  </div>
                </div>
              )}

              {/* Staff Department (Optional) */}
              {needsDepartment && !departmentRequired && (
                <div className="vjti-conditional-fields">
                  <div className="vjti-field-group">
                    <label className="vjti-field-label">{t("department_optional")}</label>
                    {departmentSelect(false)}
                  </div>
                </div>
              )}

              {/* Sign Up Button */}
              <button
                type="submit"
                className="vjti-submit-btn"
                disabled={busy}
              >
                {busy ? t("processing") : t("create_account")}
              </button>
            </form>

            {/* Login Link */}
            <p className="vjti-switch-auth">
              {t("already_member")}{" "}
              <Link className="vjti-switch-link" to="/login">
                {t("login_here")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
