import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "music",
	fields: AUDIO_FIELDS,
	label: "Music generation",
});
