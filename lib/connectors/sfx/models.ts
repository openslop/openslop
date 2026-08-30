import { ModelCatalog } from "../modelCatalog";
import { OPENSLOP_SFX_MODELS } from "./openslop/models";

const DEFAULT_SFX_MODEL = "Slop SFX v1";

export const SFX_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_SFX_MODELS },
	DEFAULT_SFX_MODEL,
);
