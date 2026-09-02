import type { BundleResponse } from "@/lib/api/asset-bundle";
import { modelEntry } from "@/lib/connectors/models";
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
import { providerForPick, type ProviderType } from "./route-families";

type JobRequest = { user_id: string; request: ModelRef };

export const providerForJob = <K extends ProviderType>(
	type: K,
	job: JobRequest,
) => providerForPick(job.user_id, type, job.request);

export type VendorParams<TReq extends ModelRef> = Omit<
	TReq,
	"provider" | "model"
> & { model: string };

export const vendorParams = <TReq extends ModelRef>(job: {
	connector_type: ConnectorType;
	request: TReq;
}): VendorParams<TReq> => {
	const { provider, model, ...rest } = job.request;
	return {
		...rest,
		model: modelEntry(job.connector_type, { provider, model }).id,
	};
};

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
			result: await (await providerFor(job)).generate(vendorParams(job)),
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
