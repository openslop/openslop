import { AttributeSchema } from "../attributes/schema";
import { durationDef, motionDef, volumeDef } from "../attributes/common";

export const VIDEO_ATTRIBUTES = AttributeSchema.from([
	durationDef("5"),
	volumeDef("5"),
	motionDef("none"),
]);
