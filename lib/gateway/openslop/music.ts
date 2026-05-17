import type { MusicGenerateParams } from "@/lib/connectors/types";
import { OpenSlopAssetGateway } from "./base";

export class OpenSlopMusicGateway extends OpenSlopAssetGateway<MusicGenerateParams> {
	protected readonly path = "music";
}
