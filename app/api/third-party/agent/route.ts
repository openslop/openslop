import { createAgentRouteHandler } from "@/lib/api/llmRoutes";
import { BYOK } from "@/lib/api/routeFamilies";

export const POST = createAgentRouteHandler(BYOK);
