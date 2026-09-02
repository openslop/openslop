import type { Provider } from "./types";

/**
 * A brand mark. Marks drawn in one flat color are `masked`, so the icon paints
 * in the current text color and stays legible in both themes; marks that carry
 * their own plate or palette are drawn as-is.
 */
export type BrandMark = { src: string; masked: boolean };

export type ProviderMeta = {
	name: string;
	description: string;
	mark: BrandMark;
};

export type BYOKProviderMeta = ProviderMeta & { keysUrl: string };

/**
 * Every provider a generation can be routed through. `openslop` is the hosted
 * one and needs no key; the rest are the user's own, reached with the key they
 * store on their account.
 */
export const PROVIDER_CATALOG: Record<typeof MANAGED_PROVIDER, ProviderMeta> &
	Record<BYOKProvider, BYOKProviderMeta> = {
	openslop: {
		name: "OpenSlop",
		description: "Hosted models, included with your account. No key needed.",
		mark: { src: "/openslop-mark.svg", masked: true },
	},
	anthropic: {
		name: "Anthropic",
		description: "Claude models for scripting, editing and Sloppy's reasoning.",
		mark: { src: "/icons/claude.svg", masked: false },
		keysUrl: "https://console.anthropic.com/settings/keys",
	},
	runware: {
		name: "Runware",
		description: "Image and video generation across many open model families.",
		mark: { src: "/icons/runware.svg", masked: false },
		keysUrl: "https://my.runware.ai/keys",
	},
	cartesia: {
		name: "Cartesia",
		description: "Low-latency speech with a large searchable voice library.",
		mark: { src: "/icons/cartesia.svg", masked: true },
		keysUrl: "https://play.cartesia.ai/keys",
	},
	elevenlabs: {
		name: "ElevenLabs",
		description: "Sound effects and music generation from a text prompt.",
		mark: { src: "/icons/elevenlabs.svg", masked: false },
		keysUrl: "https://elevenlabs.io/app/settings/api-keys",
	},
};

export const MANAGED_PROVIDER = "openslop" as const;

export type BYOKProvider = Exclude<Provider, typeof MANAGED_PROVIDER>;

export const ALL_PROVIDERS = Object.keys(PROVIDER_CATALOG) as Provider[];

export const BYOK_PROVIDERS = ALL_PROVIDERS.filter(
	(key): key is BYOKProvider => key !== MANAGED_PROVIDER,
);
