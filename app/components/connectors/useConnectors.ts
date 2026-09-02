"use client";

import { useMemo } from "react";
import type { ConnectorRecord } from "@/lib/connectors/connectorRecord";
import type { ProviderKey } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

export function useConnector(provider: ProviderKey): ConnectorRecord | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(
		() => connectors.find((row) => row.provider === provider) ?? null,
		[connectors, provider],
	);
}

/**
 * The provider a generation still cannot run on, or null when it can: a
 * stored key counts whether or not it has been verified since.
 */
export function useMissingKey(): (provider: ProviderKey) => ProviderKey | null {
	const connectors = useAccount((state) => state.connectors);
	return useMemo(() => {
		const stored = new Set(connectors.map((row) => row.provider));
		return (provider: ProviderKey) => (stored.has(provider) ? null : provider);
	}, [connectors]);
}
