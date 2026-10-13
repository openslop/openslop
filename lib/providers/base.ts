import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { ValidationResult } from "@/lib/connectors/provider-key";

export type WithMetadata<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
	metadata?: T;
};

/** What a generation produced, and what the vendor charged for it in USD. */
export type Priced<T> = { output: T; costUsd: number };

/**
 * Every provider can be asked whether the key it was built with works. The
 * check is the vendor's own to define: only it knows which call is cheapest and
 * how it reports a refusal.
 */
export interface ProviderContract {
	validate(): Promise<ValidationResult>;
}

/** What a vendor call hands back before it is stored. */
export type RawResult = WithMetadata & { costUsd: number };

/** A provider that turns a request into a stored asset bundle. */
export interface AssetProvider<TParams> extends ProviderContract {
	generate(params: TParams): Promise<Priced<BundleResponse>>;
}

export abstract class BaseProvider<
	TParams = unknown,
	TRawResult extends RawResult = RawResult,
> implements ProviderContract {
	protected abstract readonly blobConfig: { type: string; provider: string };

	abstract validate(): Promise<ValidationResult>;

	protected abstract toFiles(result: TRawResult): BundleFile[];

	protected abstract _generate(params: TParams): Promise<TRawResult>;

	protected async store(result: TRawResult): Promise<BundleResponse> {
		const files = this.toFiles(result);
		return AssetBundle.upload(
			this.blobConfig.type,
			this.blobConfig.provider,
			files,
			result.metadata,
		);
	}

	async generate(params: TParams): Promise<Priced<BundleResponse>> {
		const raw = await this._generate(params);
		return { output: await this.store(raw), costUsd: raw.costUsd };
	}
}
