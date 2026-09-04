import { HOSTED } from "@/lib/api/route-families";
import { createVoicePreviewHandler } from "@/lib/api/voice-routes";
import { OPENSLOP_TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

export const GET = createVoicePreviewHandler(HOSTED, OPENSLOP_TTS_MODELS);
