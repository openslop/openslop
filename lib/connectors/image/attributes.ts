import { AttributeSchema } from "../attributes/schema";
import {
	formatDef,
	motionDef,
	OWN_MODEL_DEFS,
	resolutionDef,
} from "../attributes/common";
import { referenceImagesDef } from "../attributes/reference-images";
import { modelEntry } from "../models";
import type { ModelRef } from "../types";

export const imageAttributesFor = (model: ModelRef) =>
	AttributeSchema.from([
		...OWN_MODEL_DEFS,
		referenceImagesDef,
		resolutionDef(modelEntry("image", model).resolutions),
		formatDef,
		motionDef,
	]);
