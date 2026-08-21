import { AttributeSchema } from "../attributes/schema";
import { DEFAULT_DURATION } from "@/lib/canvas/types";
import { durationDef, motionDef, volumeDef } from "../attributes/common";

export const VIDEO_ATTRIBUTES = AttributeSchema.from([
	durationDef(DEFAULT_DURATION),
	volumeDef("5"),
	motionDef("none"),
]);
