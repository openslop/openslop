import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS, bodySchema } from "@/lib/api/generation-schema";

export const { POST } = createAssetRouteHandlers({
	connectorType: "sfx",
	schema: bodySchema("sfx", "hosted", AUDIO_FIELDS),
	label: "SFX generation",
});
