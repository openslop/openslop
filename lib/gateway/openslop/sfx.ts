import type { SFXGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopSFXGateway extends HttpAssetGateway<SFXGenerateParams> {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
	protected readonly path = "sfx";
}
