import { createFileRoute, redirect, Outlet } from "@tanstack/react-router";
import { getStoredToken } from "../services/authService";

export const Route = createFileRoute("/_authenticated")({
  beforeLoad: ({ location }) => {
    if (typeof window === "undefined") return;
    if (!getStoredToken()) {
      throw redirect({
        to: "/auth/login",
        search: { redirect: location.pathname },
      });
    }
  },
  component: () => <Outlet />,
});
