import { AttributeSchema } from "../attributes/schema";
import {
	loopsDef,
	timelineDurationDef,
	trimStartDef,
	volumeDef,
} from "../attributes/common";

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	loopsDef,
	volumeDef("2"),
	trimStartDef,
	timelineDurationDef,
]);
