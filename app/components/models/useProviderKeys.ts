"use client";

import { useMemo } from "react";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import type { ProviderKey } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

/** One read of the account's provider keys, for callers that ask about many providers in a render. */
export function useProviderKeyLookup(): (
	provider: ProviderKey,
) => ProviderKeyRecord | null {
	const providerKeys = useAccount((state) => state.providerKeys);
	return useMemo(() => {
		const byProvider = new Map(providerKeys.map((row) => [row.provider, row]));
		return (provider: ProviderKey) => byProvider.get(provider) ?? null;
	}, [providerKeys]);
}

export function useProviderKey(
	provider: ProviderKey,
): ProviderKeyRecord | null {
	return useProviderKeyLookup()(provider);
}

/** The provider a generation still cannot run on, or null when it can: a stored key counts whether or not it has been verified since. */
export function useMissingKey(): (provider: ProviderKey) => ProviderKey | null {
	const key = useProviderKeyLookup();
	return (provider) => (key(provider) ? null : provider);
}
