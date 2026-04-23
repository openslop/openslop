import { BaseSFXConnector } from "../connector";
import { OpenSlopSFXGateway } from "@/lib/gateway/openslop/sfx";
import type { ConnectorConfig, ModelInfo } from "@/lib/connectors/types";
import { modelsFromMap } from "@/lib/connectors/types";
import { SFX_MODELS } from "./models";

export class OpenSlopSFX extends BaseSFXConnector {
	protected gateway: OpenSlopSFXGateway;

	constructor(config: ConnectorConfig) {
		super(config);
		this.gateway = new OpenSlopSFXGateway(config.baseUrl);
	}

	async listModels(): Promise<ModelInfo[]> {
		return modelsFromMap(SFX_MODELS);
	}
}
