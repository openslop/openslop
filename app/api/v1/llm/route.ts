import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_LLM_MODELS } from "@/lib/connectors/llm/openslop/models";

export const POST = createLLMRouteHandler(HOSTED, OPENSLOP_LLM_MODELS);
