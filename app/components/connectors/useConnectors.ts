"use client";

import { useMemo } from "react";
import type { ConnectorRecord } from "@/lib/connectors/connectorRecord";
import type { ProviderKey } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

/** One read of the account's connectors, for callers that ask about many providers in a render. */
export function useConnectorLookup(): (
	provider: ProviderKey,
) => ConnectorRecord | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(() => {
		const byProvider = new Map(connectors.map((row) => [row.provider, row]));
		return (provider: ProviderKey) => byProvider.get(provider) ?? null;
	}, [connectors]);
}

export function useConnector(provider: ProviderKey): ConnectorRecord | null {
	return useConnectorLookup()(provider);
}

/** The provider a generation still cannot run on, or null when it can: a stored key counts whether or not it has been verified since. */
export function useMissingKey(): (provider: ProviderKey) => ProviderKey | null {
	const connector = useConnectorLookup();
	return (provider) => (connector(provider) ? null : provider);
}
