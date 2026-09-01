import { ModelCatalog } from "../modelCatalog";
import { OPENSLOP_IMAGE_MODELS } from "./openslop/models";
import { RUNWARE_IMAGE_MODELS } from "./runware/models";

const DEFAULT_IMAGE_MODEL = "Slop Image v1";

export const IMAGE_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_IMAGE_MODELS, runware: RUNWARE_IMAGE_MODELS },
	DEFAULT_IMAGE_MODEL,
);
