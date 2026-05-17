import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
	ConnectorType,
	ImageGenerateParams,
	MusicGenerateParams,
	SFXGenerateParams,
	TTSGenerateParams,
} from "@/lib/connectors/types";
import type { JobPoll } from "@/lib/gateway/base";
import { videoHandler } from "./handlers/video";
import type { JobRow } from "./jobs";
import {
	getImageProvider,
	getMusicProvider,
	getSFXProvider,
	getTTSProvider,
} from "./providers";

export type ProcessOutcome =
	| { kind: "completed"; result: BundleResponse }
	| { kind: "pending"; metadata: Record<string, unknown> };

// A JobRow narrowed to a handler's declared request and metadata shapes.
export type TypedJobRow<TReq, TMeta> = Omit<JobRow, "request" | "metadata"> & {
	request: TReq;
	metadata: TMeta;
};

export interface JobHandler<
	TReq = Record<string, unknown>,
	TMeta = Record<string, unknown>,
> {
	// Queue consumer. Sync providers return `completed`; async providers
	// (video) submit and return `pending`, leaving the row in `processing`
	// until `poll()` resolves it.
	process(job: TypedJobRow<TReq, TMeta>): Promise<ProcessOutcome>;
	// GET /api/v1/{type}/[jobId]. Default reads the DB row.
	// Override when terminal state lives upstream (video → provider.poll).
	poll?(job: TypedJobRow<TReq, TMeta>): Promise<JobPoll>;
}

export function rowView(job: JobRow): JobPoll {
	return {
		jobId: job.id,
		status: job.status,
		result: job.result,
		error: job.error,
	};
}

// Erases a handler's per-type request/metadata shapes so the registry can hold
// all handlers under one union. The only place in this layer that casts.
function erase<TReq, TMeta>(h: JobHandler<TReq, TMeta>): JobHandler {
	return {
		process: (job) => h.process(job as TypedJobRow<TReq, TMeta>),
		poll:
			h.poll &&
			((job) =>
				(h.poll as NonNullable<typeof h.poll>)(
					job as TypedJobRow<TReq, TMeta>,
				)),
	};
}

function assetHandler<TReq extends Record<string, unknown>>(
	provider: () => { generate(p: TReq): Promise<BundleResponse> },
): JobHandler<TReq> {
	return {
		process: async (job) => ({
			kind: "completed",
			result: await provider().generate(job.request),
		}),
	};
}

const HANDLERS: Partial<Record<ConnectorType, JobHandler>> = {
	image: erase(assetHandler<ImageGenerateParams>(getImageProvider)),
	music: erase(assetHandler<MusicGenerateParams>(getMusicProvider)),
	sfx: erase(assetHandler<SFXGenerateParams>(getSFXProvider)),
	tts: erase(assetHandler<TTSGenerateParams>(getTTSProvider)),
	video: erase(videoHandler),
};

export function getJobHandler(type: ConnectorType): JobHandler | undefined {
	return HANDLERS[type];
}
