import { BYOK } from "@/lib/api/routeFamilies";
import { createVoiceSearchHandler } from "@/lib/api/voiceRoutes";

export const GET = createVoiceSearchHandler(BYOK);
