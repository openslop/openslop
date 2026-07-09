import type { VideoGenerateParams } from "@/lib/connectors/types";
import { stringifyError } from "@/lib/errors";
import type { VideoJob, VideoJobStatus } from "./base";
import { BaseVideoProvider } from "./base";
import { withRunware } from "../runware";

function toVideoJob(video: {
	taskUUID: string;
	status: string;
	videoURL?: string;
	error?: unknown;
}): VideoJob {
	return {
		url: video.videoURL,
		metadata: {
			jobId: video.taskUUID,
			status: video.status as VideoJobStatus,
			...(video.error !== undefined && {
				error:
					typeof video.error === "string"
						? video.error
						: stringifyError(video.error),
			}),
		},
	};
}

export class RunwareVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "runware" };
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
	}

	async submit(params: VideoGenerateParams) {
		return withRunware(this.apiKey, async (runware) => {
			const result = await runware.videoInference({
				positivePrompt: params.prompt,
				model: params.model || "bytedance:seedance@2.0-fast",
				width: params.width || 1280,
				height: params.height || 720,
				duration: params.duration || 5,
				outputType: "URL",
				deliveryMethod: "async",
				inputs: {
					frameImages: params.frameImages,
					referenceImages: params.referenceImages,
				},
				settings: {
					audio: false,
				},
			});

			const video = Array.isArray(result) ? result[0] : result;
			if (!video) throw new Error("Runware video inference returned no result");
			return toVideoJob(video);
		});
	}

	protected async _generate(params: VideoGenerateParams): Promise<VideoJob> {
		const job = await this.submit(params);
		return {
			...job,
			metadata: {
				...job.metadata,
				jobId: job.metadata?.jobId ?? "",
				durationSec: params.duration ?? 5,
			},
		};
	}

	protected async _poll(jobId: string): Promise<VideoJob> {
		return withRunware(this.apiKey, async (runware) => {
			let results: Array<{
				taskUUID: string;
				status: string;
				videoURL?: string;
				error?: unknown;
			}>;
			try {
				results = await runware.getResponse({ taskUUID: jobId });
			} catch (err) {
				// A rejected status query (as opposed to a resolved item reporting
				// its own failure below) still carries the provider's error detail —
				// surface it as a failed job instead of letting the raw rejection
				// propagate uncaught out of poll().
				return {
					metadata: { jobId, status: "failed", error: stringifyError(err) },
				};
			}

			const video = results?.[0];
			if (!video) throw new Error("Job not found");
			return toVideoJob(video);
		});
	}
}
