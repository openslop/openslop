import type { BundleResponse } from "@/lib/api/asset-bundle";
import { vendorParams, type VendorParams } from "@/lib/connectors/models";
import type {
	ConnectorType,
	ImageGenerateParams,
	ModelRef,
	MusicGenerateParams,
	SFXGenerateParams,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { videoHandler } from "./handlers/video";
import type { JobRow } from "./jobs";
import type { ProviderType } from "@/lib/providers/types";
import { providerForPick } from "./route-families";

type JobRequest<TReq extends ModelRef = ModelRef> = {
	user_id: string;
	connector_type: ConnectorType;
	request: TReq;
};

export const providerForJob = <K extends ProviderType>(
	type: K,
	job: JobRequest,
) => providerForPick(job.user_id, type, job.request);

export const jobVendorParams = <TReq extends ModelRef>(job: JobRequest<TReq>) =>
	vendorParams(job.connector_type, job.request);

export type ProcessOutcome<TMeta = Record<string, unknown>> =
	| { kind: "completed"; result: BundleResponse }
	| { kind: "pending"; metadata: TMeta };

export type TypedJobRow<TReq, TMeta> = Omit<JobRow, "request" | "metadata"> & {
	request: TReq;
	metadata: TMeta;
};

export interface JobHandler<
	TReq = Record<string, unknown>,
	TMeta = Record<string, unknown>,
> {
	process(job: TypedJobRow<TReq, TMeta>): Promise<ProcessOutcome<TMeta>>;
}

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

const HANDLERS: Partial<Record<ConnectorType, JobHandler>> = {
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

export function getJobHandler(type: ConnectorType): JobHandler | undefined {
	return HANDLERS[type];
}
