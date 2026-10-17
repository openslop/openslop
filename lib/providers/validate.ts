import type { ValidationResult } from "@/lib/connectors/provider-key";

export const rejected = (status: number): ValidationResult => ({
	verdict: "invalid",
	error:
		status === 401 || status === 403
			? "The provider rejected this key."
			: `The provider answered ${status}.`,
});

export const fromStatus = (response: Response): ValidationResult =>
	response.ok ? { verdict: "valid" } : rejected(response.status);

export const unanswered: ValidationResult = {
	verdict: "unknown",
	error:
		"Could not reach the provider to check this key. Test it again in a moment.",
};

/**
 * A check that hangs would hold the request open for the whole platform limit
 * with the user watching a spinner. Aborting reads as "we could not tell".
 */
const TIMEOUT_MS = 5_000;

export const probe = (url: string, init?: RequestInit) =>
	fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

export const validateByProbe = async (
	url: string,
	init?: RequestInit,
): Promise<ValidationResult> => fromStatus(await probe(url, init));
