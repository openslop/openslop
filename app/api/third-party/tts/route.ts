import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { TTS_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_TTS_MODELS } from "@/lib/connectors/tts/models";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "tts",
	models: BYOK_TTS_MODELS,
	fields: TTS_FIELDS,
	label: "TTS generation",
});
