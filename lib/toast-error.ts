"use client";

import { toast, type ExternalToast } from "sonner";
import { ApiError } from "./clients/http";
import { errorMessage } from "./errors";

const requestIdLine = (error: unknown): string | undefined =>
	error instanceof ApiError && error.requestId
		? `Request ${error.requestId}`
		: undefined;

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
	toast.error(label ? `${label}: ${message}` : message, {
		description: requestIdLine(error),
		...options,
	});
}
