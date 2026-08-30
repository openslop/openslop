import { optionalDurationSeconds } from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { OPENSLOP_MUSIC_MODELS } from "@/lib/connectors/music/openslop/models";

const schema = bodySchema(OPENSLOP_MUSIC_MODELS, optionalDurationSeconds);

export const { POST } = createAssetRouteHandlers({
	connectorType: "music",
	schema,
	label: "Music generation",
});
