import type { ModelRef, ModelsByProvider, VisualModelEntry } from "../types";
import { OPENSLOP_VIDEO_MODELS } from "./openslop/models";
import { RUNWARE_VIDEO_MODELS } from "./runware/models";

export const VIDEO_MODELS = {
	openslop: OPENSLOP_VIDEO_MODELS,
	runware: RUNWARE_VIDEO_MODELS,
} satisfies ModelsByProvider<VisualModelEntry>;

export const DEFAULT_VIDEO_MODEL: ModelRef = {
	provider: "openslop",
	model: "Slop Video v2",
};
