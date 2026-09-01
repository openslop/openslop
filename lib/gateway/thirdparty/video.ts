import type { VideoGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

export class ThirdPartyVideoGateway extends HttpAssetGateway<VideoGenerateParams> {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;
	protected readonly path = "video";
}
