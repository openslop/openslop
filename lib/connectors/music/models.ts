import { ModelCatalog } from "../modelCatalog";
import { OPENSLOP_MUSIC_MODELS } from "./openslop/models";

const DEFAULT_MUSIC_MODEL = "Slop Music v1";

export const MUSIC_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_MUSIC_MODELS },
	DEFAULT_MUSIC_MODEL,
);
