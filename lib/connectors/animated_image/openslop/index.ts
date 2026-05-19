import { OpenSlopImageGateway } from "@/lib/gateway/openslop/image";
import type { ConnectorConfig } from "@/lib/connectors/types";
import { BaseAnimatedImageConnector } from "../connector";

export class OpenSlopAnimatedImage extends BaseAnimatedImageConnector {
	protected gateway: OpenSlopImageGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopImageGateway(config.baseUrl);
	}
}
