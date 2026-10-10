import type { Provider } from "./types";

/** Whether a stored key has been seen to work since it was last written. */
export const KEY_STATUSES = ["unverified", "valid", "invalid"] as const;

export type KeyStatus = (typeof KEY_STATUSES)[number];

/**
 * Everything about a stored key that is safe to show its owner. The key itself
 * never appears here: only its last four characters, so a user can tell which
 * key they stored without it being readable again.
 */
export type ProviderKeyRecord = {
	provider: Provider;
	last4: string;
	status: KeyStatus;
	verifiedAt: string | null;
	createdAt: string;
};

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Shorter than any provider issues, so a paste that missed is caught before it is stored. */
export const MIN_KEY_LENGTH = 8;
