import type { ModelRef, ModelsByProvider } from "../types";
import { OPENSLOP_VIDEO_MODELS } from "./openslop/models";
import { RUNWARE_VIDEO_MODELS } from "./runware/models";

export const BYOK_VIDEO_MODELS = {
	runware: RUNWARE_VIDEO_MODELS,
} satisfies ModelsByProvider;

export const VIDEO_MODELS = {
	openslop: OPENSLOP_VIDEO_MODELS,
	...BYOK_VIDEO_MODELS,
} satisfies ModelsByProvider;

export const DEFAULT_VIDEO_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop Video v1",
};
