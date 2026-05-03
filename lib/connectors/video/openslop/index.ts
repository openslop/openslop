import { BaseVideoConnector } from "../connector";
import { OpenSlopVideoGateway } from "@/lib/gateway/openslop/video";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopVideo extends BaseVideoConnector {
	protected gateway: OpenSlopVideoGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopVideoGateway(config.baseUrl);
	}
}
