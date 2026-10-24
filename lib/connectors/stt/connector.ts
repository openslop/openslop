import type { AssetBundle } from "@/lib/api/asset-bundle";
import { HttpAssetGateway } from "@/lib/gateway/http";
import { readTimestamps } from "@/lib/providers/timestamps-file";
import { BaseJobConnector } from "../asset-base";
import type {
	ResolvedConnectorConfig,
	STTGenerateParams,
	STTResult,
} from "../types";

export class HttpSTTConnector extends BaseJobConnector<
	STTGenerateParams,
	STTResult
> {
	readonly type = "stt" as const;

	constructor(config: ResolvedConnectorConfig) {
		super(new HttpAssetGateway(config.model, "stt"), config);
	}

	async resolveBundle(bundle: AssetBundle): Promise<STTResult> {
		return {
			durationSec: bundle.durationSec,
			textTimestamps: await readTimestamps(bundle),
		};
	}
}
