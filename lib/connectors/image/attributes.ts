import { AttributeSchema } from "../attributes/schema";
import { motionDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";
import { referenceImagesDef } from "../attributes/referenceImages";

export const IMAGE_ATTRIBUTES = AttributeSchema.from([
	...modelDefs("image"),
	referenceImagesDef,
	motionDef("none"),
]);
