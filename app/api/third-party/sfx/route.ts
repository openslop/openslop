import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "sfx",
	fields: AUDIO_FIELDS,
	label: "SFX generation",
});
