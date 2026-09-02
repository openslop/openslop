import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { HOSTED } from "@/lib/api/route-families";
import { OPENSLOP_MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

export const POST = createAssetRouteHandler(HOSTED, {
	connectorType: "music",
	models: OPENSLOP_MUSIC_MODELS,
	fields: AUDIO_FIELDS,
	label: "Music generation",
});
