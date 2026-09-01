import { BaseMusicConnector } from "../connector";
import { ThirdPartyMusicGateway } from "@/lib/gateway/thirdparty/music";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class ThirdPartyMusic extends BaseMusicConnector {
	constructor(config: ConnectorConfig) {
		super(new ThirdPartyMusicGateway(config.baseUrl), config);
	}
}
