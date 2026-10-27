import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";
import type {
	SpeechToTextConvertRequestModelId,
	SpeechToTextWordResponseModel,
} from "@elevenlabs/elevenlabs-js/api";
import type { Caption } from "@remotion/captions";
import type { BundleFile } from "@/lib/api/asset-bundle";
import { BaseProvider } from "../base";
import { timestampsFile } from "../timestamps-file";
import { trimmedWords, type TimedToken } from "@/lib/captions/word-captions";
import type { RawSTT, STTRequest } from "./base";
import { validateElevenLabsKey } from "../elevenlabs";
import type { STTProvider } from "../types";

/** ElevenLabs reports no per-request cost; batch Scribe is $0.22 an hour. */
const USD_PER_HOUR = 0.22;

/** Sounds like laughter are not captions, and Scribe times the spacing between words as tokens of its own. */
const isTimedWord = (
	word: SpeechToTextWordResponseModel,
): word is SpeechToTextWordResponseModel & TimedToken =>
	word.type === "word" && word.start !== undefined && word.end !== undefined;

const toCaptions = (words: SpeechToTextWordResponseModel[]): Caption[] =>
	trimmedWords(words.filter(isTimedWord));

export class ElevenLabsSTT
	extends BaseProvider<STTRequest, RawSTT>
	implements STTProvider
{
	protected readonly blobConfig = {
		type: "stt",
		provider: "elevenlabs",
	};
	private readonly client: ElevenLabsClient;

	constructor(private readonly apiKey: string) {
		super();
		this.client = new ElevenLabsClient({ apiKey });
	}

	async validate() {
		return validateElevenLabsKey(this.apiKey);
	}

	protected toFiles(result: RawSTT): BundleFile[] {
		return [timestampsFile(result.textTimestamps)];
	}

	protected async _generate({ mediaUrl, model }: STTRequest) {
		const { words, audioDurationSecs } = await this.client.speechToText.convert(
			{
				modelId: model as SpeechToTextConvertRequestModelId,
				cloudStorageUrl: mediaUrl,
				timestampsGranularity: "word",
				tagAudioEvents: false,
			},
		);
		const textTimestamps = toCaptions(words);
		if (audioDurationSecs === undefined)
			throw new Error("ElevenLabs reported no audio duration");
		return {
			textTimestamps,
			costUsd: (audioDurationSecs / 3600) * USD_PER_HOUR,
			metadata: { durationSec: audioDurationSecs },
		};
	}
}
