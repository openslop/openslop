import { BaseImageConnector } from "../connector";
import { ThirdPartyImageGateway } from "@/lib/gateway/thirdparty/image";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class ThirdPartyImage extends BaseImageConnector {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyImageGateway(config.baseUrl), config);
	}
}
