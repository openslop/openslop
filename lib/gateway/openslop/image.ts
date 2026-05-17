import type { ImageGenerateParams } from "@/lib/connectors/types";
import { OpenSlopAssetGateway } from "./base";

export class OpenSlopImageGateway extends OpenSlopAssetGateway<ImageGenerateParams> {
	protected readonly path = "image";
}
