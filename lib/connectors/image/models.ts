import type { ModelRef, ModelsByProvider } from "../types";
import { OPENSLOP_IMAGE_MODELS } from "./openslop/models";
import { RUNWARE_IMAGE_MODELS } from "./runware/models";

export const BYOK_IMAGE_MODELS = {
	runware: RUNWARE_IMAGE_MODELS,
} satisfies ModelsByProvider;

export const IMAGE_MODELS = {
	openslop: OPENSLOP_IMAGE_MODELS,
	...BYOK_IMAGE_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_IMAGE_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop Image v1",
};
