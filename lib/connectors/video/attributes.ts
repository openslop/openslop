import { AttributeSchema } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import { DEFAULT_MOTION } from "@/lib/render/motionEffectNames";
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
import { continuityDef, startFrameDef, uploadedFrameDef } from "./startFrame";

export const videoAttributesFor = (model: ModelRef) =>
	AttributeSchema.from([
		startFrameDef,
		continuityDef,
		uploadedFrameDef,
		{ ...referenceImagesDef, edit: { kind: "images", continuity: true } },
		resolutionDef(modelEntry("video", model).resolutions),
		durationDef(DEFAULT_DURATION),
		trimToDialogueDef,
		loopDef,
		volumeDef("5"),
		motionDef(DEFAULT_MOTION),
	]);
