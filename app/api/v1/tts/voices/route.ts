import { HOSTED } from "@/lib/api/routeFamilies";
import { createVoiceSearchHandler } from "@/lib/api/voiceRoutes";

export const GET = createVoiceSearchHandler(HOSTED);
