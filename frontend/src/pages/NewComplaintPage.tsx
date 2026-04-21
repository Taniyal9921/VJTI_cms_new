import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import * as cms from "../api/cms";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { TextArea } from "../components/ui/TextArea";
import type { ComplaintType, Department, Priority } from "../types/models";
import {useTranslation} from "react-i18next";

/** Select value that opens the custom text field. */
const OTHER = "Other";

const BUILDING_OPTIONS = [
  "Main Block",
  "Annex Block",
  "Library",
  "Laboratory Complex",
  "Administrative Block",
  "Hostel A",
  "Hostel B",
  "Canteen / Mess",
  "Sports Complex",
  "Other",
] as const;

const FLOOR_OPTIONS = [
  "Basement",
  "Ground",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "Terrace",
  "Other",
] as const;

function resolvedPick(selected: string, otherValue: string): string {
  if (selected === OTHER) return otherValue.trim();
  return selected.trim();
}

export function NewComplaintPage() {
  const { t } = useTranslation();
  const nav = useNavigate();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [departmentId, setDepartmentId] = useState<number | "">("");
  const [building, setBuilding] = useState<string>(BUILDING_OPTIONS[0]);
  const [buildingOther, setBuildingOther] = useState("");
  const [floor, setFloor] = useState<string>(FLOOR_OPTIONS[1]);
  const [floorOther, setFloorOther] = useState("");
  const [locationDetail, setLocationDetail] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [complaintType, setComplaintType] = useState<ComplaintType>("Housekeeping");
  const [priority, setPriority] = useState<Priority>("Medium");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    cms.fetchDepartments().then(setDepartments).catch(() => {});
  }, []);

  const previewLocation = useMemo(() => {
    const b = resolvedPick(building, buildingOther);
    const f = resolvedPick(floor, floorOther);
    const d = locationDetail.trim();
    const parts: string[] = [];
    if (b) parts.push(b);
    if (f) parts.push(`${t("floor")} ${f}`);
    if (d) parts.push(d);
    return parts.length ? parts.join(" · ") : "—";
  }, [building, buildingOther, floor, floorOther, locationDetail, t]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (departmentId === "") {
      toast.error(t("toast_sel_dept"));
      return;
    }
    const building_name = resolvedPick(building, buildingOther);
    const floor_number = resolvedPick(floor, floorOther);
    if (!building_name) {
      toast.error(t("toast_sel_bldg"));
      return;
    }
    if (!floor_number) {
      toast.error(t("toast_sel_floor"));
      return;
    }

    setBusy(true);
    try {
      const c = await cms.createComplaint(
        {
          title,
          description,
          complaint_type: complaintType,
          priority,
          department_id: departmentId as number,
          building_name,
          floor_number,
          location_detail: locationDetail.trim() || undefined,
        },
        mediaFiles.length ? mediaFiles : undefined,
      );
      toast.success(t("toast_complaint_filed"));
      nav(`/complaints/${c.complaint_id}`);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t("new_complaint_title")}</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
        {t("new_complaint_desc")}
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("department")}</label>
          <Select
            required
            value={departmentId === "" ? "" : String(departmentId)}
            onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">{t("opt_select")}</option>
            {departments.map((d) => (
              <option key={d.department_id} value={d.department_id}>
                {d.department_name}
              </option>
            ))}
          </Select>
        </div>

        <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-4 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">{t("location")}</p>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {t("location_desc")}
          </p>

          <div className="mt-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("building")}</label>
              <Select value={building} onChange={(e) => setBuilding(e.target.value)}>
                {BUILDING_OPTIONS.map((b) => (
                  <option key={b} value={b}>
                    {b === OTHER ? t("opt_other") : t(`bldg_${b}`)}
                  </option>
                ))}
              </Select>
              {building === OTHER && (
                <Input
                  className="mt-2"
                  required
                  placeholder={t("placeholder_building")}
                  value={buildingOther}
                  onChange={(e) => setBuildingOther(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("floor")}</label>
              <Select value={floor} onChange={(e) => setFloor(e.target.value)}>
                {FLOOR_OPTIONS.map((f) => (
                  <option key={f} value={f}>
                    {f === OTHER ? t("opt_other_type") : t(`floor_${f}`)}
                  </option>
                ))}
              </Select>
              {floor === OTHER && (
                <Input
                  className="mt-2"
                  required
                  placeholder={t("placeholder_floor")}
                  value={floorOther}
                  onChange={(e) => setFloorOther(e.target.value)}
                />
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
                {t("room_wing_detail")} <span className="font-normal text-slate-400">({t("optional")})</span>
              </label>
              <Input
                placeholder={t("placeholder_room")}
                value={locationDetail}
                onChange={(e) => setLocationDetail(e.target.value)}
                maxLength={128}
              />
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              <span className="font-medium text-slate-700 dark:text-slate-200">{t("preview")}:</span> {previewLocation}
            </p>
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("type")}</label>
          <Select value={complaintType} onChange={(e) => setComplaintType(e.target.value as ComplaintType)}>
            <option value="Housekeeping">{t("enum_Housekeeping")}</option>
            <option value="Maintenance">{t("enum_Maintenance")}</option>
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("priority")}</label>
          <Select value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
            {(["Low", "Medium", "High", "Emergency"] as Priority[]).map((p) => (
              <option key={p} value={p}>
                {t(`enum_${p}`)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("title")}</label>
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">{t("description")}</label>
          <TextArea required value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 dark:text-slate-300">
            {t("photos_videos")} <span className="font-normal text-slate-400">({t("optional")})</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/webm,video/quicktime,video/x-msvideo"
            multiple
            className="mt-1 block w-full text-sm text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-brand-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-brand-700 hover:file:bg-brand-100 dark:text-slate-300 dark:file:bg-slate-700 dark:file:text-slate-100"
            onChange={(e) => setMediaFiles(e.target.files ? Array.from(e.target.files) : [])}
          />
          <p className="mt-1 text-xs text-slate-500">{t("upload_hint")}</p>
        </div>
        <Button type="submit" disabled={busy}>
          {busy ? t("submitting") : t("submit_complaint")}
        </Button>
      </form>
    </div>
  );
}
