import { AssetBundle } from "@/lib/api/asset-bundle";
import type { ResultKind } from "@/lib/canvas/types";
import { type AssetGateway, isTerminal } from "@/lib/gateway/base";
import { awaitCompletion } from "@/lib/providers/poll";
import { assetUrlField } from "./assetUrl";
import { BaseConnector } from "./base";
import type { ResolvedConnectorConfig } from "./types";

export abstract class BaseAssetConnector<
	TParams extends { prompt: string },
	TResult,
	TGateway extends AssetGateway<TParams> = AssetGateway<TParams>,
> extends BaseConnector<TParams, TResult> {
	abstract readonly assetKey: ResultKind;

	constructor(
		protected gateway: TGateway,
		config: ResolvedConnectorConfig,
	) {
		super(config);
	}

	async resolveBundle(bundle: AssetBundle): Promise<TResult> {
		return {
			[assetUrlField(this.assetKey)]: bundle.resolve(this.assetKey),
			durationSec: Number(bundle.manifest.metadata?.durationSec ?? 0),
		} as TResult;
	}

	protected async _generate(params: TParams): Promise<TResult> {
		const { jobId } = await this.gateway.generate(params);
		const completed = await awaitCompletion(
			(id) => this.gateway.poll(id),
			jobId,
			(p) => isTerminal(p.status),
		);
		if (completed.status === "failed") {
			throw new Error(completed.error ?? "Generation failed");
		}
		if (!completed.result) {
			throw new Error("Generation completed without a result");
		}
		return this.resolveBundle(AssetBundle.fromResponse(completed.result));
	}
}
