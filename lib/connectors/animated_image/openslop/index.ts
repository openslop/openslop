import { OpenSlopVideoGateway } from "@/lib/gateway/openslop/video";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { BaseAnimatedImageConnector } from "../connector";

export class OpenSlopAnimatedImage extends BaseAnimatedImageConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopVideoGateway(config.baseUrl), config);
	}
}
