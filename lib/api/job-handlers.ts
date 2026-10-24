import type { BundleResponse } from "./asset-bundle";
import type { VendorParams } from "@/lib/connectors/models";
import type { Priced } from "@/lib/providers/base";
import type {
	ImageGenerateParams,
	ModelRef,
	MusicGenerateParams,
	SFXGenerateParams,
	SourcedSTTParams,
	VoicedTTSParams,
} from "@/lib/connectors/types";
import {
	jobVendorParams,
	providerForJob,
	type JobHandler,
	type JobRequest,
} from "./handlers/base";
import { videoHandler } from "./handlers/video";
import type { JobConnectorType } from "./jobs";

function assetHandler<TReq extends ModelRef>(
	providerFor: (job: JobRequest) => Promise<{
		generate(p: VendorParams<TReq>): Promise<Priced<BundleResponse>>;
	}>,
): JobHandler<TReq> {
	return {
		process: async (job) => {
			const provider = await providerFor(job);
			const { output, costUsd } = await provider.generate(jobVendorParams(job));
			return { kind: "completed", result: output, costUsd };
		},
	};
}

const HANDLERS: Record<JobConnectorType, JobHandler> = {
	image: assetHandler<ImageGenerateParams & ModelRef>((job) =>
		providerForJob("image", job),
	),
	music: assetHandler<MusicGenerateParams & ModelRef>((job) =>
		providerForJob("music", job),
	),
	sfx: assetHandler<SFXGenerateParams & ModelRef>((job) =>
		providerForJob("sfx", job),
	),
	stt: assetHandler<SourcedSTTParams & ModelRef>((job) =>
		providerForJob("stt", job),
	),
	tts: assetHandler<VoicedTTSParams & ModelRef>((job) =>
		providerForJob("tts", job),
	),
	video: videoHandler,
};

export const getJobHandler = (type: JobConnectorType): JobHandler =>
	HANDLERS[type];
