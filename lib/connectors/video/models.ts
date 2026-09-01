import { ModelCatalog } from "../modelCatalog";
import { OPENSLOP_VIDEO_MODELS } from "./openslop/models";
import { RUNWARE_VIDEO_MODELS } from "./runware/models";

const DEFAULT_VIDEO_MODEL = "Slop Video v1";

export const VIDEO_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_VIDEO_MODELS, runware: RUNWARE_VIDEO_MODELS },
	DEFAULT_VIDEO_MODEL,
);
