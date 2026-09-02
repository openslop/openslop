import type { ValidationResult } from "@/lib/connectors/connectorRecord";

/**
 * A vendor that can be asked whether the key it was built with works. The check
 * is the vendor's own to define: only it knows which call is cheapest and how
 * it reports a refusal.
 */
export interface ValidatingProvider {
	validate(): Promise<ValidationResult>;
}

export const rejected = (status: number): ValidationResult => ({
	ok: false,
	error:
		status === 401 || status === 403
			? "The provider rejected this key."
			: `The provider answered ${status}.`,
});

export const fromStatus = (response: Response): ValidationResult =>
	response.ok ? { ok: true } : rejected(response.status);

/**
 * A check that hangs would hold the request open for the whole platform limit
 * with the user watching a spinner. Aborting reads as "we could not tell".
 */
const TIMEOUT_MS = 5_000;

export const probe = (url: string, init?: RequestInit) =>
	fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
