import type { User } from "@supabase/supabase-js";
import type {
	ProviderKeyRecord,
	KeyStatus,
	ValidationResult,
} from "@/lib/connectors/providerKey";
import {
	MANAGED_PROVIDER,
	PROVIDER_CATALOG,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { Provider } from "@/lib/connectors/types";
import { createClient } from "@/lib/supabase/server";
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

type ProviderKeyRow = {
	provider: BYOKProvider;
	last4: string;
	status: KeyStatus;
	verified_at: string | null;
	created_at: string;
};

const toRecord = (row: ProviderKeyRow): ProviderKeyRecord => ({
	provider: row.provider,
	last4: row.last4,
	status: row.status,
	verifiedAt: row.verified_at,
	createdAt: row.created_at,
});

export const hasApiAccess = (user: User): boolean =>
	Boolean(user.app_metadata.api_access);

/**
 * The hosted provider has a key row like any other, so nothing downstream asks
 * which provider needs a key. Every account has it; API access is what makes
 * it valid today, and when it takes a key of its own it will be stored like
 * the rest.
 */
const hostedKey = (user: User): ProviderKeyRecord => ({
	provider: MANAGED_PROVIDER,
	last4: "",
	status: hasApiAccess(user) ? "valid" : "invalid",
	verifiedAt: null,
	createdAt: "",
});

/**
 * The keys an account can generate on: the hosted one, then whatever it has
 * stored. Only ever the metadata: the key itself lives in the vault and is
 * read one generation at a time. Read through the caller's own session, so
 * row-level security is a second lock on the filter below.
 */
export async function listProviderKeys(
	user: User,
): Promise<ProviderKeyRecord[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("provider_keys")
		.select("provider, last4, status, verified_at, created_at")
		.eq("user_id", user.id)
		.order("created_at", { ascending: true });
	if (error) throw new Error(`Failed to load provider keys: ${error.message}`);
	return [hostedKey(user), ...(data as ProviderKeyRow[]).map(toRecord)];
}

/**
 * The vault-backed functions, which only the service role may execute. They are
 * the only way a key is written or read, so the client and the throw-on-failure
 * contract live here rather than at each call site.
 */
async function providerKeyRpc<T>(
	fn: string,
	args: Record<string, string>,
	failure: string,
): Promise<T> {
	const { data, error } = await createServiceClient().rpc(fn, args);
	if (error) throw new Error(`${failure}: ${error.message}`);
	return data as T;
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
	return providerKeyRpc<string | null>(
		"provider_key_read",
		{ p_user_id: userId, p_provider: provider },
		"Failed to read provider key",
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

export type ProviderKeysView = {
	providerKeys: ProviderKeyRecord[];
	validation?: ValidationResult;
};

export async function providerKeysView(
	user: User,
	validation?: ValidationResult,
): Promise<ProviderKeysView> {
	return {
		providerKeys: await listProviderKeys(user),
		...(validation && { validation }),
	};
}
