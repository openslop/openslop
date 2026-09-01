import type { MusicGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { THIRD_PARTY_API_PREFIX } from "./base";

export class ThirdPartyMusicGateway extends HttpAssetGateway<MusicGenerateParams> {
	protected readonly apiPrefix = THIRD_PARTY_API_PREFIX;
	protected readonly path = "music";
}
