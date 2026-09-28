import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { TTS_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "tts",
	fields: TTS_FIELDS,
	label: "TTS generation",
});
