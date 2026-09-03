"use client";

import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import type { Provider } from "@/lib/connectors/types";
import { useAccount } from "@/lib/user/useAccount";

/** A stored key counts whether or not it has been verified since. */
export function useProviderKeyLookup(): (
	provider: Provider,
) => ProviderKeyRecord | null {
	const providerKeys = useAccount((state) => state.providerKeys);
	return (provider) =>
		providerKeys.find((row) => row.provider === provider) ?? null;
}

export function useProviderKey(provider: Provider): ProviderKeyRecord | null {
	return useProviderKeyLookup()(provider);
}
