import type { ValidationResult } from "@/lib/connectors/connectorRecord";
import {
	MANAGED_PROVIDER,
	type BYOKProvider,
} from "@/lib/connectors/providerCatalog";
import type { ProviderKey } from "@/lib/connectors/types";
import { stringifyError } from "@/lib/errors";
import type { ValidatingProvider } from "@/lib/providers/validate";
import {
	MissingConnectorKeyError,
	readConnectorKey,
	setConnectorStatus,
} from "./connectorKeys";
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

/** What each connector type generates with when it runs on our own keys. */
type HostedProviders = {
	image: ReturnType<typeof getImageProvider>;
	video: ReturnType<typeof getVideoProvider>;
	music: ReturnType<typeof getMusicProvider>;
	sfx: ReturnType<typeof getSFXProvider>;
	llm: ReturnType<typeof getLLMProvider>;
	tts: ReturnType<typeof getTTSProvider>;
};

/**
 * A vendor's class for one connector type. It generates what the hosted
 * provider generates — the two sides are the same classes, only the key
 * differs — and it can answer for the key it was built with.
 */
type VendorClass<K extends keyof HostedProviders> = new (
	apiKey: string,
) => HostedProviders[K] & ValidatingProvider;

/**
 * Every vendor a user can bring a key for, and what each of its classes serves.
 * One home per vendor: the generation lookup and the key check read the same
 * table, and every class listed must be able to validate, so a vendor's answer
 * for its key is written once and shared by all of them.
 */
const VENDORS: Record<
	BYOKProvider,
	Partial<{ [K in keyof HostedProviders]: VendorClass<K> }>
> = {
	anthropic: { llm: AnthropicLLM },
	runware: { image: RunwareImage, video: RunwareVideo },
	cartesia: { tts: CartesiaTTS },
	elevenlabs: { music: ElevenLabsMusic, sfx: ElevenLabsSFX },
};

/**
 * The provider a request runs on: ours when the model is hosted, and the
 * vendor's own class built with the caller's key otherwise. BYOK adds a lookup
 * rather than a second code path.
 */
function providerFor<K extends keyof HostedProviders>(
	type: K,
	hosted: () => HostedProviders[K],
) {
	return async (request: ProviderRequest): Promise<HostedProviders[K]> => {
		if (request.provider === MANAGED_PROVIDER) return hosted();
		const Ctor = VENDORS[request.provider][type];
		if (!Ctor)
			throw new Error(
				`"${request.provider}" does not serve ${type} generations`,
			);
		const key = await readConnectorKey(request.userId, request.provider);
		if (!key) throw new MissingConnectorKeyError(request.provider);
		return new Ctor(key);
	};
}

export const imageProviderFor = providerFor("image", getImageProvider);
export const videoProviderFor = providerFor("video", getVideoProvider);
export const musicProviderFor = providerFor("music", getMusicProvider);
export const sfxProviderFor = providerFor("sfx", getSFXProvider);
export const llmProviderFor = providerFor("llm", getLLMProvider);
export const ttsProviderFor = providerFor("tts", getTTSProvider);

/**
 * Whether a key works, asked of the vendor itself. Any of a vendor's classes
 * can answer: an account stores one key per provider, and they all hold it.
 * Network trouble comes back as a failed validation rather than thrown — the
 * user asked whether the key works, and "we could not tell" is an answer they
 * can act on.
 */
export async function validateKey(
	provider: BYOKProvider,
	key: string,
): Promise<ValidationResult> {
	const [Ctor] = Object.values(VENDORS[provider]);
	if (!Ctor) throw new Error(`No "${provider}" provider to check the key with`);
	try {
		return await new Ctor(key).validate();
	} catch (error) {
		return { ok: false, error: stringifyError(error) };
	}
}

/** Checks a key against its provider and records what it found on the account. */
export async function verifyConnector(
	userId: string,
	provider: BYOKProvider,
	key: string,
): Promise<ValidationResult> {
	const result = await validateKey(provider, key);
	await setConnectorStatus(userId, provider, result.ok ? "valid" : "invalid");
	return result;
}
