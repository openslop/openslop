import type { VideoJob, VideoJobStatus, VideoRequest } from "./base";
import { BaseVideoProvider, DEFAULT_VIDEO_DURATION_SEC } from "./base";
import { validateRunwareKey, withRunware } from "../runware";
import type { Conditioner } from "./conditioning";
import { klingOmni, klingTurbo } from "./kling";
import { seedance } from "./seedance";
import { RUNWARE_VIDEO_MODELS } from "@/lib/connectors/video/runware/models";
import { renderSize } from "@/lib/connectors/models";
import { DEFAULT_ASPECT_RATIO } from "@/lib/project/aspect-ratio";

const FINISHED: Record<string, VideoJobStatus> = {
	success: "completed",
	error: "failed",
};

type RunwareVideoTask = {
	taskUUID: string;
	status: string;
	videoURL?: string;
	cost?: number;
};

function toVideoJob(video: RunwareVideoTask): VideoJob {
	return {
		url: video.videoURL,
		costUsd: video.cost,
		metadata: {
			jobId: video.taskUUID,
			status: FINISHED[video.status] ?? "processing",
		},
	};
}

type ModelId =
	(typeof RUNWARE_VIDEO_MODELS)[keyof typeof RUNWARE_VIDEO_MODELS]["id"];

const omni = klingOmni({
	maxReferences: 7,
	maxElementsWithFrame: 3,
	minVoiceSec: 5,
	maxVoiceSec: 30,
	maxDescription: 100,
	sound: true,
});

const CONDITIONERS: Record<ModelId, Conditioner> = {
	// Runware allows 0.2 s over the 15 s, which covers a cut running a frame long.
	"bytedance:seedance@2.0-fast": seedance({
		maxReferences: 9,
		maxAudios: 3,
		minAudioSec: 2,
		totalAudioSec: 15,
		voicesNeedPictures: true,
	}),
	"bytedance:seedance@2.5": seedance({
		maxReferences: 30,
		maxAudios: 10,
		minAudioSec: 2,
		totalAudioSec: 30,
		voicesNeedPictures: false,
	}),
	"klingai:kling-video@3.0-turbo": klingTurbo,
	"klingai:kling-video@o3-standard": omni,
	"klingai:kling-video@o3-pro": omni,
};

const runwareModel = (model: string) =>
	Object.values(RUNWARE_VIDEO_MODELS).find(({ id }) => id === model);

export class RunwareVideo extends BaseVideoProvider {
	protected readonly blobConfig = { type: "video", provider: "runware" };

	constructor(private readonly apiKey: string) {
		super();
	}

	async validate() {
		return validateRunwareKey(this.apiKey);
	}

	async submit(params: VideoRequest): Promise<string> {
		const entry = runwareModel(params.model);
		if (!entry) throw new Error(`Runware has no video model "${params.model}"`);
		const { resolution, ...size } = renderSize(
			entry,
			DEFAULT_ASPECT_RATIO,
			params.resolution,
		);
		const conditioning = await CONDITIONERS[entry.id]({
			prompt: params.prompt,
			startFrame: params.frameImage,
			characters: params.characterAssets ?? [],
			references: params.referenceImages ?? [],
			continuityFrames: params.continuityFrames ?? [],
			size: {
				width: params.width ?? size.width,
				height: params.height ?? size.height,
			},
			resolution,
		});
		return withRunware(this.apiKey, async (runware) => {
			const result = await runware.videoInference({
				model: params.model,
				...conditioning,
				duration: params.duration ?? DEFAULT_VIDEO_DURATION_SEC,
				outputType: "URL",
				deliveryMethod: "async",
				includeCost: true,
				// Without this the SDK polls the task to completion before returning.
				skipResponse: true,
			});

			const video = Array.isArray(result) ? result[0] : result;
			if (!video?.taskUUID)
				throw new Error("Runware video inference returned no task");
			return video.taskUUID;
		});
	}

	protected async _poll(jobId: string): Promise<VideoJob> {
		return withRunware(this.apiKey, async (runware) => {
			const results = await runware.getResponse<RunwareVideoTask>({
				taskUUID: jobId,
			});

			const video = results?.[0];
			if (!video) throw new Error("Job not found");
			return toVideoJob(video);
		});
	}
}
