import type { ModelRef, ModelsByProvider } from "../types";
import { CARTESIA_STT_MODELS } from "./cartesia/models";
import { ELEVENLABS_STT_MODELS } from "./elevenlabs/models";
import { OPENSLOP_STT_MODELS } from "./openslop/models";

export const STT_MODELS = {
	openslop: OPENSLOP_STT_MODELS,
	cartesia: CARTESIA_STT_MODELS,
	elevenlabs: ELEVENLABS_STT_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_STT_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop STT v1",
};
