import { toast } from "sonner";
import { mapBackendError } from "./errors";

export const notify = {
  success(message: string, description?: string) {
    toast.success(message, description ? { description } : undefined);
  },
  error(message: string, description?: string) {
    toast.error(message, description ? { description } : undefined);
  },
  warning(message: string, description?: string) {
    toast.warning(message, description ? { description } : undefined);
  },
  info(message: string, description?: string) {
    toast(message, description ? { description } : undefined);
  },
  fromError(err: unknown, fallback = "Something went wrong") {
    const msg = mapBackendError(err) || fallback;
    toast.error(msg);
    return msg;
  },
};
