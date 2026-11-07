import pick from "lodash/pick";
import { ELEVENLABS_STT_MODELS } from "../elevenlabs/models";

export const OPENSLOP_STT_MODELS = pick(ELEVENLABS_STT_MODELS, ["Scribe v2"]);
