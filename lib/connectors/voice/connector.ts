import pick from "lodash/pick";
import { HttpTTSGateway } from "@/lib/gateway/http";
import { VOICE_TRAITS, type Voice } from "@/lib/project/types";
import { BaseConnector } from "../base";
import type {
	AssetResult,
	ConnectorGenerateParams,
	ResolvedConnectorConfig,
} from "../types";

export type VoiceGenerateParams = ConnectorGenerateParams &
	Omit<Voice, "provider" | "model">;

/** Generates the voice the user picked, or else the first its traits find, heard through its preview. */
export class HttpVoiceConnector extends BaseConnector<
	VoiceGenerateParams,
	AssetResult
> {
	readonly type = "voice" as const;
	private readonly tts: HttpTTSGateway;

	constructor(config: ResolvedConnectorConfig) {
		super(config);
		this.tts = new HttpTTSGateway(config.model);
	}

	protected async _generate(params: VoiceGenerateParams): Promise<AssetResult> {
		const voiceId = params.pickedVoiceId ?? (await this.search(params));
		const { url, durationSec } = await this.tts.voicePreview(voiceId);
		return { voiceId, audioUrl: url, durationSec };
	}

	private async search(params: VoiceGenerateParams): Promise<string> {
		const [found] = await this.tts.searchVoices({
			...pick(params, VOICE_TRAITS),
			limit: 1,
		});
		if (!found) throw new Error("No matching voice found");
		return found.id;
	}
}
