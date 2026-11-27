import { z } from "zod";
import {
	KEY_STATUSES,
	type KeyStatus,
	type ProviderKeyCheck,
	type ProviderKeyRecord,
	type ProviderKeysView,
	type ValidationResult,
} from "@/lib/connectors/provider-key";
import {
	BYOKProviderSchema,
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/provider-catalog";
import type { Provider } from "@/lib/connectors/types";
import { createClient } from "@/lib/supabase/server";
import { selectColumns } from "@/lib/supabase/select-columns";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * The account has no key for a provider it was asked to generate with. An
 * expected failure with one wording and one status, so every route that can hit
 * it answers the same way: the uniform error envelope maps it to a 400.
 */
export class MissingProviderKeyError extends Error {
	constructor(readonly provider: Provider) {
		super(`Connect ${PROVIDER_CATALOG[provider].name} to use this model.`);
		this.name = "MissingProviderKeyError";
	}
}

const ProviderKeyRowSchema = z.object({
	provider: BYOKProviderSchema,
	last4: z.string(),
	status: z.enum(KEY_STATUSES),
	verified_at: z.string().nullable(),
	created_at: z.string(),
});
const PROVIDER_KEY_COLUMNS = selectColumns(ProviderKeyRowSchema);

const toRecord = (
	row: z.infer<typeof ProviderKeyRowSchema>,
): ProviderKeyRecord => ({
	provider: row.provider,
	last4: row.last4,
	status: row.status,
	verifiedAt: row.verified_at,
	createdAt: row.created_at,
});

/**
 * The keys an account has stored. Only ever the metadata: the key itself lives
 * in the vault and is read one generation at a time. Read through the caller's
 * own session, so row-level security is a second lock on the filter below.
 */
export async function listProviderKeys(
	userId: string,
): Promise<ProviderKeyRecord[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("provider_keys")
		.select(PROVIDER_KEY_COLUMNS)
		.eq("user_id", userId)
		.order("created_at", { ascending: true });
	if (error) throw new Error(`Failed to load provider keys: ${error.message}`);
	return z.array(ProviderKeyRowSchema).parse(data).map(toRecord);
}

/**
 * The vault-backed functions, which only the service role may execute. They are
 * the only way a key is written or read, so the client and the throw-on-failure
 * contract live here rather than at each call site.
 */
async function providerKeyRpc(
	fn: string,
	args: Record<string, string>,
	failure: string,
): Promise<unknown> {
	const { data, error } = await createServiceClient().rpc(fn, args);
	if (error) throw new Error(`${failure}: ${error.message}`);
	return data;
}

export async function saveProviderKey(
	userId: string,
	provider: BYOKProvider,
	key: string,
): Promise<void> {
	await providerKeyRpc(
		"provider_key_set",
		{
			p_user_id: userId,
			p_provider: provider,
			p_key: key,
			p_last4: key.slice(-4),
		},
		"Failed to store provider key",
	);
}

/** The plaintext key, for the one request that is about to use it. */
export async function readProviderKey(
	userId: string,
	provider: Provider,
): Promise<string | null> {
	return z
		.string()
		.nullable()
		.parse(
			await providerKeyRpc(
				"provider_key_read",
				{ p_user_id: userId, p_provider: provider },
				"Failed to read provider key",
			),
		);
}

export async function deleteProviderKey(
	userId: string,
	provider: BYOKProvider,
): Promise<void> {
	await providerKeyRpc(
		"provider_key_delete",
		{ p_user_id: userId, p_provider: provider },
		"Failed to remove provider key",
	);
}

export async function setKeyStatus(
	userId: string,
	provider: BYOKProvider,
	status: KeyStatus,
): Promise<void> {
	await providerKeyRpc(
		"provider_key_set_status",
		{ p_user_id: userId, p_provider: provider, p_status: status },
		"Failed to update provider key",
	);
}

export async function providerKeysView(
	userId: string,
): Promise<ProviderKeysView> {
	return { providerKeys: await listProviderKeys(userId) };
}

export async function providerKeyCheck(
	userId: string,
	validation: ValidationResult,
): Promise<ProviderKeyCheck> {
	return { ...(await providerKeysView(userId)), validation };
}
