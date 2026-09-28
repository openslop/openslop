import { HOSTED } from "@/lib/api/route-families";
import { createVoiceSearchHandler } from "@/lib/api/voice-routes";

export const GET = createVoiceSearchHandler(HOSTED);
