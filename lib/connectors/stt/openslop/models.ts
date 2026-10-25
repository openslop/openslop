import { ELEVENLABS_STT_MODELS } from "../elevenlabs/models";

export const OPENSLOP_STT_MODELS = {
	"Slop STT v1": ELEVENLABS_STT_MODELS["Scribe v2"],
} as const;
