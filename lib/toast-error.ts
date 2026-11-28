"use client";

import { toast, type ExternalToast } from "sonner";
import { ApiError } from "./clients/http";
import { toastNewVersion } from "./deployment/new-version-toast";
import { errorMessage } from "./errors";

const requestIdLine = (error: unknown): string | undefined =>
	error instanceof ApiError && error.requestId
		? `Request ${error.requestId}`
		: undefined;

const untilDismissed = {
	duration: Number.POSITIVE_INFINITY,
	closeButton: true,
} satisfies ExternalToast;

/**
 * The one way an error reaches the user. Callers hand over the raw cause; this
 * decides what a human sees. `options` only styles the toast.
 */
export function toastError(
	error: unknown,
	label?: string,
	options?: ExternalToast,
): void {
	if (error instanceof ApiError && error.code === "stale_deployment")
		return toastNewVersion();
	const message = errorMessage(error);
	toast.error(label ? `${label}: ${message}` : message, {
		...untilDismissed,
		description: requestIdLine(error),
		...options,
	});
}
