import type { ValidationResult } from "@/lib/connectors/connectorRecord";
import type { BYOKProvider } from "@/lib/connectors/providerCatalog";
import { stringifyError } from "@/lib/errors";
import { RunwareImage } from "@/lib/providers/image/runware";
import { AnthropicLLM } from "@/lib/providers/llm/anthropic";
import { ElevenLabsMusic } from "@/lib/providers/music/elevenlabs";
import { ElevenLabsSFX } from "@/lib/providers/sfx/elevenlabs";
import { CartesiaTTS } from "@/lib/providers/tts/cartesia";
import type { ValidatingProvider } from "@/lib/providers/validate";
import { RunwareVideo } from "@/lib/providers/video/runware";
import {
	MissingConnectorKeyError,
	readConnectorKey,
	setConnectorStatus,
} from "../connectorKeys";

type VendorClasses = {
	llm: AnthropicLLM;
	tts: CartesiaTTS;
	image: RunwareImage;
	video: RunwareVideo;
	sfx: ElevenLabsSFX;
	music: ElevenLabsMusic;
};

export type VendorType = keyof VendorClasses;

type VendorClass<K extends VendorType> = new (
	apiKey: string,
) => VendorClasses[K] & ValidatingProvider;

/**
 * Every vendor a user can bring a key for, and what each of its classes serves.
 * One home per vendor: the generation lookup and the key check read the same
 * table, and every class listed must be able to validate, so a vendor's answer
 * for its key is written once and shared by all of them.
 */
const VENDORS: Record<
	BYOKProvider,
	Partial<{ [K in VendorType]: VendorClass<K> }>
> = {
	anthropic: { llm: AnthropicLLM },
	runware: { image: RunwareImage, video: RunwareVideo },
	cartesia: { tts: CartesiaTTS },
	elevenlabs: { music: ElevenLabsMusic, sfx: ElevenLabsSFX },
};

/** The only place a stored key is read, one generation at a time. */
export async function byokProviderFor<K extends VendorType>(
	userId: string,
	provider: BYOKProvider,
	type: K,
): Promise<VendorClasses[K]> {
	const Ctor = VENDORS[provider][type];
	if (!Ctor)
		throw new Error(`"${provider}" does not serve ${type} generations`);
	const key = await readConnectorKey(userId, provider);
	if (!key) throw new MissingConnectorKeyError(provider);
	return new Ctor(key);
}

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

export async function verifyConnector(
	userId: string,
	provider: BYOKProvider,
	key: string,
): Promise<ValidationResult> {
	const result = await validateKey(provider, key);
	await setConnectorStatus(userId, provider, result.ok ? "valid" : "invalid");
	return result;
}
