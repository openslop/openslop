import { Mic, MicOff } from "@/components/ui/icon";
import { TOGGLE_OFF } from "@/lib/canvas/types";
import { type AttributeDef, AttributeSchema } from "../attributes/schema";
import {
	loopsDef,
	OWN_MODEL_DEFS,
	toggleValue,
	trimEndDef,
	trimStartDef,
	volumeDef,
} from "../attributes/common";

const lyricsDef: AttributeDef = {
	key: "lyrics",
	label: "Lyrics",
	edit: {
		kind: "toggle",
		value: toggleValue,
		off: { icon: MicOff, label: "Instrumental" },
		on: { icon: Mic, label: "With lyrics" },
	},
	default: TOGGLE_OFF,
};

export const MUSIC_ATTRIBUTES = AttributeSchema.from([
	...OWN_MODEL_DEFS,
	lyricsDef,
	loopsDef,
	volumeDef("2"),
	trimStartDef,
	trimEndDef,
]);
