import {
	isByokProvider,
	LOCAL_PROVIDER,
} from "@/lib/connectors/provider-catalog";
import type { Provider } from "@/lib/connectors/types";

export const OPENSLOP_API_PREFIX = "/api/v1";

/**
 * Where generations that run on the user's own key are served from. These
 * routes are session-authenticated rather than API-access gated: they read the
 * key stored on the requesting account and never accept one from the client.
 */
export const THIRD_PARTY_API_PREFIX = "/api/third-party";

/** Where the agents installed on the user's own computer are served from, in development only. */
const LOCAL_API_PREFIX = "/api/local";

export function apiPrefixFor(provider: Provider): string {
	if (provider === LOCAL_PROVIDER) return LOCAL_API_PREFIX;
	return isByokProvider(provider)
		? THIRD_PARTY_API_PREFIX
		: OPENSLOP_API_PREFIX;
}
