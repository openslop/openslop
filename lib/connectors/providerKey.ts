import { MANAGED_PROVIDER, type BYOKProvider } from "./providerCatalog";

/** Whether a stored key has been seen to work since it was last written. */
export const KEY_STATUSES = ["unverified", "valid", "invalid"] as const;

export type KeyStatus = (typeof KEY_STATUSES)[number];

/**
 * Everything about a stored key that is safe to show its owner. The key itself
 * never appears here: only its last four characters, so a user can tell which
 * key they stored without it being readable again.
 */
export type StoredProviderKey = {
	provider: BYOKProvider;
	last4: string;
	status: KeyStatus;
	verifiedAt: string | null;
	createdAt: string;
};

/** The hosted provider has no key to show; the account's API access is what makes it valid. */
export type HostedProviderKey = {
	provider: typeof MANAGED_PROVIDER;
	status: KeyStatus;
};

/**
 * A provider the account can generate on. The hosted one is a row like any
 * other, so nothing downstream asks which provider needs a key.
 */
export type ProviderKeyRecord = HostedProviderKey | StoredProviderKey;

export type ValidationResult = { ok: true } | { ok: false; error: string };

/** Shorter than any provider issues, so a paste that missed is caught before it is stored. */
export const MIN_KEY_LENGTH = 8;
