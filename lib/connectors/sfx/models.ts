import type { ModelRef, ModelsByProvider } from "../types";
import { ELEVENLABS_SFX_MODELS } from "./elevenlabs/models";
import { OPENSLOP_SFX_MODELS } from "./openslop/models";

export const BYOK_SFX_MODELS = {
	elevenlabs: ELEVENLABS_SFX_MODELS,
} satisfies ModelsByProvider;

export const SFX_MODELS = {
	openslop: OPENSLOP_SFX_MODELS,
	...BYOK_SFX_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_SFX_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop SFX v1",
};
