import type { BundleResponse } from "./asset-bundle";
import type { VendorParams } from "@/lib/connectors/models";
import type {
	ImageGenerateParams,
	ModelRef,
	MusicGenerateParams,
	SFXGenerateParams,
	TTSGenerateParams,
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
	providerFor: (
		job: JobRequest,
	) => Promise<{ generate(p: VendorParams<TReq>): Promise<BundleResponse> }>,
): JobHandler<TReq> {
	return {
		process: async (job) => ({
			kind: "completed",
			result: await (await providerFor(job)).generate(jobVendorParams(job)),
		}),
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
	tts: assetHandler<TTSGenerateParams & ModelRef>((job) =>
		providerForJob("tts", job),
	),
	video: videoHandler,
};

export const getJobHandler = (type: JobConnectorType): JobHandler =>
	HANDLERS[type];
