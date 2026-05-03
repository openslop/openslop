import { BaseMusicConnector } from "../connector";
import { OpenSlopMusicGateway } from "@/lib/gateway/openslop/music";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopMusic extends BaseMusicConnector {
	protected gateway: OpenSlopMusicGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopMusicGateway(config.baseUrl);
	}
}
