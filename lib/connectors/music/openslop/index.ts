import { BaseMusicConnector } from "../connector";
import { OpenSlopMusicGateway } from "@/lib/gateway/openslop/music";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopMusic extends BaseMusicConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopMusicGateway(config.baseUrl), config);
	}
}
