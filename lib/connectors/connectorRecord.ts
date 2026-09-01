import type { BYOKProvider } from "./providerCatalog";

/** Whether a stored key has been seen to work since it was last written. */
export type ConnectorStatus = "unverified" | "valid" | "invalid";

/**
 * Everything about a stored key that is safe to show its owner. The key itself
 * never appears here: only its last four characters, so a user can tell which
 * key they stored without it being readable again.
 */
export type ConnectorRecord = {
	provider: BYOKProvider;
	last4: string;
	status: ConnectorStatus;
	verifiedAt: string | null;
	createdAt: string;
};

export type ValidationResult = { ok: true } | { ok: false; error: string };
