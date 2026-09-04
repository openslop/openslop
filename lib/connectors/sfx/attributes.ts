import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";

export const SFX_ATTRIBUTES = AttributeSchema.from([
	loopsDef("1"),
	volumeDef("2"),
]);
