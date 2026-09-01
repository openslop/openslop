import type { VideoGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopVideoGateway extends HttpAssetGateway<VideoGenerateParams> {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
	protected readonly path = "video";
}
