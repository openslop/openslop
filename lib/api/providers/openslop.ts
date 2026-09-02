import { OPENSLOP_IMAGE_MODELS } from "@/lib/connectors/image/openslop/models";
import { OPENSLOP_LLM_MODELS } from "@/lib/connectors/llm/openslop/models";
import { OPENSLOP_MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";
import { OPENSLOP_SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";
import { OPENSLOP_TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { OPENSLOP_VIDEO_MODELS } from "@/lib/connectors/video/openslop/models";
import { MockImage } from "@/lib/providers/image/mock";
import { RunwareImage } from "@/lib/providers/image/runware";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { MockMusic } from "@/lib/providers/music/mock";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { MockTTS } from "@/lib/providers/tts/mock";
import type { ProviderType, Providers } from "@/lib/providers/types";
import { MockVideo } from "@/lib/providers/video/mock";
import { RunwareVideo } from "@/lib/providers/video/runware";

function hosted<R, M>(
	envVar: string,
	Real: new (apiKey: string) => R,
	Mock: new () => M,
): () => R | M {
	let instance: R | M | undefined;
	return () => {
		if (instance === undefined) {
			const apiKey = process.env[envVar];
			instance = apiKey ? new Real(apiKey) : new Mock();
		}
		return instance;
	};
}

type Sources<K extends ProviderType, TModels> = Record<
	keyof TModels,
	() => Providers[K]
>;

/** Keyed by the model tables' own names, so a model cannot be listed without saying what serves it. */
const OPENSLOP_PROVIDERS: {
	llm: Sources<"llm", typeof OPENSLOP_LLM_MODELS>;
	tts: Sources<"tts", typeof OPENSLOP_TTS_MODELS>;
	image: Sources<"image", typeof OPENSLOP_IMAGE_MODELS>;
	video: Sources<"video", typeof OPENSLOP_VIDEO_MODELS>;
	sfx: Sources<"sfx", typeof OPENSLOP_SFX_MODELS>;
	music: Sources<"music", typeof OPENSLOP_MUSIC_MODELS>;
} = {
	llm: { "Slop LLM v1": hosted("ANTHROPIC_API_KEY", AnthropicLLM, MockLLM) },
	tts: { "Slop TTS v1": hosted("CARTESIA_API_KEY", CartesiaTTS, MockTTS) },
	image: {
		"Slop Image v1": hosted("RUNWARE_API_KEY", RunwareImage, MockImage),
	},
	video: {
		"Slop Video v1": hosted("RUNWARE_API_KEY", RunwareVideo, MockVideo),
	},
	sfx: { "Slop SFX v1": hosted("ELEVENLABS_API_KEY", ElevenLabsSFX, MockSFX) },
	music: {
		"Slop Music v1": hosted("ELEVENLABS_API_KEY", ElevenLabsMusic, MockMusic),
	},
};

export function hostedProviderFor<K extends ProviderType>(
	type: K,
	model: string,
): Providers[K] {
	const sources: Partial<Record<string, () => Providers[ProviderType]>> =
		OPENSLOP_PROVIDERS[type];
	const source = sources[model];
	if (!source) throw new Error(`OpenSlop hosts no ${type} model "${model}"`);
	return source() as Providers[K];
}
