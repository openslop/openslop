import { BYOK } from "@/lib/api/route-families";
import { createVoicePreviewHandler } from "@/lib/api/voice-routes";

export const GET = createVoicePreviewHandler(BYOK);
