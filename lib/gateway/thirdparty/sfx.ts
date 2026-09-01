import type { SFXGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

export class ThirdPartySFXGateway extends HttpAssetGateway<SFXGenerateParams> {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;
	protected readonly path = "sfx";
}
