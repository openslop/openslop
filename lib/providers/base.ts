import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import { AssetBundle } from "@/lib/api/asset-bundle";

export type WithMetadata<
  T extends Record<string, unknown> = Record<string, unknown>,
> = {
  metadata?: T;
};

export abstract class BaseProvider<
  TParams = unknown,
  TRawResult extends WithMetadata = WithMetadata,
  TOutput = BundleResponse,
> {
  protected abstract readonly blobConfig: { type: string; provider: string };

  protected abstract toFiles(result: TRawResult): BundleFile[];

  protected abstract _generate(params: TParams): Promise<TRawResult>;

  protected async store(result: TRawResult): Promise<TOutput> {
    const files = this.toFiles(result);
    return AssetBundle.upload(
      this.blobConfig.type,
      this.blobConfig.provider,
      files,
      result.metadata,
    ) as TOutput;
  }

  async generate(params: TParams): Promise<TOutput> {
    const result = await this._generate(params);
    return this.store(result);
  }
}
