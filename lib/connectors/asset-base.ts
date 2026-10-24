import { AssetBundle } from "@/lib/api/asset-bundle";
import type { ResultKind } from "@/lib/canvas/types";
import { type AssetGateway, isTerminal } from "@/lib/gateway/base";
import { awaitCompletion } from "@/lib/providers/poll";
import { assetUrlField } from "./asset-url";
import { BaseConnector } from "./base";
import type { ResolvedConnectorConfig } from "./types";

/** A generation queued as a job on our API, polled until it settles, and read from the bundle it stored. */
export abstract class BaseJobConnector<
	TParams extends { prompt: string },
	TResult,
	TGateway extends AssetGateway<TParams> = AssetGateway<TParams>,
> extends BaseConnector<TParams, TResult> {
	constructor(
		protected gateway: TGateway,
		config: ResolvedConnectorConfig,
	) {
		super(config);
	}

	abstract resolveBundle(bundle: AssetBundle): Promise<TResult>;

	protected async _generate(
		params: TParams,
		signal?: AbortSignal,
	): Promise<TResult> {
		const { jobId } = await this.gateway.generate(params);
		const completed = await awaitCompletion(
			() => this.gateway.poll(jobId, signal),
			(job) => isTerminal(job.status),
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

/** A job whose bundle holds one media file. */
export abstract class BaseAssetConnector<
	TParams extends { prompt: string },
	TResult,
	TGateway extends AssetGateway<TParams> = AssetGateway<TParams>,
> extends BaseJobConnector<TParams, TResult, TGateway> {
	abstract readonly assetKey: ResultKind;

	async resolveBundle(bundle: AssetBundle): Promise<TResult> {
		return {
			[assetUrlField(this.assetKey)]: bundle.resolve(this.assetKey),
			durationSec: bundle.durationSec,
		} as TResult;
	}
}
