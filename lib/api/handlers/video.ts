import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { JobHandler } from "../job-handlers";
import { getVideoProvider } from "../providers";

/**
 * `durationSec` is carried across deliveries because only the submission knows
 * how long the video is: an upstream poll is keyed by job id alone, so a result
 * assembled from the poll would land with no duration and lay out as a
 * one-second clip.
 */
type VideoMetadata = { providerJobId?: string; durationSec?: number };

export const videoHandler: JobHandler<VideoGenerateParams, VideoMetadata> = {
	process: async (job) => {
		const provider = getVideoProvider();
		const { providerJobId, durationSec } = job.metadata;
		if (!providerJobId) {
			const submission = (await provider.generate(job.request)).metadata;
			if (!submission?.jobId || submission.durationSec === undefined) {
				throw new Error(
					`Video provider returned an unusable submission: jobId=${submission?.jobId}, durationSec=${submission?.durationSec}`,
				);
			}
			return {
				kind: "pending",
				metadata: {
					providerJobId: submission.jobId,
					durationSec: submission.durationSec,
				},
			};
		}

		const upstream = await provider.poll(providerJobId);
		if (upstream.kind === "ready") {
			return {
				kind: "completed",
				result: {
					...upstream.asset,
					metadata: { ...upstream.asset.metadata, durationSec },
				},
			};
		}
		if (upstream.metadata?.status === "failed") {
			throw new Error(upstream.metadata.error ?? "Video generation failed");
		}
		return { kind: "pending", metadata: { providerJobId, durationSec } };
	},
};
