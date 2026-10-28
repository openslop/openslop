import { z } from "zod";
import { ProviderSchema, type Provider } from "./types";

/** Whether a stored key has been seen to work since it was last written. */
export const KEY_STATUSES = ["unverified", "valid", "invalid"] as const;

export type KeyStatus = (typeof KEY_STATUSES)[number];

/**
 * Everything about a stored key that is safe to show its owner. The key itself
 * never appears here: only its last four characters, so a user can tell which
 * key they stored without it being readable again.
 */
export const ProviderKeyRecordSchema = z.object({
	provider: ProviderSchema,
	last4: z.string(),
	status: z.enum(KEY_STATUSES),
	verifiedAt: z.string().nullable(),
	createdAt: z.string(),
});

export type ProviderKeyRecord = z.infer<typeof ProviderKeyRecordSchema>;

export const findProviderKey = (
	keys: ProviderKeyRecord[],
	provider: Provider,
): ProviderKeyRecord | null =>
	keys.find((key) => key.provider === provider) ?? null;

export const ValidationResultSchema = z.discriminatedUnion("ok", [
	z.object({ ok: z.literal(true) }),
	z.object({ ok: z.literal(false), error: z.string() }),
]);

export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export const ProviderKeysViewSchema = z.object({
	providerKeys: z.array(ProviderKeyRecordSchema),
});

export type ProviderKeysView = z.infer<typeof ProviderKeysViewSchema>;

/** A key change answered with whether that key works, beside the list it changed. */
export const ProviderKeyCheckSchema = ProviderKeysViewSchema.extend({
	validation: ValidationResultSchema,
});

export type ProviderKeyCheck = z.infer<typeof ProviderKeyCheckSchema>;

/** Shorter than any provider issues, so a paste that missed is caught before it is stored. */
export const MIN_KEY_LENGTH = 8;
