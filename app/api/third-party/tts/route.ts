import { createThirdPartyAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, TTS_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createThirdPartyAssetRouteHandlers({
	connectorType: "tts",
	schema: bodySchema("tts", "byok", TTS_FIELDS),
	label: "TTS generation",
});
