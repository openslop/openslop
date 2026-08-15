import { RunwareImage } from "@/lib/providers/image/runware";
import { MockImage } from "@/lib/providers/image/mock";
import { RunwareVideo } from "@/lib/providers/video/runware";
import { MockVideo } from "@/lib/providers/video/mock";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { MockMusic } from "@/lib/providers/music/mock";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { MockSFX } from "@/lib/providers/sfx/mock";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { MockLLM } from "@/lib/providers/llm/mock";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import { MockTTS } from "@/lib/providers/tts/mock";

/**
 * The one way a provider is resolved: real when its key is set, mock otherwise,
 * built once. Factories rather than constructors, so a provider that is not a
 * class resolves through the same mechanism as the rest.
 */
function defineProvider<R, M>(
	envVar: string,
	create: (apiKey: string) => R,
	createMock: () => M,
): () => R | M {
	let instance: R | M | undefined;
	return () => {
		if (instance === undefined) {
			const apiKey = process.env[envVar];
			instance = apiKey ? create(apiKey) : createMock();
		}
		return instance;
	};
}

export const getImageProvider = defineProvider(
	"RUNWARE_API_KEY",
	(apiKey) => new RunwareImage(apiKey),
	() => new MockImage(),
);
export const getVideoProvider = defineProvider(
	"RUNWARE_API_KEY",
	(apiKey) => new RunwareVideo(apiKey),
	() => new MockVideo(),
);
export const getMusicProvider = defineProvider(
	"ELEVENLABS_API_KEY",
	(apiKey) => new ElevenLabsMusic(apiKey),
	() => new MockMusic(),
);
export const getSFXProvider = defineProvider(
	"ELEVENLABS_API_KEY",
	(apiKey) => new ElevenLabsSFX(apiKey),
	() => new MockSFX(),
);
export const getLLMProvider = defineProvider(
	"ANTHROPIC_API_KEY",
	(apiKey) => new AnthropicLLM(apiKey),
	() => new MockLLM(),
);
export const getTTSProvider = defineProvider(
	"CARTESIA_API_KEY",
	(apiKey) => new CartesiaTTS(apiKey),
	() => new MockTTS(),
);
