import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	loopsDef("1"),
	volumeDef("2"),
]);
