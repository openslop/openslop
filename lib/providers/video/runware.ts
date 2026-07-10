import type { VideoGenerateParams } from "@/lib/connectors/types";
import { stringifyError } from "@/lib/errors";
import type { VideoJob, VideoJobStatus } from "./base";
import { BaseVideoProvider } from "./base";
import { withRunware } from "../runware";

/** Runware's SDK rejects task-level failures with a structured {error}/{errors} payload (see IError in @runware/sdk-js); connection-level failures (WebSocket disconnects, timeouts) reject with a plain Error instead. */
function isApiError(err: unknown): boolean {
	return (
		typeof err === "object" &&
		err !== null &&
		("error" in err || "errors" in err)
	);
}

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
			...(video.error != null && {
				error:
					typeof video.error === "string"
						? video.error
						: stringifyError(video.error),
				errorDetail: video.error,
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
				// A rejected status query can mean two different things: the task
				// itself failed (Runware rejects with a structured {error} / {errors}
				// payload — same shape as IError elsewhere in the SDK), or the query
				// itself couldn't complete (WebSocket disconnect, connection timeout,
				// ...). Only the former is a permanent job failure; the latter must
				// propagate so the poll loop retries instead of giving up.
				if (!isApiError(err)) throw err;
				return {
					metadata: {
						jobId,
						status: "failed",
						error: stringifyError(err),
						errorDetail: err,
					},
				};
			}

			const video = results?.[0];
			if (!video) throw new Error("Job not found");
			return toVideoJob(video);
		});
	}
}
