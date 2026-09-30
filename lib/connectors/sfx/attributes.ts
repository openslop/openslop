import { AttributeSchema } from "../attributes/schema";
import { loopsDef, volumeDef } from "../attributes/common";

export const SFX_ATTRIBUTES = AttributeSchema.from([loopsDef, volumeDef("2")]);
