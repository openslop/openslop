import { optionalDurationSeconds } from "@/lib/api/request-schema-fields";
import { bodySchema, createAssetRouteHandlers } from "@/lib/api/route-handler";
import { OPENSLOP_SFX_MODELS } from "@/lib/connectors/sfx/openslop/models";

const schema = bodySchema(OPENSLOP_SFX_MODELS, optionalDurationSeconds);

export const { POST } = createAssetRouteHandlers({
	connectorType: "sfx",
	schema,
	label: "SFX generation",
});
