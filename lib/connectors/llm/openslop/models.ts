import pick from "lodash/pick";
import { ANTHROPIC_LLM_MODELS } from "../anthropic/models";

export const OPENSLOP_LLM_MODELS = pick(ANTHROPIC_LLM_MODELS, [
	"Claude Opus 5",
]);
