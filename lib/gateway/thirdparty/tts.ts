import type { ProviderKey, VoiceSearchParams } from "@/lib/connectors/types";
import { HttpTTSGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

/**
 * Voice search names its provider explicitly: unlike a generation it carries no
 * model to resolve one from, and the route has to know whose key to read.
 */
export class ThirdPartyTTSGateway extends HttpTTSGateway {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;

	constructor(
		private readonly provider: ProviderKey | undefined,
		baseUrl?: string,
	) {
		super(baseUrl);
	}

	protected voiceQuery(params: VoiceSearchParams): Record<string, string> {
		if (!this.provider)
			throw new Error("Third-party voice search needs a provider");
		return { ...super.voiceQuery(params), provider: this.provider };
	}
}
