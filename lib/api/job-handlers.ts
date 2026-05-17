import type { BundleResponse } from "@/lib/api/asset-bundle";
import type {
	ConnectorType,
	VideoGenerateParams,
} from "@/lib/connectors/types";
import type { JobPoll, JobStatus } from "@/lib/gateway/base";
import type { VideoProviderResponse } from "@/lib/providers/video/base";
import type { JobRow } from "./jobs";
import { updateJob } from "./jobs";
import {
	getImageProvider,
	getMusicProvider,
	getSFXProvider,
	getTTSProvider,
	getVideoProvider,
} from "./providers";

export type ProcessOutcome =
	| { kind: "completed"; result: BundleResponse }
	| { kind: "pending"; metadata: Record<string, unknown> };

export interface JobHandler {
	// Queue consumer. Sync providers return `completed`; async providers
	// (video) submit and return `pending`, leaving the row in `processing`
	// until `poll()` resolves it.
	process(job: JobRow): Promise<ProcessOutcome>;
	// GET /api/v1/{type}/[jobId]. Default reads the DB row.
	// Override when terminal state lives upstream (video → provider.poll).
	poll?(job: JobRow): Promise<JobPoll>;
}

type SyncProvider = {
	generate(params: Record<string, unknown>): Promise<BundleResponse>;
};

function assetHandler(provider: () => SyncProvider): JobHandler {
	return {
		process: async (job) => ({
			kind: "completed",
			result: await provider().generate(job.request),
		}),
	};
}

const videoHandler: JobHandler = {
	process: async (job) => {
		const params = job.request as unknown as VideoGenerateParams;
		const submitted = await getVideoProvider().generate(params);
		const providerJobId = submitted.metadata?.jobId;
		if (!providerJobId) {
			throw new Error("Video provider returned no jobId for async generation");
		}
		return { kind: "pending", metadata: { providerJobId } };
	},
	poll: async (job): Promise<JobPoll> => {
		const providerJobId = (job.metadata as { providerJobId?: string })
			?.providerJobId;
		if (!providerJobId) return rowView(job);

		const upstream = await getVideoProvider().poll(providerJobId);
		const status = mapVideoStatus(upstream);
		if (status === "completed") {
			await updateJob(job.id, { status, result: upstream });
			return { jobId: job.id, status, result: upstream, error: null };
		}
		if (status === "failed") {
			const error = upstream.metadata?.error ?? "Video generation failed";
			await updateJob(job.id, { status, error });
			return { jobId: job.id, status, result: null, error };
		}
		return { jobId: job.id, status, result: null, error: null };
	},
};

function mapVideoStatus(upstream: VideoProviderResponse): JobStatus {
	if (upstream.result?.video) return "completed";
	if (upstream.metadata?.status === "failed") return "failed";
	return "processing";
}

function rowView(job: JobRow): JobPoll {
	return {
		jobId: job.id,
		status: job.status,
		result: job.result,
		error: job.error,
	};
}

const HANDLERS: Partial<Record<ConnectorType, JobHandler>> = {
	image: assetHandler(getImageProvider),
	music: assetHandler(getMusicProvider),
	sfx: assetHandler(getSFXProvider),
	tts: assetHandler(getTTSProvider),
	video: videoHandler,
};

export function getJobHandler(type: ConnectorType): JobHandler | undefined {
	return HANDLERS[type];
}
