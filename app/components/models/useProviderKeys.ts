"use client";

import { useMemo } from "react";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import type { Provider } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

export function useProviderKeyLookup(): (
	provider: Provider,
) => ProviderKeyRecord | null {
	const providerKeys = useAccount((state) => state.providerKeys);
	return useMemo(() => {
		const byProvider = new Map(providerKeys.map((row) => [row.provider, row]));
		return (provider: Provider) => byProvider.get(provider) ?? null;
	}, [providerKeys]);
}

export function useProviderKey(provider: Provider): ProviderKeyRecord | null {
	return useProviderKeyLookup()(provider);
}

/** The provider a generation still cannot run on, or null when it can: a stored key counts whether or not it has been verified since. */
export function useMissingKey(): (provider: Provider) => Provider | null {
	const key = useProviderKeyLookup();
	return (provider) => (key(provider) ? null : provider);
}
