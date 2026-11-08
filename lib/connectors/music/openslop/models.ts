import pick from "lodash/pick";
import { ELEVENLABS_MUSIC_MODELS } from "../elevenlabs/models";

export const OPENSLOP_MUSIC_MODELS = pick(ELEVENLABS_MUSIC_MODELS, [
	"Eleven Music v1",
]);
