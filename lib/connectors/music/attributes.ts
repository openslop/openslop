import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";
import { modelDefs } from "../attributes/model";

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	...modelDefs("music"),
	loopsDef("1"),
	volumeDef("2"),
]);
