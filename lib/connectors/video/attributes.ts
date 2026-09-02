import { AttributeSchema } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import { durationDef, motionDef, volumeDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";

export const VIDEO_ATTRIBUTES = AttributeSchema.from([
	...modelDefs("video"),
	durationDef(DEFAULT_DURATION),
	volumeDef("5"),
	motionDef("none"),
]);
