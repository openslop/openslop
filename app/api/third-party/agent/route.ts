import { createAgentRouteHandler } from "@/lib/api/llmRoutes";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAgentRouteHandler(BYOK);
