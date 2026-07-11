import { serializeError } from "serialize-error";

export const stringifyError = (error: unknown): string =>
	JSON.stringify(serializeError(error));

export const errorMessage = (error: unknown): string =>
	error instanceof Error ? error.message : String(error);

type WithMessage = { message?: unknown };

/**
 * A human-readable message for user-facing error fields (the red failure
 * banner renders these verbatim) — never a raw JSON dump; keep the full
 * payload on a separate structured field (e.g. errorDetail) instead. Handles
 * strings, Error instances, and the common provider API shapes `{message}`,
 * `{error: {message}}`, and `{errors: [{message}]}`.
 */
export function humanErrorMessage(error: unknown, fallback: string): string {
	if (typeof error === "string") return error;
	if (error instanceof Error) return error.message;
	if (error !== null && typeof error === "object") {
		const obj = error as WithMessage & {
			error?: WithMessage;
			errors?: WithMessage[];
		};
		const message =
			obj.message ?? obj.error?.message ?? obj.errors?.[0]?.message;
		if (typeof message === "string") return message;
	}
	return fallback;
}
