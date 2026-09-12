import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { BYOK } from "@/lib/api/route-families";

export const POST = createLLMRouteHandler(BYOK);
