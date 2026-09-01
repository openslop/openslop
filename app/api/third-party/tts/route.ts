import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { byokBodySchema, TTS_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "tts",
	schema: byokBodySchema("tts", TTS_FIELDS),
	label: "TTS generation",
});
