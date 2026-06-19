import { BaseSFXConnector } from "../connector";
import { OpenSlopSFXGateway } from "@/lib/gateway/openslop/sfx";
import type { ConnectorConfig } from "@/lib/connectors/types";

export class OpenSlopSFX extends BaseSFXConnector {
	constructor(config: ConnectorConfig) {
		super(new OpenSlopSFXGateway(config.baseUrl), config);
	}
}
