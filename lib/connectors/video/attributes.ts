import { trimsToDialogue } from "@/lib/canvas/element-attributes";
import { AttributeSchema } from "../attributes/schema";
import {
	durationDef,
	loopDef,
	motionDef,
	resolutionDef,
	timelineDurationDef,
	trimStartDef,
	trimToDialogueDef,
	volumeDef,
} from "../attributes/common";
import { referenceImagesDef } from "../attributes/reference-images";
import { modelEntry } from "../models";
import type { ModelRef } from "../types";
import { continuityDef, startFrameDef, uploadedFrameDef } from "./start-frame";

/** Trimmed to its dialogue, a video's length is the dialogue's. */
const unlocked = (attrs: Record<string, string>) => !trimsToDialogue(attrs);

export const videoAttributesFor = (model: ModelRef) =>
	AttributeSchema.from([
		startFrameDef,
		continuityDef,
		uploadedFrameDef,
		{ ...referenceImagesDef, edit: { kind: "images", continuity: true } },
		resolutionDef(modelEntry("video", model).resolutions),
		durationDef,
		trimToDialogueDef,
		loopDef,
		volumeDef("5"),
		motionDef,
		{ ...trimStartDef, shownWhen: unlocked },
		{ ...timelineDurationDef, shownWhen: unlocked },
	]);
