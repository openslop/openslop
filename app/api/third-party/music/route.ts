import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, AUDIO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "music",
	schema: bodySchema("music", "byok", AUDIO_FIELDS),
	label: "Music generation",
});
