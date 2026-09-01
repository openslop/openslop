import { BaseAnimatedImageConnector } from "../connector";
import { ThirdPartyVideoGateway } from "@/lib/gateway/thirdparty/video";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class ThirdPartyAnimatedImage extends BaseAnimatedImageConnector {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyVideoGateway(config.baseUrl), config);
	}
}
