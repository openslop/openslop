import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS, bodySchema } from "@/lib/api/generation-schema";

export const { POST } = createAssetRouteHandlers({
	connectorType: "music",
	schema: bodySchema("music", "hosted", AUDIO_FIELDS),
	label: "Music generation",
});
