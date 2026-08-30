import { z } from "zod";
import { requiredVoiceId } from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { TTS_SPEEDS } from "@/lib/connectors/tts/enums";
import { OPENSLOP_TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

const schema = bodySchema(OPENSLOP_TTS_MODELS, {
	voiceId: requiredVoiceId,
	speed: z.enum(TTS_SPEEDS).optional(),
	volume: z.number().optional(),
	emotion: z.string().optional(),
	format: z.string().optional(),
});

export const { POST } = createAssetRouteHandlers({
	connectorType: "tts",
	schema,
	label: "TTS generation",
});
