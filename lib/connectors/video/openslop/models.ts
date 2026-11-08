import pick from "lodash/pick";
import { RUNWARE_VIDEO_MODELS } from "../runware/models";

export const OPENSLOP_VIDEO_MODELS = pick(RUNWARE_VIDEO_MODELS, [
	"Kling 3 Omni",
	"Seedance 2 Fast",
]);
