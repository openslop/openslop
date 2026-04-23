import { AssetBundle } from "@/lib/api/asset-bundle";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import type { GatewayClient } from "@/lib/gateway/base";
import { BaseConnector } from "./base";

export abstract class BaseAssetConnector<
	TParams extends { prompt: string },
	TResult,
> extends BaseConnector<TParams, TResult> {
	abstract readonly assetKey: string;

	protected abstract gateway: GatewayClient<TParams, BundleResponse>;

	async resolveBundle(bundle: AssetBundle): Promise<TResult> {
		return {
			url: bundle.resolve(this.assetKey),
			durationSec: Number(bundle.manifest.metadata?.durationSec ?? 0),
		} as TResult;
	}

	protected async _generate(params: TParams): Promise<TResult> {
		const response = await this.gateway.generate(params);
		const bundle = AssetBundle.fromResponse(this.type, response);
		return this.resolveBundle(bundle);
	}
}
