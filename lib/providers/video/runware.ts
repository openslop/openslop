import type { VideoGenerateParams } from "@/lib/connectors/types";
import { RUNWARE_VIDEO_MODELS } from "@/lib/connectors/video/runware/models";
import type { VideoJob, VideoJobStatus } from "./base";
import { BaseVideoProvider, DEFAULT_VIDEO_DURATION_SEC } from "./base";
import { validateRunwareKey, withRunware } from "../runware";
import {
	ASPECT_RATIO_DIMENSIONS,
	DEFAULT_ASPECT_RATIO,
	DEFAULT_VIDEO_RESOLUTION,
} from "@/lib/video/aspectRatio";

function toVideoJob(video: {
	taskUUID: string;
	status: string;
	videoURL?: string;
}): VideoJob {
	return {
		url: video.videoURL,
		metadata: {
			jobId: video.taskUUID,
			status: video.status as VideoJobStatus,
		},
	};
}

const DEFAULT_MODEL = RUNWARE_VIDEO_MODELS["Seedance 2 Fast"].id;

const DEFAULT_SIZE =
	ASPECT_RATIO_DIMENSIONS[DEFAULT_ASPECT_RATIO].video[DEFAULT_VIDEO_RESOLUTION];

/** A frame-conditioned video takes its aspect from the frame, so it is sized by preset. */
const sizeFor = (params: VideoGenerateParams) =>
	params.frameImages && params.resolution
		? { resolution: params.resolution }
		: {
				width: params.width || DEFAULT_SIZE.width,
				height: params.height || DEFAULT_SIZE.height,
			};

export class RunwareVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "runware" };
	private apiKey: string;

	constructor(apiKey: string) {
		super();
		this.apiKey = apiKey;
	}

	async validate() {
		return validateRunwareKey(this.apiKey);
	}

	async submit(params: VideoGenerateParams) {
		return withRunware(this.apiKey, async (runware) => {
			const result = await runware.videoInference({
				positivePrompt: params.prompt,
				model: params.model || DEFAULT_MODEL,
				...sizeFor(params),
				duration: params.duration ?? DEFAULT_VIDEO_DURATION_SEC,
				outputType: "URL",
				deliveryMethod: "async",
				// Without this the SDK polls the task to completion before returning.
				skipResponse: true,
				inputs: {
					frameImages: params.frameImages,
					referenceImages: params.referenceImages,
				},
			});

			const video = Array.isArray(result) ? result[0] : result;
			if (!video?.taskUUID)
				throw new Error("Runware video inference returned no task");
			return toVideoJob(video);
		});
	}

	protected async _generate(params: VideoGenerateParams): Promise<VideoJob> {
		const job = await this.submit(params);
		return {
			...job,
			metadata: {
				...job.metadata,
				durationSec: params.duration ?? DEFAULT_VIDEO_DURATION_SEC,
			},
		};
	}

	protected async _poll(jobId: string): Promise<VideoJob> {
		return withRunware(this.apiKey, async (runware) => {
			const results = await runware.getResponse<{
				taskUUID: string;
				status: string;
				videoURL?: string;
			}>({ taskUUID: jobId });

			const video = results?.[0];
			if (!video) throw new Error("Job not found");
			return toVideoJob(video);
		});
	}
}
