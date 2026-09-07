import { AttributeSchema } from "../attributes/schema";
import { formatDef, motionDef } from "../attributes/common";
import { referenceImagesDef } from "../attributes/referenceImages";

export const IMAGE_ATTRIBUTES = AttributeSchema.from([
	referenceImagesDef,
	formatDef,
	motionDef("none"),
]);
