import type {
	ConnectorRecord,
	ConnectorStatus,
	ValidationResult,
} from "@/lib/connectors/connectorRecord";
import { providerMeta } from "@/lib/connectors/providerCatalog";
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
	provider: row.provider as ProviderKey,
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

export async function saveConnectorKey(
	userId: string,
	provider: ProviderKey,
	key: string,
): Promise<void> {
	const supabase = createServiceClient();
	const { error } = await supabase.rpc("connector_set_key", {
		p_user_id: userId,
		p_provider: provider,
		p_key: key,
		p_last4: key.slice(-4),
	});
	if (error) throw new Error(`Failed to store connector key: ${error.message}`);
}

/** The plaintext key, for the one request that is about to use it. */
export async function readConnectorKey(
	userId: string,
	provider: ProviderKey,
): Promise<string | null> {
	const supabase = createServiceClient();
	const { data, error } = await supabase.rpc("connector_read_key", {
		p_user_id: userId,
		p_provider: provider,
	});
	if (error) throw new Error(`Failed to read connector key: ${error.message}`);
	return (data as string | null) ?? null;
}

export async function deleteConnector(
	userId: string,
	provider: ProviderKey,
): Promise<void> {
	const supabase = createServiceClient();
	const { error } = await supabase.rpc("connector_delete", {
		p_user_id: userId,
		p_provider: provider,
	});
	if (error) throw new Error(`Failed to remove connector: ${error.message}`);
}

export async function setConnectorStatus(
	userId: string,
	provider: ProviderKey,
	status: ConnectorStatus,
): Promise<void> {
	const supabase = createServiceClient();
	const { error } = await supabase.rpc("connector_set_status", {
		p_user_id: userId,
		p_provider: provider,
		p_status: status,
	});
	if (error) throw new Error(`Failed to update connector: ${error.message}`);
}

/**
 * Refuses early when the account has no key for a provider, before a job is
 * created for a generation that could only fail. Reads the row rather than the
 * secret, so nothing is decrypted to answer a question about existence.
 */
export async function requireConnector(
	userId: string,
	provider: ProviderKey,
): Promise<void> {
	const supabase = await createClient();
	const { data, error } = await supabase
		.from("connectors")
		.select("provider")
		.eq("user_id", userId)
		.eq("provider", provider)
		.maybeSingle();
	if (error) throw new Error(`Failed to load connector: ${error.message}`);
	if (!data) throw new MissingConnectorKeyError(provider);
}

/** What every connector mutation answers with: the fresh list, and any verdict. */
export async function connectorsView(
	userId: string,
	validation?: ValidationResult,
): Promise<{ connectors: ConnectorRecord[]; validation?: ValidationResult }> {
	return {
		connectors: await listConnectors(userId),
		...(validation && { validation }),
	};
}
