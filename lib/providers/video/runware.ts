import type { VideoGenerateParams } from "@/lib/connectors/types";
import type { VideoJob, VideoJobStatus } from "./base";
import { BaseVideoProvider } from "./base";
import { withRunware } from "../runware";

type RunwareVideoResult = {
	taskUUID: string;
	status: string;
	videoURL?: string;
	errorMessage?: string;
};

// Runware reports terminal states as "success"/"error"; anything else is a
// state the task can still move out of, so it maps to "processing".
const TERMINAL_STATUS: Record<string, VideoJobStatus> = {
	success: "completed",
	error: "failed",
};

function toVideoJob(video: RunwareVideoResult): VideoJob {
	const status = TERMINAL_STATUS[video.status] ?? "processing";
	return {
		url: video.videoURL,
		metadata: {
			jobId: video.taskUUID,
			status,
			...(status === "failed" && {
				error:
					video.errorMessage ?? `Runware video task failed: ${video.taskUUID}`,
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
			const results = await runware.getResponse<RunwareVideoResult>({
				taskUUID: jobId,
			});

			const video = results?.[0];
			if (!video) throw new Error("Job not found");
			return toVideoJob(video);
		});
	}
}
