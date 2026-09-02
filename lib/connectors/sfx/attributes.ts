import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";

export const SFX_ATTRIBUTES = AttributeSchema.from([
	...modelDefs("sfx"),
	loopsDef("1"),
	volumeDef("2"),
]);
