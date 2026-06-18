import { OpenSlopImageGateway } from "@/lib/gateway/openslop/image";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { BaseAnimatedImageConnector } from "../connector";

export class OpenSlopAnimatedImage extends BaseAnimatedImageConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopImageGateway(config.baseUrl), config);
	}
}
