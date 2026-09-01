import { ModelCatalog } from "../modelCatalog";
import { ANTHROPIC_LLM_MODELS } from "./anthropic/models";
import { OPENSLOP_LLM_MODELS } from "./openslop/models";

const DEFAULT_LLM_MODEL = "Slop LLM v1";

export const LLM_MODELS = ModelCatalog.from(
	{ openslop: OPENSLOP_LLM_MODELS, anthropic: ANTHROPIC_LLM_MODELS },
	DEFAULT_LLM_MODEL,
);
