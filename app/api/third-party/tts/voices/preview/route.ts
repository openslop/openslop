import { BYOK } from "@/lib/api/routeFamilies";
import { createVoicePreviewHandler } from "@/lib/api/voiceRoutes";

export const GET = createVoicePreviewHandler(BYOK);
