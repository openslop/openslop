import { HOSTED } from "@/lib/api/route-families";
import { createVoicePreviewHandler } from "@/lib/api/voiceRoutes";

export const GET = createVoicePreviewHandler(HOSTED);
