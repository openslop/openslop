import { MANAGED_PROVIDER } from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { MissingConnectorKeyError, readConnectorKey } from "./connectorKeys";
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

/** What a generation needs to know to pick the provider it runs on. */
export type ProviderRequest = { userId: string; provider: ProviderKey };

/**
 * Pairs a connector type's hosted provider with the vendors a user can reach on
 * their own key. Both sides are the same provider classes; only where the key
 * comes from differs, so BYOK adds a lookup rather than a second code path.
 */
function byokAware<T>(
	hosted: () => T,
	byok: Partial<Record<ProviderKey, new (apiKey: string) => T>>,
) {
	return async (request: ProviderRequest): Promise<T> => {
		if (request.provider === MANAGED_PROVIDER) return hosted();
		const Ctor = byok[request.provider];
		if (!Ctor)
			throw new Error(`Provider "${request.provider}" is not configured here`);
		const key = await readConnectorKey(request.userId, request.provider);
		if (!key) throw new MissingConnectorKeyError(request.provider);
		return new Ctor(key);
	};
}

export const imageProviderFor = byokAware(getImageProvider, {
	runware: RunwareImage,
});
export const videoProviderFor = byokAware(getVideoProvider, {
	runware: RunwareVideo,
});
export const musicProviderFor = byokAware(getMusicProvider, {
	elevenlabs: ElevenLabsMusic,
});
export const sfxProviderFor = byokAware(getSFXProvider, {
	elevenlabs: ElevenLabsSFX,
});
export const llmProviderFor = byokAware(getLLMProvider, {
	anthropic: AnthropicLLM,
});
export const ttsProviderFor = byokAware(getTTSProvider, {
	cartesia: CartesiaTTS,
});
