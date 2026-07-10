import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { JobPoll, JobStatus } from "@/lib/gateway/base";
import type { VideoProviderResponse } from "@/lib/providers/video/base";
import type { JobHandler } from "../job-handlers";
import { rowView } from "../job-handlers";
import { updateJob } from "../jobs";
import { getVideoProvider } from "../providers";

type VideoMetadata = { providerJobId?: string };

export const videoHandler: JobHandler<VideoGenerateParams, VideoMetadata> = {
	process: async (job) => {
		const submitted = await getVideoProvider().generate(job.request);
		const providerJobId = submitted.metadata?.jobId;
		if (!providerJobId) {
			throw new Error("Video provider returned no jobId for async generation");
		}
		return { kind: "pending", metadata: { providerJobId } };
	},
	poll: async (job): Promise<JobPoll> => {
		const providerJobId = job.metadata.providerJobId;
		if (!providerJobId) return rowView(job);

		const upstream = await getVideoProvider().poll(providerJobId);
		const status = mapVideoStatus(upstream);
		if (status === "completed") {
			await updateJob(job.id, { status, result: upstream });
			return { jobId: job.id, status, result: upstream, error: null };
		}
		if (status === "failed") {
			const error = upstream.metadata?.error ?? "Video generation failed";
			const errorDetail = upstream.metadata?.errorDetail;
			await updateJob(job.id, {
				status,
				error,
				// Merge (not replace) so providerJobId survives; persist errorDetail
				// so a later rowView re-fetch of this failed job still carries it.
				// `!= null` so an explicit null (possible across the JSON boundary)
				// isn't persisted as a useless errorDetail: null.
				...(errorDetail != null && {
					metadata: { ...job.metadata, errorDetail },
				}),
			});
			return { jobId: job.id, status, result: null, error, errorDetail };
		}
		return { jobId: job.id, status, result: null, error: null };
	},
};

function mapVideoStatus(upstream: VideoProviderResponse): JobStatus {
	if (upstream.result?.video) return "completed";
	if (upstream.metadata?.status === "failed") return "failed";
	return "processing";
}
