import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { createSessionRouteHandler } from "@/lib/api/route-handler";

export const POST = createLLMRouteHandler(createSessionRouteHandler, "byok");
