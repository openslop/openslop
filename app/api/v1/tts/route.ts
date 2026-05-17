import { z } from "zod";
import { getTTSProvider } from "@/lib/api/providers";
import { requiredVoiceId } from "@/lib/api/request-schema-fields";
import { bodySchema, createRouteHandler } from "@/lib/api/route-handler";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";
import { TTS_SPEEDS } from "@/lib/connectors/tts/enums";

const schema = bodySchema(TTS_MODELS, {
	voiceId: requiredVoiceId,
	speed: z.enum(TTS_SPEEDS).optional(),
	volume: z.number().optional(),
	format: z.string().optional(),
});

export const POST = createRouteHandler({
	schema,
	getProvider: getTTSProvider,
	label: "TTS generation",
});
