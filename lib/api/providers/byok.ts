import type { ValidationResult } from "@/lib/connectors/provider-key";
import type { BYOKProvider } from "@/lib/connectors/provider-catalog";
import { RunwareImage } from "@/lib/providers/image/runware";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { CartesiaSTT } from "@/lib/providers/stt/cartesia";
import { ElevenLabsSTT } from "@/lib/providers/stt/elevenlabs";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import type { ProviderType, Providers } from "@/lib/providers/types";
import { RunwareVideo } from "@/lib/providers/video/runware";
import {
	MissingProviderKeyError,
	readProviderKey,
	setKeyStatus,
} from "../provider-keys";

type VendorClass<K extends ProviderType> = new (apiKey: string) => Providers[K];

/**
 * Every vendor a user can bring a key for, and what each of its classes serves.
 * One home per vendor: the generation lookup and the key check read the same
 * table.
 */
const VENDORS: Record<
	BYOKProvider,
	Partial<{ [K in ProviderType]: VendorClass<K> }>
> = {
	anthropic: { llm: AnthropicLLM },
	runware: { image: RunwareImage, video: RunwareVideo },
	cartesia: { tts: CartesiaTTS, stt: CartesiaSTT },
	elevenlabs: {
		music: ElevenLabsMusic,
		sfx: ElevenLabsSFX,
		stt: ElevenLabsSTT,
	},
};

/** The only place a stored key is read, one generation at a time. */
export async function byokProviderFor<K extends ProviderType>(
	userId: string,
	provider: BYOKProvider,
	type: K,
): Promise<Providers[K]> {
	const Ctor = VENDORS[provider][type];
	if (!Ctor)
		throw new Error(`"${provider}" does not serve ${type} generations`);
	const key = await readProviderKey(userId, provider);
	if (!key) throw new MissingProviderKeyError(provider);
	return new Ctor(key);
}

/**
 * Whether a key works, asked of the vendor itself. Any of a vendor's classes
 * can answer: an account stores one key per provider, and they all hold it.
 * A vendor that gives no answer throws, so the stored status is left alone.
 */
export async function validateKey(
	provider: BYOKProvider,
	key: string,
): Promise<ValidationResult> {
	const [Ctor] = Object.values(VENDORS[provider]);
	if (!Ctor) throw new Error(`No "${provider}" provider to check the key with`);
	return new Ctor(key).validate();
}

export async function verifyProviderKey(
	userId: string,
	provider: BYOKProvider,
	key: string,
): Promise<ValidationResult> {
	const result = await validateKey(provider, key);
	await setKeyStatus(userId, provider, result.ok ? "valid" : "invalid");
	return result;
}
