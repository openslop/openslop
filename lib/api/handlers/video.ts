import type { ModelRef, VideoGenerateParams } from "@/lib/connectors/types";
import {
	jobVendorParams,
	providerForJob,
	type JobHandler,
} from "../job-handlers";

type VideoMetadata = { providerJobId?: string };

export const videoHandler: JobHandler<
	VideoGenerateParams & ModelRef,
	VideoMetadata
> = {
	process: async (job) => {
		const provider = await providerForJob("video", job);
		const providerJobId = job.metadata.providerJobId;
		if (!providerJobId) {
			const submitted = await provider.generate(jobVendorParams(job));
			return {
				kind: "pending",
				metadata: { providerJobId: submitted.metadata.jobId },
			};
		}

		const upstream = await provider.poll(providerJobId, jobVendorParams(job));
		switch (upstream.kind) {
			case "ready":
				return { kind: "completed", result: upstream.asset };
			case "failed":
				throw new Error("Video generation failed");
			case "pending":
				return { kind: "pending", metadata: { providerJobId } };
		}
	},
};
