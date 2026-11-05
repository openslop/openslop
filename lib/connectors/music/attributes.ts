import { AttributeSchema } from "../attributes/schema";
import {
	loopsDef,
	trimDurationDef,
	trimStartDef,
	volumeDef,
} from "../attributes/common";

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	loopsDef,
	volumeDef("2"),
	trimStartDef,
	trimDurationDef,
]);
