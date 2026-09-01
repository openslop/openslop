import type { ImageGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopImageGateway extends HttpAssetGateway<ImageGenerateParams> {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
	protected readonly path = "image";
}
