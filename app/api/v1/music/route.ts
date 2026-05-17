import { optionalDurationSeconds } from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

const schema = bodySchema(MUSIC_MODELS, optionalDurationSeconds);

export const { POST } = createAssetRouteHandlers({
	connectorType: "music",
	schema,
	label: "Music generation",
});
