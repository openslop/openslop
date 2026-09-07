import type { BundleFile, BundleResponse } from "@/lib/api/asset-bundle";
import type { VendorParams } from "@/lib/connectors/models";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { ProviderContract } from "../base";
import { BaseProvider } from "../base";

export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoRequest = VendorParams<VideoGenerateParams>;

/** What a video runs for when the request names no duration, for asking and for reporting. */
export const DEFAULT_VIDEO_DURATION_SEC = 5;

export type VideoJobMetadata = {
	jobId: string;
	durationSec?: number;
	status?: VideoJobStatus;
	error?: string;
};

export type VideoJob = {
	url?: string;
	progress?: number;
	metadata: VideoJobMetadata;
};

export type VideoProviderResponse = BundleResponse & {
	metadata?: VideoJobMetadata;
};

/** A provider that is still working has no asset to hand back yet. */
export type VideoPoll =
	| { kind: "pending"; metadata: VideoJobMetadata }
	| { kind: "ready"; asset: VideoProviderResponse };

export interface VideoProvider extends ProviderContract {
	generate(params: VideoRequest): Promise<VideoProviderResponse>;
	poll(jobId: string, request: VideoRequest): Promise<VideoPoll>;
}

export abstract class BaseVideoProvider
	extends BaseProvider<VideoRequest, VideoJob, VideoProviderResponse>
	implements VideoProvider
{
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

	async poll(jobId: string, request: VideoRequest): Promise<VideoPoll> {
		const result = await this._poll(jobId);
		if (this.toFiles(result).length === 0) {
			return { kind: "pending", metadata: result.metadata };
		}
		const metadata = {
			...result.metadata,
			durationSec:
				result.metadata.durationSec ??
				request.duration ??
				DEFAULT_VIDEO_DURATION_SEC,
		};
		return { kind: "ready", asset: await this.store({ ...result, metadata }) };
	}
}
