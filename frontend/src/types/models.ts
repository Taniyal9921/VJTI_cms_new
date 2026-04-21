/** Mirrors FastAPI/Pydantic enums — keeps UI and API aligned. */

export type UserRole =
  | "Student"
  | "Faculty"
  | "HOD"
  | "HK_Manager"
  | "Maint_Manager"
  | "Staff"
  | "Admin";

export type ComplaintType = "Housekeeping" | "Maintenance";

export type Priority = "Low" | "Medium" | "High" | "Emergency";

export type ComplaintStatus =
  | "Submitted"
  | "Approved"
  | "Assigned"
  | "In Progress"
  | "Completed"
  | "Closed";

export type ApprovalStatus = "Pending" | "Approved" | "Rejected";

export type AssignmentStatus = "Pending" | "In Progress" | "Done" | "Cancelled";

export interface User {
  user_id: number;
  name: string;
  email: string;
  phone: string | null;
  role: UserRole;
  department_id: number | null;
  designation: string | null;
  student_reg_no?: string | null;
  year_of_study?: string | null;
  created_at: string;
  status: string;
}

export interface Department {
  department_id: number;
  department_name: string;
  building_name: string | null;
  hod_id: number | null;
  contact_email: string | null;
  created_at: string;
}

export interface Location {
  location_id: number;
  building_name: string;
  floor_number: string;
  room_number: string;
  department_id: number;
  location_type: string;
}

export interface ComplaintAttachment {
  attachment_id: number;
  complaint_id: number;
  file_name: string;
  file_path: string;
  file_type: string;
  mime_type: string;
  file_size: number;
  uploaded_at: string;
  /** e.g. `/uploads/complaints/1/file.jpg` — use `mediaUrl()` from api/client for absolute URL */
  url: string;
}

export interface Complaint {
  complaint_id: number;
  title: string;
  description: string;
  complaint_type: ComplaintType;
  priority: Priority;
  status: ComplaintStatus;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  location_id: number;
  raised_by: number;
  department_id: number;
  approval_status: ApprovalStatus;
  approved_by: number | null;
  approval_date: string | null;
  /** Present when API includes nested location (list/detail). */
  location?: Location | null;
  attachments?: ComplaintAttachment[];
}

export interface Assignment {
  assignment_id: number;
  complaint_id: number;
  assigned_to: number;
  assigned_by: number;
  assigned_date: string;
  completion_date: string | null;
  work_notes: string | null;
  assignment_status: AssignmentStatus;
}

export interface StatusHistoryRow {
  history_id: number;
  complaint_id: number;
  changed_by: number;
  old_status: string | null;
  new_status: string;
  remarks: string | null;
  changed_at: string;
}

export interface Feedback {
  feedback_id: number;
  complaint_id: number;
  rating: number;
  feedback_comment: string;
  confirmed: boolean;
  feedback_date: string;
}

export interface ComplaintDetail extends Complaint {
  assignments: Assignment[];
  status_history: StatusHistoryRow[];
  feedback: Feedback | null;
}

export interface DashboardStats {
  total_complaints: number;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  pending_maintenance_approvals: number;
  open_assignments_for_me: number;
  my_open_complaints: number;
}
