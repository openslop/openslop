import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { byokBodySchema, AUDIO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "sfx",
	schema: byokBodySchema("sfx", AUDIO_FIELDS),
	label: "SFX generation",
});
