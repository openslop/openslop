import type { ModelRef, ModelsByProvider } from "../types";
import { CARTESIA_TTS_MODELS } from "./cartesia/models";
import { OPENSLOP_TTS_MODELS } from "./openslop/models";

export const BYOK_TTS_MODELS = {
	cartesia: CARTESIA_TTS_MODELS,
} satisfies ModelsByProvider;

export const TTS_MODELS = {
	openslop: OPENSLOP_TTS_MODELS,
	...BYOK_TTS_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_TTS_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop TTS v1",
};
