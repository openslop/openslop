import pick from "lodash/pick";
import { CARTESIA_TTS_MODELS } from "../cartesia/models";

export const OPENSLOP_TTS_MODELS = pick(CARTESIA_TTS_MODELS, ["Sonic 3.6"]);
