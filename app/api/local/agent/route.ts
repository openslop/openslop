import { createAgentRouteHandler } from "@/lib/api/llm-routes";
import { LOCAL } from "@/lib/api/route-families";

export const POST = createAgentRouteHandler(LOCAL);
