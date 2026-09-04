import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "sfx",
	models: OPENSLOP_SFX_MODELS,
	fields: AUDIO_FIELDS,
	label: "SFX generation",
});
