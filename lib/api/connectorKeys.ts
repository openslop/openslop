import type {
	ConnectorRecord,
	ConnectorStatus,
	ValidationResult,
} from "@/lib/connectors/connectorRecord";
import {
	providerMeta,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";

/**
 * The account has no key for a provider it was asked to generate with. An
 * expected failure with one wording and one status, so every route that can hit
 * it answers the same way: the uniform error envelope maps it to a 400.
 */
export class MissingConnectorKeyError extends Error {
	constructor(readonly provider: ProviderKey) {
		super(`Connect ${providerMeta(provider).name} to use this model.`);
		this.name = "MissingConnectorKeyError";
	}
}

type ConnectorRow = {
	provider: string;
	last4: string;
	status: ConnectorStatus;
	verified_at: string | null;
	created_at: string;
};

const toRecord = (row: ConnectorRow): ConnectorRecord => ({
	provider: row.provider as BYOKProvider,
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
export async function listConnectors(
	userId: string,
): Promise<ConnectorRecord[]> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("connectors")
		.select("provider, last4, status, verified_at, created_at")
		.eq("user_id", userId)
		.order("created_at", { ascending: true });
	if (error) throw new Error(`Failed to load connectors: ${error.message}`);
	return (data as ConnectorRow[]).map(toRecord);
}

/**
 * The vault-backed functions, which only the service role may execute. They are
 * the only way a key is written or read, so the client and the throw-on-failure
 * contract live here rather than at each call site.
 */
async function connectorRpc<T>(
	fn: string,
	args: Record<string, string>,
	failure: string,
): Promise<T> {
	const { data, error } = await createServiceClient().rpc(fn, args);
	if (error) throw new Error(`${failure}: ${error.message}`);
	return data as T;
}

export async function saveConnectorKey(
	userId: string,
	provider: BYOKProvider,
	key: string,
): Promise<void> {
	await connectorRpc(
		"connector_set_key",
		{
			p_user_id: userId,
			p_provider: provider,
			p_key: key,
			p_last4: key.slice(-4),
		},
		"Failed to store connector key",
	);
}

/** The plaintext key, for the one request that is about to use it. */
export async function readConnectorKey(
	userId: string,
	provider: ProviderKey,
): Promise<string | null> {
	return (
		(await connectorRpc<string | null>(
			"connector_read_key",
			{ p_user_id: userId, p_provider: provider },
			"Failed to read connector key",
		)) ?? null
	);
}

export async function deleteConnector(
	userId: string,
	provider: BYOKProvider,
): Promise<void> {
	await connectorRpc(
		"connector_delete",
		{ p_user_id: userId, p_provider: provider },
		"Failed to remove connector",
	);
}

export async function setConnectorStatus(
	userId: string,
	provider: BYOKProvider,
	status: ConnectorStatus,
): Promise<void> {
	await connectorRpc(
		"connector_set_status",
		{ p_user_id: userId, p_provider: provider, p_status: status },
		"Failed to update connector",
	);
}

export async function connectorsView(
	userId: string,
	validation?: ValidationResult,
): Promise<{ connectors: ConnectorRecord[]; validation?: ValidationResult }> {
	return {
		connectors: await listConnectors(userId),
		...(validation && { validation }),
	};
}
