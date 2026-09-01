import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, TTS_FIELDS } from "@/lib/api/generation-schema";

export const { POST } = createAssetRouteHandlers({
	connectorType: "tts",
	schema: bodySchema("tts", "hosted", TTS_FIELDS),
	label: "TTS generation",
});
