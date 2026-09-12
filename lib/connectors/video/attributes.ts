import { AttributeSchema, type AttributeDef } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import {
	durationDef,
	loopDef,
	motionDef,
	resolutionDef,
	trimToDialogueDef,
	volumeDef,
} from "../attributes/common";
import { referenceImagesDef } from "../attributes/referenceImages";
import { modelEntry } from "../models";
import type { ModelRef } from "../types";
import { startFrameDef, uploadedFrameDef } from "./startFrame";

/** Every current video model takes a conditioning frame; one that does not leaves `startFrameDef` out. */
const videoDefs = (model: ModelRef): AttributeDef[] => [
	startFrameDef,
	uploadedFrameDef,
	referenceImagesDef,
	resolutionDef(modelEntry("video", model).resolutions),
	durationDef(DEFAULT_DURATION),
	trimToDialogueDef,
	loopDef,
	volumeDef("5"),
	motionDef("none"),
];

export const videoAttributesFor = (model: ModelRef) =>
	AttributeSchema.from(videoDefs(model));
