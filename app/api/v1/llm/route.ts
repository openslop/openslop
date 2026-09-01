import { createLLMRouteHandler } from "@/lib/api/llm-routes";
import { createApiRouteHandler } from "@/lib/api/route-handler";

export const POST = createLLMRouteHandler(createApiRouteHandler, "hosted");
