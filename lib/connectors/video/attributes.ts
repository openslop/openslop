import { AttributeSchema, type AttributeDef } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import {
	durationDef,
	loopDef,
	motionDef,
	resolutionDef,
	volumeDef,
} from "../attributes/common";
import { modelEntry } from "../models";
import type { ModelRef } from "../types";

/** How a generated clip renders and plays back, whichever element type made it. */
export const clipPlaybackDefs = (model: ModelRef): AttributeDef[] => [
	resolutionDef(modelEntry("video", model).resolutions),
	durationDef(DEFAULT_DURATION),
	loopDef,
	volumeDef("5"),
	motionDef("none"),
];

export const videoAttributesFor = (model: ModelRef) =>
	AttributeSchema.from(clipPlaybackDefs(model));
