import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { BYOK } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(BYOK, "image");
