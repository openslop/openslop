import { HOSTED } from "@/lib/api/route-families";
import { createVoiceSearchHandler } from "@/lib/api/voiceRoutes";

export const GET = createVoiceSearchHandler(HOSTED);
