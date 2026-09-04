import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS } from "@/lib/api/generation-schema";
import { BYOK } from "@/lib/api/route-families";
import { BYOK_MUSIC_MODELS } from "@/lib/connectors/music/models";

export const POST = createAssetRouteHandler(BYOK, {
	connectorType: "music",
	models: BYOK_MUSIC_MODELS,
	fields: AUDIO_FIELDS,
	label: "Music generation",
});
