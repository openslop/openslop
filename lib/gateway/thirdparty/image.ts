import type { ImageGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

export class ThirdPartyImageGateway extends HttpAssetGateway<ImageGenerateParams> {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;
	protected readonly path = "image";
}
