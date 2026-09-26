import type { IRequestVideo } from "@runware/sdk-js";
import compact from "lodash/compact";
import type { ReferenceAudio } from "@/lib/connectors/types";
import type { VideoJob, VideoJobStatus, VideoRequest } from "./base";
import { BaseVideoProvider, DEFAULT_VIDEO_DURATION_SEC } from "./base";
import pickBy from "lodash/pickBy";
import { cutVoice, secondsCap } from "../audio-cut";
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

type Sources = {
	startFrame?: string;
	references: string[];
	voices: ReferenceAudio[];
};

type Conditioning = Pick<IRequestVideo, "positivePrompt" | "inputs">;

type Conditioner = (
	prompt: string,
	sources: Sources,
) => Conditioning | Promise<Conditioning>;

const inputsOf = (
	lists: Record<string, string[]>,
): Pick<IRequestVideo, "inputs"> => {
	const inputs = pickBy(lists, (items) => items.length > 0);
	return Object.keys(inputs).length > 0 ? { inputs } : {};
};

const openingOnFrameImage =
	({ maxReferences }: { maxReferences: number }): Conditioner =>
	(prompt, { startFrame, references }) => ({
		positivePrompt: prompt,
		...inputsOf({
			frameImages: compact([startFrame]),
			referenceImages: references.slice(0, maxReferences),
		}),
	});

const imageCue = (number: number) => `@Image ${number} as the first frame.`;

const voiceCue = ({ speaker }: ReferenceAudio, index: number) =>
	`@Audio ${index + 1} defines ${speaker}'s vocal timbre, pitch, and speech cadence.`;

type Limits = {
	maxReferences: number;
	maxAudios: number;
	minAudioSec: number;
	totalAudioSec: number;
};

const audibleVoices = async (
	voices: ReferenceAudio[],
	{ maxAudios, minAudioSec, totalAudioSec }: Limits,
): Promise<ReferenceAudio[]> => {
	const heard = voices
		.filter(({ durationSec }) => durationSec >= minAudioSec)
		.slice(0, maxAudios);
	const cap = secondsCap(
		heard.map(({ durationSec }) => durationSec),
		totalAudioSec,
	);
	return Promise.all(
		heard.map(async (voice) => ({ ...voice, ...(await cutVoice(voice, cap)) })),
	);
};

/** The start frame is named last. */
const namingReferences =
	(limits: Limits): Conditioner =>
	async (prompt, { startFrame, references, voices }) => {
		const referenceImages = startFrame
			? [...references.slice(0, limits.maxReferences - 1), startFrame]
			: references.slice(0, limits.maxReferences);
		const heard = await audibleVoices(voices, limits);
		const cues = compact([
			startFrame && imageCue(referenceImages.length),
			...heard.map(voiceCue),
		]);
		return {
			positivePrompt: [...cues, prompt].join(" "),
			...inputsOf({
				referenceImages,
				referenceAudios: heard.map(({ url }) => url),
			}),
		};
	};

const CONDITIONERS: Record<ModelId, Conditioner> = {
	// Runware allows 0.2 s over the 15 s, which covers a cut running a frame long.
	"bytedance:seedance@2.0-fast": namingReferences({
		maxReferences: 9,
		maxAudios: 3,
		minAudioSec: 2,
		totalAudioSec: 15,
	}),
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
		const conditioning = await CONDITIONERS[params.model](params.prompt, {
			startFrame: params.frameImage,
			references: params.referenceImages ?? [],
			voices: params.referenceAudios ?? [],
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
