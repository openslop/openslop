import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";

export const OPENSLOP_API_PREFIX = "/api/v1";

/**
 * Where generations that run on the user's own key are served from. These
 * routes are session-authenticated rather than API-access gated: they read the
 * key stored on the requesting account and never accept one from the client.
 */
export const THIRD_PARTY_API_PREFIX = "/api/third-party";

export const apiPrefixFor = (provider: ProviderKey): string =>
	provider === MANAGED_PROVIDER ? OPENSLOP_API_PREFIX : THIRD_PARTY_API_PREFIX;
