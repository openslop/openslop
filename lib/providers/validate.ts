import type { ValidationResult } from "@/lib/connectors/provider-key";

export const rejected: ValidationResult = {
	ok: false,
	error: "The provider rejected this key.",
};

/** Only an auth status says the key is bad; any other failure is no answer. */
export const fromStatus = (response: Response): ValidationResult => {
	if (response.ok) return { ok: true };
	if (response.status === 401 || response.status === 403) return rejected;
	throw new Error(`The provider answered ${response.status}.`);
};

/**
 * A check that hangs would hold the request open for the whole platform limit
 * with the user watching a spinner.
 */
const TIMEOUT_MS = 5_000;

export const probe = (url: string, init?: RequestInit) =>
	fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });

export const validateByProbe = async (
	url: string,
	init?: RequestInit,
): Promise<ValidationResult> => fromStatus(await probe(url, init));
