import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_SFX_MODELS } from "@/lib/connectors/sfx/models";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "sfx",
	models: BYOK_SFX_MODELS,
	fields: AUDIO_FIELDS,
	label: "SFX generation",
});
