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

/** How a model takes a request, where Runware's models differ. */
type ModelProfile = {
	/** Pin the last start frame as the first frame, or name every start frame as a reference in the prompt. */
	startFrames: "firstFrame" | "namedReferences";
	referenceImages: boolean;
	/** Whether the model renders its soundtrack only when asked. */
	askForSound: boolean;
};

const PROFILES: Record<ModelId, ModelProfile> = {
	// Refuses frame images beside reference images.
	"bytedance:seedance@2.0-fast": {
		startFrames: "namedReferences",
		referenceImages: true,
		askForSound: false,
	},
	"klingai:kling-video@3.0-turbo": {
		startFrames: "firstFrame",
		referenceImages: false,
		askForSound: true,
	},
};

const isModelId = (model: string): model is ModelId => model in PROFILES;

type ModelInputs = {
	prompt: string;
	frameImages: string[];
	referenceImages: string[];
};

/** Start frames arrive in time order, the last being the one to open on. */
function inputsFor(params: VideoRequest, profile: ModelProfile): ModelInputs {
	const references = profile.referenceImages
		? (params.referenceImages ?? [])
		: [];
	const frames = params.frameImages ?? [];
	if (frames.length === 0 || profile.startFrames === "firstFrame")
		return {
			prompt: params.prompt,
			frameImages: frames.slice(-1),
			referenceImages: references,
		};
	const referenceImages = [...references, ...frames];
	return {
		prompt: `@Image ${referenceImages.length} as the first frame. ${params.prompt}`,
		frameImages: [],
		referenceImages,
	};
}

const DEFAULT_SIZE =
	ASPECT_RATIO_DIMENSIONS[DEFAULT_ASPECT_RATIO].video[DEFAULT_VIDEO_RESOLUTION];

/** A video opening on a frame takes its aspect from the frame, so it is sized by preset. */
const sizeFor = (params: VideoRequest, { frameImages }: ModelInputs) =>
	frameImages.length > 0 && params.resolution
		? { resolution: params.resolution }
		: {
				width: params.width ?? DEFAULT_SIZE.width,
				height: params.height ?? DEFAULT_SIZE.height,
			};

/** Runware keys provider settings by the vendor that prefixes the model id. */
const soundFor = (model: string, profile: ModelProfile) =>
	profile.askForSound
		? { providerSettings: { [model.split(":")[0]]: { sound: true } } }
		: {};

const orNone = (images: string[]) => (images.length > 0 ? images : undefined);

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
		const profile = PROFILES[params.model];
		const inputs = inputsFor(params, profile);
		return withRunware(this.apiKey, async (runware) => {
			const result = await runware.videoInference({
				positivePrompt: inputs.prompt,
				model: params.model,
				...sizeFor(params, inputs),
				duration: params.duration ?? DEFAULT_VIDEO_DURATION_SEC,
				...soundFor(params.model, profile),
				outputType: "URL",
				deliveryMethod: "async",
				// Without this the SDK polls the task to completion before returning.
				skipResponse: true,
				inputs: {
					frameImages: orNone(inputs.frameImages),
					referenceImages: orNone(inputs.referenceImages),
				},
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
