import { BaseVideoConnector } from "../connector";
import { ThirdPartyVideoGateway } from "@/lib/gateway/thirdparty/video";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class ThirdPartyVideo extends BaseVideoConnector {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyVideoGateway(config.baseUrl), config);
	}
}
