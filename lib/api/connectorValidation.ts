import { stringifyError } from "@/lib/errors";
import type { ValidationResult } from "@/lib/connectors/connectorRecord";
import { BYOK_PROVIDERS } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { setConnectorStatus } from "./connectorKeys";

export type BYOKProvider = Exclude<ProviderKey, "openslop">;

const rejected = (status: number): ValidationResult => ({
	ok: false,
	error:
		status === 401 || status === 403
			? "The provider rejected this key."
			: `The provider answered ${status}.`,
});

const fromStatus = (response: Response): ValidationResult =>
	response.ok ? { ok: true } : rejected(response.status);

/**
 * The cheapest authenticated call each provider offers. Validation is a
 * round-trip to the vendor rather than a shape check, so a key that looks right
 * but was revoked still reads as invalid.
 */
const PROBES: Record<BYOKProvider, (key: string) => Promise<ValidationResult>> =
	{
		anthropic: async (key) =>
			fromStatus(
				await fetch("https://api.anthropic.com/v1/models?limit=1", {
					headers: { "x-api-key": key, "anthropic-version": "2023-06-01" },
				}),
			),
		cartesia: async (key) =>
			fromStatus(
				await fetch("https://api.cartesia.ai/voices/?limit=1", {
					headers: { "X-API-Key": key, "Cartesia-Version": "2024-11-13" },
				}),
			),
		elevenlabs: async (key) =>
			fromStatus(
				await fetch("https://api.elevenlabs.io/v1/user", {
					headers: { "xi-api-key": key },
				}),
			),
		// Runware answers its authentication task over the same endpoint every
		// generation uses, and reports a bad key in the body rather than the status.
		runware: async (key) => {
			const response = await fetch("https://api.runware.ai/v1", {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify([{ taskType: "authentication", apiKey: key }]),
			});
			if (!response.ok) return rejected(response.status);
			const body = (await response.json()) as { errors?: unknown[] };
			return body.errors?.length
				? { ok: false, error: "The provider rejected this key." }
				: { ok: true };
		},
	};

export const isBYOKProvider = (
	provider: ProviderKey,
): provider is BYOKProvider =>
	(BYOK_PROVIDERS as ProviderKey[]).includes(provider);

/**
 * Whether a key works. Network trouble is reported as a failed validation
 * rather than thrown: the user asked whether the key works, and "we could not
 * tell" is an answer they can act on.
 */
export async function validateConnectorKey(
	provider: ProviderKey,
	key: string,
): Promise<ValidationResult> {
	if (!isBYOKProvider(provider))
		return { ok: false, error: `${provider} does not take a key` };
	try {
		return await PROBES[provider](key);
	} catch (error) {
		return { ok: false, error: stringifyError(error) };
	}
}

/** Checks a key against its provider and records what it found on the account. */
export async function verifyConnector(
	userId: string,
	provider: ProviderKey,
	key: string,
): Promise<ValidationResult> {
	const result = await validateConnectorKey(provider, key);
	await setConnectorStatus(userId, provider, result.ok ? "valid" : "invalid");
	return result;
}
