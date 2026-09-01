import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS, bodySchema } from "@/lib/api/generation-schema";
import { OPENSLOP_MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

export const { POST } = createAssetRouteHandlers({
	connectorType: "music",
	schema: bodySchema(OPENSLOP_MUSIC_MODELS, AUDIO_FIELDS),
	label: "Music generation",
});
