import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import type { WithMetadata } from "../base";
import { BaseProvider } from "../base";

export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoJobMetadata = {
	jobId: string;
	durationSec?: number;
	status?: VideoJobStatus;
	error?: string;
};

export type VideoJob = {
	url?: string;
	progress?: number;
} & WithMetadata<VideoJobMetadata>;

export type VideoProviderResponse = BundleResponse & {
	metadata?: VideoJobMetadata;
};

export abstract class BaseVideoProvider extends BaseProvider<
	VideoGenerateParams,
	VideoJob,
	VideoProviderResponse
> {
	protected toFiles(r: VideoJob): BundleFile[] {
		return r.url ? [{ key: "video", url: r.url }] : [];
	}

	/** A job with no video yet (submitted or still running) has nothing to upload. */
	protected async store(result: VideoJob): Promise<VideoProviderResponse> {
		if (this.toFiles(result).length === 0) {
			return {
				id: "",
				provider: this.blobConfig.provider,
				result: {},
				metadata: result.metadata,
			};
		}
		return super.store(result);
	}

	protected abstract _poll(jobId: string): Promise<VideoJob>;

	/**
	 * `durationSec` carries the duration requested at submit time: providers do not
	 * echo it back on poll, and the rendered timeline sizes the clip from it.
	 */
	async poll(
		jobId: string,
		durationSec?: number,
	): Promise<VideoProviderResponse> {
		const result = await this._poll(jobId);
		return this.store({
			...result,
			metadata: {
				jobId,
				...result.metadata,
				durationSec: result.metadata?.durationSec ?? durationSec,
			},
		});
	}
}
