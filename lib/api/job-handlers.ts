import type { BundleResponse } from "@/lib/api/asset-bundle";
import { providerForModel, vendorModelFor } from "@/lib/connectors/models";
import type {
	ConnectorType,
	ImageGenerateParams,
	MusicGenerateParams,
	SFXGenerateParams,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import { videoHandler } from "./handlers/video";
import type { JobRow } from "./jobs";
import {
	imageProviderFor,
	musicProviderFor,
	sfxProviderFor,
	ttsProviderFor,
	type ProviderRequest,
} from "./providers";

/** The model a job named decides who runs it, and so whose key is read. */
export const providerRequest = (job: {
	user_id: string;
	connector_type: ConnectorType;
	request: { model?: string };
}): ProviderRequest => ({
	userId: job.user_id,
	provider: providerForModel(job.connector_type, job.request.model),
});

/** The same params, with the id that provider's own API takes for the model. */
export const vendorParams = <TReq extends { model?: string }>(job: {
	connector_type: ConnectorType;
	request: TReq;
}): TReq => ({
	...job.request,
	model: vendorModelFor(job.connector_type, job.request.model),
});

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

function assetHandler<TReq extends { model?: string }>(
	providerFor: (
		request: ProviderRequest,
	) => Promise<{ generate(p: TReq): Promise<BundleResponse> }>,
): JobHandler<TReq> {
	return {
		process: async (job) => ({
			kind: "completed",
			result: await (
				await providerFor(providerRequest(job))
			).generate(vendorParams(job)),
		}),
	};
}

const HANDLERS: Partial<Record<ConnectorType, JobHandler>> = {
	image: assetHandler<ImageGenerateParams>(imageProviderFor),
	music: assetHandler<MusicGenerateParams>(musicProviderFor),
	sfx: assetHandler<SFXGenerateParams>(sfxProviderFor),
	tts: assetHandler<TTSGenerateParams>(ttsProviderFor),
	video: videoHandler,
};

export function getJobHandler(type: ConnectorType): JobHandler | undefined {
	return HANDLERS[type];
}
