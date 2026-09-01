import type { VideoGenerateParams } from "@/lib/connectors/types";
import {
	providerRequest,
	vendorParams,
	type JobHandler,
} from "../job-handlers";
import { videoProviderFor } from "../providers";

type VideoMetadata = { providerJobId?: string };

export const videoHandler: JobHandler<VideoGenerateParams, VideoMetadata> = {
	process: async (job) => {
		const provider = await videoProviderFor(providerRequest(job));
		const providerJobId = job.metadata.providerJobId;
		if (!providerJobId) {
			const submitted = await provider.generate(vendorParams(job));
			if (!submitted.metadata?.jobId) {
				throw new Error(
					"Video provider returned no jobId for async generation",
				);
			}
			return {
				kind: "pending",
				metadata: { providerJobId: submitted.metadata.jobId },
			};
		}

		const upstream = await provider.poll(providerJobId, vendorParams(job));
		if (upstream.kind === "ready") {
			return { kind: "completed", result: upstream.asset };
		}
		if (upstream.metadata?.status === "failed") {
			throw new Error(upstream.metadata.error ?? "Video generation failed");
		}
		return { kind: "pending", metadata: { providerJobId } };
	},
};
