import { AttributeSchema } from "../attributes/schema";
import {
	loopsDef,
	OWN_MODEL_DEFS,
	timelineDurationDef,
	trimStartDef,
	volumeDef,
} from "../attributes/common";

export const SFX_ATTRIBUTES = AttributeSchema.from([
	...OWN_MODEL_DEFS,
	loopsDef,
	volumeDef("2"),
	trimStartDef,
	timelineDurationDef,
]);
