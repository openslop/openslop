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

function defineProvider<R, M>(
	envVar: string,
	RealCtor: new (apiKey: string) => R,
	MockCtor: new () => M,
): () => R | M {
	let instance: R | M | undefined;
	return () => {
		if (instance === undefined) {
			const apiKey = process.env[envVar];
			instance = apiKey ? new RealCtor(apiKey) : new MockCtor();
		}
		return instance;
	};
}

export const getImageProvider = defineProvider(
	"RUNWARE_API_KEY",
	RunwareImage,
	MockImage,
);
export const getVideoProvider = defineProvider(
	"RUNWARE_API_KEY",
	RunwareVideo,
	MockVideo,
);
export const getMusicProvider = defineProvider(
	"ELEVENLABS_API_KEY",
	ElevenLabsMusic,
	MockMusic,
);
export const getSFXProvider = defineProvider(
	"ELEVENLABS_API_KEY",
	ElevenLabsSFX,
	MockSFX,
);
export const getLLMProvider = defineProvider(
	"ANTHROPIC_API_KEY",
	AnthropicLLM,
	MockLLM,
);
export const getTTSProvider = defineProvider(
	"CARTESIA_API_KEY",
	CartesiaTTS,
	MockTTS,
);
