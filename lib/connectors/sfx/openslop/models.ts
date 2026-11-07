import pick from "lodash/pick";
import { ELEVENLABS_SFX_MODELS } from "../elevenlabs/models";

export const OPENSLOP_SFX_MODELS = pick(ELEVENLABS_SFX_MODELS, [
	"Eleven Text to Sound v2",
]);
