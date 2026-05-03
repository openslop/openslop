import { BaseSFXConnector } from "../connector";
import { OpenSlopSFXGateway } from "@/lib/gateway/openslop/sfx";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopSFX extends BaseSFXConnector {
	protected gateway: OpenSlopSFXGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopSFXGateway(config.baseUrl);
	}
}
