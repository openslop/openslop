import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";
import { modelDef } from "../attributes/model";

export const SFX_ATTRIBUTES = AttributeSchema.from([
	modelDef("sfx"),
	loopsDef("1"),
	volumeDef("2"),
]);
