import { AssetBundle } from "@/lib/api/asset-bundle";
import type { BundleResponse } from "@/lib/api/asset-bundle";
import { BaseConnector } from "./base";

export abstract class BaseAssetConnector<
  TParams extends { prompt: string },
  TResult,
> extends BaseConnector<TParams, TResult> {
  abstract readonly assetKey: string;

  protected abstract provider: {
    generate(params: TParams): Promise<BundleResponse>;
  };

  async resolveBundle(bundle: AssetBundle): Promise<TResult> {
    return { url: bundle.resolve(this.assetKey) } as TResult;
  }

  protected async _generate(params: TParams): Promise<TResult> {
    const response = await this.provider.generate(params);
    const bundle = AssetBundle.fromResponse(this.type, response);
    return this.resolveBundle(bundle);
  }
}
