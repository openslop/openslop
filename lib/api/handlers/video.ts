import type { VideoGenerateParams } from "@/lib/connectors/types";
import { isTerminal, type JobPoll, type JobStatus } from "@/lib/gateway/base";
import type { VideoProviderResponse } from "@/lib/providers/video/base";
import type { JobHandler } from "../job-handlers";
import { rowView } from "../job-handlers";
import { updateJob } from "../jobs";
import { getVideoProvider } from "../providers";

type VideoMetadata = { providerJobId?: string; durationSec?: number };

export const videoHandler: JobHandler<VideoGenerateParams, VideoMetadata> = {
	process: async (job) => {
		const { metadata } = await getVideoProvider().generate(job.request);
		if (!metadata?.jobId) {
			throw new Error("Video provider returned no jobId for async generation");
		}
		if (metadata.durationSec === undefined) {
			throw new Error(
				"Video provider returned no durationSec for async generation",
			);
		}
		return {
			kind: "pending",
			metadata: {
				providerJobId: metadata.jobId,
				durationSec: metadata.durationSec,
			},
		};
	},
	poll: async (job): Promise<JobPoll> => {
		if (isTerminal(job.status)) return rowView(job);

		const providerJobId = job.metadata.providerJobId;
		if (!providerJobId) return rowView(job);

		const upstream = await getVideoProvider().poll(providerJobId);
		const status = mapVideoStatus(upstream);
		if (status === "completed") {
			const result = withDuration(upstream, providerJobId, job.metadata);
			await updateJob(job.id, { status, result });
			return { jobId: job.id, status, result, error: null };
		}
		if (status === "failed") {
			const error = upstream.metadata?.error ?? "Video generation failed";
			await updateJob(job.id, { status, error });
			return { jobId: job.id, status, result: null, error };
		}
		return { jobId: job.id, status, result: null, error: null };
	},
};

/**
 * An async poll only tells us the video's URL, so the clip length is the one
 * recorded when the job was submitted. Without it the bundle reaches the
 * timeline with `durationSec` 0 and the clip is laid out with no duration.
 */
function withDuration(
	upstream: VideoProviderResponse,
	providerJobId: string,
	stored: VideoMetadata,
): VideoProviderResponse {
	return {
		...upstream,
		metadata: {
			jobId: providerJobId,
			...upstream.metadata,
			durationSec: upstream.metadata?.durationSec ?? stored.durationSec,
		},
	};
}

function mapVideoStatus(upstream: VideoProviderResponse): JobStatus {
	if (upstream.result?.video) return "completed";
	if (upstream.metadata?.status === "failed") return "failed";
	return "processing";
}
