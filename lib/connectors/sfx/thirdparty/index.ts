import { BaseSFXConnector } from "../connector";
import { ThirdPartySFXGateway } from "@/lib/gateway/thirdparty/sfx";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class ThirdPartySFX extends BaseSFXConnector {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartySFXGateway(config.baseUrl), config);
	}
}
