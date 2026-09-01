import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { byokBodySchema, AUDIO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "music",
	schema: byokBodySchema("music", AUDIO_FIELDS),
	label: "Music generation",
});
