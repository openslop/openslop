import type { ModelRef, ModelsByProvider } from "../types";
import { ELEVENLABS_MUSIC_MODELS } from "./elevenlabs/models";
import { OPENSLOP_MUSIC_MODELS } from "./openslop/models";

export const BYOK_MUSIC_MODELS = {
	elevenlabs: ELEVENLABS_MUSIC_MODELS,
} satisfies ModelsByProvider;

export const MUSIC_MODELS = {
	openslop: OPENSLOP_MUSIC_MODELS,
	...BYOK_MUSIC_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_MUSIC_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop Music v1",
};
