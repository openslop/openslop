import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import { AssetBundle } from "@/lib/api/asset-bundle";
import type { ValidationResult } from "@/lib/connectors/providerKey";

export type WithMetadata<
	T extends Record<string, unknown> = Record<string, unknown>,
> = {
	metadata?: T;
};

/**
 * Every provider can be asked whether the key it was built with works. The
 * check is the vendor's own to define: only it knows which call is cheapest and
 * how it reports a refusal.
 */
export interface ProviderContract {
	validate(): Promise<ValidationResult>;
}

/** A provider that turns a request into a stored asset bundle. */
export interface AssetProvider<TParams> extends ProviderContract {
	generate(params: TParams): Promise<BundleResponse>;
}

export abstract class BaseProvider<
	TParams = unknown,
	TRawResult extends WithMetadata = WithMetadata,
	TOutput = BundleResponse,
> implements ProviderContract {
	protected abstract readonly blobConfig: { type: string; provider: string };

	abstract validate(): Promise<ValidationResult>;

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
