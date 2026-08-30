import { AttributeSchema } from "../attributes/schema";
import { motionDef } from "../attributes/common";
import { modelDef } from "../attributes/model";
import { referenceImagesDef } from "../attributes/referenceImages";

export const IMAGE_ATTRIBUTES = AttributeSchema.from([
	modelDef("image"),
	referenceImagesDef,
	motionDef("none"),
]);
