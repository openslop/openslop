import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createLLMRouteHandler(HOSTED);
