import { createAssetRouteHandlers } from "@/lib/api/asset-routes";
import { AUDIO_FIELDS, bodySchema } from "@/lib/api/generation-schema";
import { OPENSLOP_SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

export const { POST } = createAssetRouteHandlers({
	connectorType: "sfx",
	schema: bodySchema(OPENSLOP_SFX_MODELS, AUDIO_FIELDS),
	label: "SFX generation",
});
