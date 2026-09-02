import type { ImageProvider } from "./image/base";
import type { LLMProvider } from "./llm/base";
import type { MusicProvider } from "./music/base";
import type { SFXProvider } from "./sfx/base";
import type { TTSProvider } from "./tts/base";
import type { VideoProvider } from "./video/base";

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
