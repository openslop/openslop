"use client";

import { useMemo } from "react";
import type { ConnectorRecord } from "@/lib/connectors/connectorRecord";
import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

/** The stored key for a provider, when the account has one. */
export function useConnector(provider: ProviderKey): ConnectorRecord | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(
		() => connectors.find((row) => row.provider === provider) ?? null,
		[connectors, provider],
	);
}

/**
 * Whether a generation can run on a provider at all. The hosted one always can;
 * the rest need a key, whether or not it has been verified since.
 */
export function useCanGenerateWith(): (provider: ProviderKey) => boolean {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(() => {
		const stored = new Set(connectors.map((row) => row.provider));
		return (provider: ProviderKey) =>
			provider === MANAGED_PROVIDER || stored.has(provider);
	}, [connectors]);
}
