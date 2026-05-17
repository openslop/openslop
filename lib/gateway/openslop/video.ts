import type { VideoGenerateParams } from "@/lib/connectors/types";
import { OpenSlopAssetGateway } from "./base";

export class OpenSlopVideoGateway extends OpenSlopAssetGateway<VideoGenerateParams> {
	protected readonly path = "video";
}
