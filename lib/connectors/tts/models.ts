import { ModelCatalog } from "../modelCatalog";
import { CARTESIA_TTS_MODELS } from "./cartesia/models";
import { OPENSLOP_TTS_MODELS } from "./openslop/models";

const DEFAULT_TTS_MODEL = "Slop TTS v1";

export const TTS_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_TTS_MODELS, cartesia: CARTESIA_TTS_MODELS },
	DEFAULT_TTS_MODEL,
);
