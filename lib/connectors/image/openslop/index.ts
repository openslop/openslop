import { BaseImageConnector } from "../connector";
import { OpenSlopImageGateway } from "@/lib/gateway/openslop/image";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopImage extends BaseImageConnector {
	protected gateway: OpenSlopImageGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopImageGateway(config.baseUrl);
	}
}
