import { BaseImageConnector } from "../connector";
import { OpenSlopImageGateway } from "@/lib/gateway/openslop/image";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopImage extends BaseImageConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopImageGateway(config.baseUrl), config);
	}
}
