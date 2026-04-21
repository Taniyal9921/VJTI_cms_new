import toast from "react-hot-toast";
import { api, formatApiErrorDetail, resolveApiBase } from "./client";
import type {
  Assignment,
  Complaint,
  ComplaintDetail,
  ComplaintType,
  ComplaintStatus,
  DashboardStats,
  Department,
  Feedback,
  Location,
  Priority,
  User,
} from "../types/models";

export async function login(email: string, password: string) {
  const { data } = await api.post<{ access_token: string }>("/auth/login", { email, password });
  return data.access_token;
}

export async function register(body: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  role?: string;
  department_name?: string | null;
  designation?: string | null;
  student_reg_no?: string | null;
  year_of_study?: string | null;
}) {
  const { data } = await api.post<User>("/auth/register", body);
  return data;
}

export async function fetchMe() {
  const { data } = await api.get<User>("/users/me");
  return data;
}

export async function fetchUsers(params?: { role?: string }) {
  const { data } = await api.get<User[]>("/users", { params });
  return data;
}

export async function fetchDepartments() {
  const { data } = await api.get<Department[]>("/departments");
  return data;
}

export async function fetchLocations(departmentId?: number) {
  const { data } = await api.get<Location[]>("/locations", {
    params: departmentId ? { department_id: departmentId } : {},
  });
  return data;
}

export async function fetchComplaints(params: {
  skip?: number;
  limit?: number;
  status?: ComplaintStatus;
  complaint_type?: ComplaintType;
  department_id?: number;
  q?: string;
}) {
  const res = await api.get<Complaint[]>("/complaints", { params });
  const hdrs = res.headers as unknown as Record<string, string | undefined>;
  const total = Number(hdrs["x-total-count"] ?? hdrs["X-Total-Count"] ?? res.data.length);
  return { items: res.data, total };
}

export async function fetchComplaint(id: number) {
  const { data } = await api.get<ComplaintDetail>(`/complaints/${id}`);
  return data;
}

export async function createComplaint(
  body: {
    title: string;
    description: string;
    complaint_type: ComplaintType;
    priority: Priority;
    department_id: number;
    building_name: string;
    floor_number: string;
    location_detail?: string;
  },
  files?: File[],
) {
  const fd = new FormData();
  fd.append("title", body.title);
  fd.append("description", body.description);
  fd.append("complaint_type", body.complaint_type);
  fd.append("priority", body.priority);
  fd.append("department_id", String(body.department_id));
  fd.append("building_name", body.building_name);
  fd.append("floor_number", body.floor_number);
  fd.append("location_detail", body.location_detail ?? "");
  for (const f of files ?? []) {
    fd.append("files", f);
  }
  const token = localStorage.getItem("cms_token");
  const res = await fetch(`${resolveApiBase()}/complaints`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}`, Accept: "application/json" } : { Accept: "application/json" },
    body: fd,
  });
  let data: unknown = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) {
    const detail = typeof data === "object" && data !== null && "detail" in data ? (data as { detail: unknown }).detail : data;
    const msg = formatApiErrorDetail(detail) || res.statusText;
    if (msg) toast.error(msg);
    throw new Error(msg);
  }
  return data as Complaint;
}

export async function patchComplaint(id: number, body: Partial<{ title: string; description: string; priority: Priority }>) {
  const { data } = await api.patch<Complaint>(`/complaints/${id}`, body);
  return data;
}

export async function deleteComplaint(id: number) {
  await api.delete(`/complaints/${id}`);
}

export async function approveComplaint(id: number, remarks?: string) {
  const { data } = await api.post<Complaint>(`/complaints/${id}/approve`, { remarks });
  return data;
}

export async function rejectComplaint(id: number, remarks?: string) {
  const { data } = await api.post<Complaint>(`/complaints/${id}/reject`, { remarks });
  return data;
}

export async function statusUpdate(id: number, new_status: ComplaintStatus, remarks?: string) {
  const { data } = await api.post<Complaint>(`/complaints/${id}/status-update`, { new_status, remarks });
  return data;
}

export async function createAssignment(body: { complaint_id: number; assigned_to: number; work_notes?: string }) {
  const { data } = await api.post<Assignment>("/assignments", body);
  return data;
}

export async function patchAssignment(
  id: number,
  body: Partial<{ assignment_status: string; work_notes: string }>,
) {
  const { data } = await api.patch<Assignment>(`/assignments/${id}`, body);
  return data;
}

export async function submitFeedback(body: {
  complaint_id: number;
  rating: number;
  feedback_comment: string;
  confirmed: boolean;
}) {
  const { data } = await api.post<Feedback>("/feedback", body);
  return data;
}

export async function fetchDashboardStats() {
  const { data } = await api.get<DashboardStats>("/dashboard/stats");
  return data;
}

// ── Admin endpoints ──────────────────────────────────────────

export async function fetchAdminUsers(userStatus?: string) {
  const params = userStatus ? { user_status: userStatus } : {};
  const { data } = await api.get<User[]>("/admin/users", { params });
  return data;
}

export async function fetchAdminStats() {
  const { data } = await api.get<{ pending: number; active: number; rejected: number; total: number }>("/admin/stats");
  return data;
}

export async function approveUser(userId: number) {
  const { data } = await api.post<User>(`/admin/users/${userId}/approve`);
  return data;
}

export async function rejectUser(userId: number) {
  const { data } = await api.post<User>(`/admin/users/${userId}/reject`);
  return data;
}
