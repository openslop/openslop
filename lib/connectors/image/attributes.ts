import { AttributeSchema } from "../attributes/schema";
import { motionDef } from "../attributes/common";
import { referenceImagesDef } from "../attributes/referenceImages";

export const IMAGE_ATTRIBUTES = AttributeSchema.from([
	referenceImagesDef,
	motionDef("none"),
]);
