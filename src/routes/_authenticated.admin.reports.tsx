import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { listAllReports, updateReportStatus } from "../services/adminService";
import { Layout } from "../components/Layout";
import { Spinner, ErrorMessage, EmptyState } from "../components/Feedback";
import { extractError } from "../services/api";
import { useAuth } from "../context/AuthContext";
import type { Report, ReportStatus, User } from "../services/types";

export const Route = createFileRoute("/_authenticated/admin/reports")({
  component: AdminReports;
});
