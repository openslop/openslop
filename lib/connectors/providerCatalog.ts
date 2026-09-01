import type { ConnectorType, ProviderKey } from "./types";

/**
 * A brand mark. Marks drawn in one flat color are `masked`, so the icon paints
 * in the current text color and stays legible in both themes; marks that carry
 * their own plate or palette are drawn as-is.
 */
export type BrandMark = { src: string; masked: boolean };

export type ProviderMeta = {
	name: string;
	/** What the provider generates, so a browser can filter it by capability. */
	modalities: ConnectorType[];
	description: string;
	mark: BrandMark;
	/** Where the user gets a key. Absent for the provider OpenSlop hosts itself. */
	keysUrl?: string;
};

/**
 * Every provider a generation can be routed through. `openslop` is the hosted
 * one and needs no key; the rest are the user's own, reached with the key they
 * store on their account.
 */
export const PROVIDER_CATALOG: Record<ProviderKey, ProviderMeta> = {
	openslop: {
		name: "OpenSlop",
		modalities: [
			"llm",
			"image",
			"animated_image",
			"video",
			"tts",
			"sfx",
			"music",
		],
		description: "Hosted models, included with your account. No key needed.",
		mark: { src: "/openslop-mark.svg", masked: true },
	},
	anthropic: {
		name: "Anthropic",
		modalities: ["llm"],
		description: "Claude models for scripting, editing and Sloppy's reasoning.",
		mark: { src: "/icons/claude.svg", masked: false },
		keysUrl: "https://console.anthropic.com/settings/keys",
	},
	runware: {
		name: "Runware",
		modalities: ["image", "animated_image", "video"],
		description: "Image and video generation across many open model families.",
		mark: { src: "/icons/runware.svg", masked: false },
		keysUrl: "https://my.runware.ai/keys",
	},
	cartesia: {
		name: "Cartesia",
		modalities: ["tts"],
		description: "Low-latency speech with a large searchable voice library.",
		mark: { src: "/icons/cartesia.svg", masked: true },
		keysUrl: "https://play.cartesia.ai/keys",
	},
	elevenlabs: {
		name: "ElevenLabs",
		modalities: ["sfx", "music"],
		description: "Sound effects and music generation from a text prompt.",
		mark: { src: "/icons/elevenlabs.svg", masked: false },
		keysUrl: "https://elevenlabs.io/app/settings/api-keys",
	},
};

/** The hosted provider, which every account can generate with. */
export const MANAGED_PROVIDER = "openslop" as const;

/** Every provider a generation can run on, hosted first. */
export const ALL_PROVIDERS = Object.keys(PROVIDER_CATALOG) as ProviderKey[];

/** Providers the user supplies a key for, in the order they are offered. */
export const BYOK_PROVIDERS = ALL_PROVIDERS.filter(
	(key) => key !== MANAGED_PROVIDER,
);

export const providerMeta = (provider: ProviderKey): ProviderMeta =>
	PROVIDER_CATALOG[provider];
