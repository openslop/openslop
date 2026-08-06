"use client";

import { toast } from "sonner";
import { errorMessage } from "./errors";

/**
 * The one way an error reaches the user. Callers hand over the raw cause; this
 * decides what a human sees, so no UI has to pick between `errorMessage` and
 * the transport-only `stringifyError`.
 */
export function toastError(error: unknown, label?: string): void {
	const message = errorMessage(error);
	toast.error(label ? `${label}: ${message}` : message);
}
