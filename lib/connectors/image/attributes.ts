import { AttributeSchema } from "../attributes/schema";
import { formatDef, motionDef, resolutionDef } from "../attributes/common";
import { referenceImagesDef } from "../attributes/reference-images";
import { modelEntry } from "../models";
import type { ModelRef } from "../types";

export const imageAttributesFor = (model: ModelRef) =>
	AttributeSchema.from([
		referenceImagesDef,
		resolutionDef(modelEntry("image", model).resolutions),
		formatDef,
		motionDef,
	]);
