import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { bodySchema, TTS_FIELDS } from "@/lib/api/generation-schema";
import { OPENSLOP_TTS_MODELS } from "@/lib/connectors/tts/openslop/models";

export const { POST } = createAssetRouteHandlers({
	connectorType: "tts",
	schema: bodySchema(OPENSLOP_TTS_MODELS, TTS_FIELDS),
	label: "TTS generation",
});
