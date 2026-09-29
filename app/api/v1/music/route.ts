import { createAssetRouteHandler } from "@/lib/api/asset-routes";
import { HOSTED } from "@/lib/api/route-families";

export const POST = createAssetRouteHandler(HOSTED, "music");
