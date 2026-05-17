import type { SFXGenerateParams } from "@/lib/connectors/types";
import { OpenSlopAssetGateway } from "./base";

export class OpenSlopSFXGateway extends OpenSlopAssetGateway<SFXGenerateParams> {
	protected readonly path = "sfx";
}
