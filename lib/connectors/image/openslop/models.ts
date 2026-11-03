import { RUNWARE_IMAGE_MODELS } from "../runware/models";

export const OPENSLOP_IMAGE_MODELS = {
	"Slop Image v2": RUNWARE_IMAGE_MODELS["Muse Image"],
	"Slop Image v1": RUNWARE_IMAGE_MODELS["Seedream 5 Lite"],
	"Grok Imagine 2.0": RUNWARE_IMAGE_MODELS["Grok Imagine 2.0"],
} as const;
