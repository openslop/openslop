import type {
	ImageGenerateParams,
	MusicGenerateParams,
	SFXGenerateParams,
} from "@/lib/connectors/types";
import type { AssetProvider } from "./base";
import type { LLMProvider } from "./llm/base";
import type { TTSProvider } from "./tts/base";
import type { VideoProvider } from "./video/base";

export type ImageProvider = AssetProvider<ImageGenerateParams>;
export type SFXProvider = AssetProvider<SFXGenerateParams>;
export type MusicProvider = AssetProvider<MusicGenerateParams>;

/** What a server-side provider promises, by the modality it serves. Any vendor's class is one of these. */
export type Providers = {
	llm: LLMProvider;
	tts: TTSProvider;
	image: ImageProvider;
	video: VideoProvider;
	sfx: SFXProvider;
	music: MusicProvider;
};

export type ProviderType = keyof Providers;
