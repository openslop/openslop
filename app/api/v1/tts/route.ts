import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { TTS_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "tts",
	models: OPENSLOP_TTS_MODELS,
	fields: TTS_FIELDS,
	label: "TTS generation",
});
