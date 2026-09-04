import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_LLM_MODELS } from "@/lib/connectors/llm/models";

export const POST = createLLMRouteHandler(BYOK, BYOK_LLM_MODELS);
