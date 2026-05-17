import { z } from "zod";
import { requiredVoiceId } from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

const schema = bodySchema(TTS_MODELS, {
	voiceId: requiredVoiceId,
	speed: z.enum(TTS_SPEEDS).optional(),
	volume: z.number().optional(),
	format: z.string().optional(),
});

export const { POST } = createAssetRouteHandlers({
	connectorType: "tts",
	schema,
	label: "TTS generation",
});
