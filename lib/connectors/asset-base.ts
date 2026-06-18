import { AssetBundle } from "@/lib/api/asset-bundle";
import type { AssetGateway } from "@/lib/gateway/base";
import { awaitCompletion } from "@/lib/providers/poll";
import { BaseConnector } from "./base";
import type { ConnectorConfig } from "./types";

export type AssetKey = "image" | "audio" | "video";

const ASSET_KEY_TO_URL_FIELD: Record<
	AssetKey,
	"imageUrl" | "audioUrl" | "videoUrl"
> = {
	image: "imageUrl",
	audio: "audioUrl",
	video: "videoUrl",
};

export abstract class BaseAssetConnector<
	TParams extends { prompt: string },
	TResult,
	TGateway extends AssetGateway<TParams> = AssetGateway<TParams>,
> extends BaseConnector<TParams, TResult> {
	abstract readonly assetKey: AssetKey;

	constructor(
		protected gateway: TGateway,
		config: ConnectorConfig,
	) {
		super(config);
	}

	async resolveBundle(bundle: AssetBundle): Promise<TResult> {
		return {
			[ASSET_KEY_TO_URL_FIELD[this.assetKey]]: bundle.resolve(this.assetKey),
			durationSec: Number(bundle.manifest.metadata?.durationSec ?? 0),
		} as TResult;
	}

	protected async _generate(params: TParams): Promise<TResult> {
		const { jobId } = await this.gateway.generate(params);
		const completed = await awaitCompletion(
			(id) => this.gateway.poll(id),
			jobId,
			(p) => p.status === "completed" || p.status === "failed",
		);
		if (completed.status === "failed") {
			throw new Error(completed.error ?? "Generation failed");
		}
		if (!completed.result) {
			throw new Error("Generation completed without a result");
		}
		return this.resolveBundle(
			AssetBundle.fromResponse(this.type, completed.result),
		);
	}
}
