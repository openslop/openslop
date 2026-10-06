import { createLLMRouteHandler } from "@/lib/api/llmRoutes";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createLLMRouteHandler(HOSTED);
