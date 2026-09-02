import { BYOK } from "@/lib/api/route-families";
import { createVoiceSearchHandler } from "@/lib/api/voice-routes";
import { BYOK_TTS_MODELS } from "@/lib/connectors/tts/models";

export const GET = createVoiceSearchHandler(BYOK, BYOK_TTS_MODELS);
