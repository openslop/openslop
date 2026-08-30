import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";
import { modelDef } from "../attributes/model";

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	modelDef("music"),
	loopsDef("1"),
	volumeDef("2"),
]);
