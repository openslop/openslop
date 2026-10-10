import { createLLMRouteHandler } from "@/lib/api/llmRoutes";
import { HOSTED } from "@/lib/api/routeFamilies";

export const POST = createLLMRouteHandler(HOSTED);
