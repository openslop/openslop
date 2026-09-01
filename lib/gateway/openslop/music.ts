import type { MusicGenerateParams } from "@/lib/connectors/types";
import { HttpAssetGateway } from "../http";
import { OPENSLOP_API_PREFIX } from "./base";

export class OpenSlopMusicGateway extends HttpAssetGateway<MusicGenerateParams> {
	protected readonly apiPrefix = OPENSLOP_API_PREFIX;
	protected readonly path = "music";
}
