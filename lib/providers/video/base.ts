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
		return r.url
			? [
					{
						key: "video",
						filename: "output.mp4",
						contentType: "video/mp4",
						url: r.url,
					},
				]
			: [];
	}

	protected abstract _poll(jobId: string): Promise<VideoJob>;

	async poll(jobId: string): Promise<VideoProviderResponse> {
		const result = await this._poll(jobId);
		if (this.toFiles(result).length === 0) {
			return {
				id: "",
				type: this.blobConfig.type,
				provider: this.blobConfig.provider,
				result: {},
				metadata: result.metadata,
			};
		}
		return this.store(result);
	}
}
