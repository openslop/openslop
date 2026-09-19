import type { IRequestVideo } from "@runware/sdk-js";
import type { VideoJob, VideoJobStatus, VideoRequest } from "./base";
import { BaseVideoProvider, DEFAULT_VIDEO_DURATION_SEC } from "./base";
import { validateRunwareKey, withRunware } from "../runware";
import type { RUNWARE_VIDEO_MODELS } from "@/lib/connectors/video/runware/models";
import {
	ASPECT_RATIO_DIMENSIONS,
	DEFAULT_ASPECT_RATIO,
	DEFAULT_VIDEO_RESOLUTION,
} from "@/lib/project/aspectRatio";

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

type ModelId =
	(typeof RUNWARE_VIDEO_MODELS)[keyof typeof RUNWARE_VIDEO_MODELS]["id"];

type Pictures = { startFrames: string[]; references: string[] };

type Conditioning = Pick<IRequestVideo, "positivePrompt" | "inputs">;

type Conditioner = (prompt: string, pictures: Pictures) => Conditioning;

const pictureInputs = (
	lists: Record<string, string[]>,
): Pick<IRequestVideo, "inputs"> => {
	const inputs = Object.fromEntries(
		Object.entries(lists).filter(([, images]) => images.length > 0),
	);
	return Object.keys(inputs).length > 0 ? { inputs } : {};
};

const openingOnFrameImage =
	({ maxReferences }: { maxReferences: number }): Conditioner =>
	(prompt, { startFrames, references }) => ({
		positivePrompt: prompt,
		...pictureInputs({
			frameImages: startFrames.slice(-1),
			referenceImages: references.slice(0, maxReferences),
		}),
	});

const openingOnNamedReference =
	({ maxReferences }: { maxReferences: number }): Conditioner =>
	(prompt, pictures) => {
		const { startFrames, references } = pictures;
		if (startFrames.length === 0)
			return openingOnFrameImage({ maxReferences })(prompt, pictures);
		const referenceImages = [
			...references.slice(0, maxReferences - startFrames.length),
			...startFrames,
		];
		return {
			positivePrompt: `@Image ${referenceImages.length} as the first frame. ${prompt}`,
			inputs: { referenceImages },
		};
	};

const CONDITIONERS: Record<ModelId, Conditioner> = {
	"bytedance:seedance@2.0-fast": openingOnNamedReference({ maxReferences: 9 }),
	"klingai:kling-video@3.0-turbo": openingOnFrameImage({ maxReferences: 0 }),
};

const isModelId = (model: string): model is ModelId => model in CONDITIONERS;

const DEFAULT_SIZE =
	ASPECT_RATIO_DIMENSIONS[DEFAULT_ASPECT_RATIO].video[DEFAULT_VIDEO_RESOLUTION];

const sizeFor = (params: VideoRequest, { inputs }: Conditioning) =>
	inputs?.frameImages && params.resolution
		? { resolution: params.resolution }
		: {
				width: params.width ?? DEFAULT_SIZE.width,
				height: params.height ?? DEFAULT_SIZE.height,
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

	async submit(params: VideoRequest) {
		if (!isModelId(params.model))
			throw new Error(`Runware has no video model "${params.model}"`);
		const conditioning = CONDITIONERS[params.model](params.prompt, {
			startFrames: params.frameImages ?? [],
			references: params.referenceImages ?? [],
		});
		return withRunware(this.apiKey, async (runware) => {
			const result = await runware.videoInference({
				model: params.model,
				...conditioning,
				...sizeFor(params, conditioning),
				duration: params.duration ?? DEFAULT_VIDEO_DURATION_SEC,
				outputType: "URL",
				deliveryMethod: "async",
				// Without this the SDK polls the task to completion before returning.
				skipResponse: true,
			});

			const video = Array.isArray(result) ? result[0] : result;
			if (!video?.taskUUID)
				throw new Error("Runware video inference returned no task");
			return toVideoJob(video);
		});
	}

	protected async _generate(params: VideoRequest): Promise<VideoJob> {
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
