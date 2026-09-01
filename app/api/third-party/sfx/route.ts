import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, AUDIO_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "sfx",
	schema: bodySchema("sfx", "byok", AUDIO_FIELDS),
	label: "SFX generation",
});
