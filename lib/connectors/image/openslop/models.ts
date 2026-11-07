import pick from "lodash/pick";
import { RUNWARE_IMAGE_MODELS } from "../runware/models";

export const OPENSLOP_IMAGE_MODELS = pick(RUNWARE_IMAGE_MODELS, [
	"Muse Image",
	"Seedream 5 Lite",
	"Grok Imagine 2.0",
]);
