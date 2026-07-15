import { api } from "./api";
import type { Report, ReportReason, ReportStatus, ReportTargetType } from "./types";

export async function createReport(input: {
  targetType: ReportTargetType;
  targetId: string;
  reason: ReportReason;
  description?: string;
}): Promise<{ success: boolean; message: string; report: Report }> {
  const { data } = await api.post("/api/reports", input);
  return data;
}

export async function listMyReports(): Promise<Report[]> {
  const { data } = await api.get<Report[] | { reports: Report[] }>("/api/reports/me");
  return Array.isArray(data) ? data : (data.reports ?? []);
}

export async function listAllReports(params: {
  status?: ReportStatus;
  targetType?: ReportTargetType;
  reason?: ReportReason;
} = {}): Promise<Report[]> {
  const { data } = await api.get<Report[] | { reports: Report[] }>("/api/reports", { params });
  return Array.isArray(data) ? data : (data.reports ?? []);
}

export async function getReport(id: string): Promise<Report> {
  const { data } = await api.get<Report | { report: Report }>(`/api/reports/${id}`);
  return (data as { report?: Report }).report ?? (data as Report);
}

export async function updateReportStatus(id: string, status: ReportStatus): Promise<Report> {
  const { data } = await api.patch<Report | { report: Report }>(
    `/api/reports/${id}/status`,
    { status },
  );
  return (data as { report?: Report }).report ?? (data as Report);
}
