"use client";

import { toast, type ExternalToast } from "sonner";
import { errorMessage } from "./errors";

/**
 * The one way an error reaches the user. Callers hand over the raw cause; this
 * decides what a human sees, so no UI has to pick between `errorMessage` and
 * the transport-only `stringifyError`. `options` only styles the toast.
 */
export function toastError(
	error: unknown,
	label?: string,
	options?: ExternalToast,
): void {
	const message = errorMessage(error);
	toast.error(label ? `${label}: ${message}` : message, options);
}
