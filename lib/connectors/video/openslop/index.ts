import { BaseVideoConnector } from "../connector";
import { OpenSlopVideoGateway } from "@/lib/gateway/openslop/video";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopVideo extends BaseVideoConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopVideoGateway(config.baseUrl), config);
	}
}
