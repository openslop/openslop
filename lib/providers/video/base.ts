import { AssetBundle, type BundleResponse } from "@/lib/api/asset-bundle";
import type { VendorParams } from "@/lib/connectors/models";
import type { ValidationResult } from "@/lib/connectors/provider-key";
import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { ProviderContract } from "../base";

export type VideoJobStatus = "queued" | "processing" | "completed" | "failed";

export type VideoRequest = VendorParams<VideoGenerateParams>;

/** What a video runs for when the request names no duration, for asking and for reporting. */
export const DEFAULT_VIDEO_DURATION_SEC = 5;

export type VideoJobMetadata = {
	jobId: string;
	durationSec?: number;
	status?: VideoJobStatus;
};

export type VideoJob = {
	url?: string;
	metadata: VideoJobMetadata;
};

export type FinishedVideo = Required<VideoJob>;

export type VideoProviderResponse = BundleResponse & {
	metadata: VideoJobMetadata;
};

/** A provider that is still working has no asset to hand back yet. */
export type VideoPoll =
	| { kind: "pending" }
	| { kind: "failed" }
	| { kind: "ready"; asset: VideoProviderResponse };

export interface VideoProvider extends ProviderContract {
	/** Resolves to the vendor's id for the job, which `poll` takes. */
	submit(request: VideoRequest): Promise<string>;
	poll(jobId: string, request: VideoRequest): Promise<VideoPoll>;
}

export abstract class BaseVideoProvider implements VideoProvider {
	protected abstract readonly blobConfig: { type: string; provider: string };

	abstract validate(): Promise<ValidationResult>;

	abstract submit(request: VideoRequest): Promise<string>;

	protected abstract _poll(jobId: string): Promise<VideoJob>;

	protected async store({
		url,
		metadata,
	}: FinishedVideo): Promise<VideoProviderResponse> {
		const bundle = await AssetBundle.upload(
			this.blobConfig.type,
			this.blobConfig.provider,
			[
				{
					key: "video",
					filename: "output.mp4",
					contentType: "video/mp4",
					url,
				},
			],
			metadata,
		);
		return { ...bundle, metadata };
	}

	async poll(jobId: string, request: VideoRequest): Promise<VideoPoll> {
		const job = await this._poll(jobId);
		if (job.metadata.status === "failed") return { kind: "failed" };
		if (job.metadata.status !== "completed") return { kind: "pending" };
		if (!job.url) throw new Error("Video job completed without a video");
		const metadata = {
			...job.metadata,
			durationSec:
				job.metadata.durationSec ??
				request.duration ??
				DEFAULT_VIDEO_DURATION_SEC,
		};
		return {
			kind: "ready",
			asset: await this.store({ url: job.url, metadata }),
		};
	}
}
