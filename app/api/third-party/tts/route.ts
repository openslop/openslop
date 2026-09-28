import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { TTS_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "tts",
	fields: TTS_FIELDS,
	label: "TTS generation",
});
