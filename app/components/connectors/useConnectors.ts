"use client";

import { useMemo } from "react";
import type { ConnectorRecord } from "@/lib/connectors/connectorRecord";
import {
	MANAGED_PROVIDER,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

export function useConnector(provider: BYOKProvider): ConnectorRecord | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(
		() => connectors.find((row) => row.provider === provider) ?? null,
		[connectors, provider],
	);
}

/**
 * The key a provider is still missing, or null when a generation can already
 * run on it: the hosted one never needs one, and a stored key counts whether or
 * not it has been verified since.
 */
export function useMissingKey(): (
	provider: ProviderKey,
) => BYOKProvider | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(() => {
		const stored = new Set<ProviderKey>(connectors.map((row) => row.provider));
		return (provider: ProviderKey) =>
			provider === MANAGED_PROVIDER || stored.has(provider) ? null : provider;
	}, [connectors]);
}
