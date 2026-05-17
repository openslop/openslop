import { AssetBundle } from "@/lib/api/asset-bundle";
import type { AssetGateway } from "@/lib/gateway/base";
import { awaitCompletion } from "@/lib/providers/poll";
import { BaseConnector } from "./base";

export abstract class BaseAssetConnector<
	TParams extends { prompt: string },
	TResult,
> extends BaseConnector<TParams, TResult> {
	abstract readonly assetKey: string;

	protected abstract gateway: AssetGateway<TParams>;

	async resolveBundle(bundle: AssetBundle): Promise<TResult> {
		return {
			url: bundle.resolve(this.assetKey),
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
