import { AttributeSchema } from "../attributes/schema";
import { DEFAULT_MOTION } from "@/lib/render/motionEffectNames";
import { formatDef, motionDef } from "../attributes/common";
import { referenceImagesDef } from "../attributes/referenceImages";

export const IMAGE_ATTRIBUTES = AttributeSchema.from([
	referenceImagesDef,
	formatDef,
	motionDef(DEFAULT_MOTION),
]);
