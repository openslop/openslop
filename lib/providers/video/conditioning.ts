import type { IRequestVideo } from "@runware/sdk-js";
import pickBy from "lodash/pickBy";
import type { Character } from "@/lib/connectors/types";
import type { MediaResolution } from "@/lib/project/aspect-ratio";

export type Sources = {
	prompt: string;
	startFrame?: string;
	characters: Character[];
	references: string[];
	continuityFrames: string[];
	size: { width: number; height: number };
	resolution?: MediaResolution;
};

export type Conditioning = Pick<
	IRequestVideo,
	"positivePrompt" | "inputs" | "width" | "height"
> & {
	resolution?: MediaResolution;
	providerSettings?: Record<string, Record<string, unknown>>;
};

export type Conditioner = (
	sources: Sources,
) => Conditioning | Promise<Conditioning>;

type InputLists = Partial<
	Record<
		"frameImages" | "referenceImages" | "referenceAudios" | "elements",
		unknown[]
	>
>;

export const inputsOf = (lists: InputLists): Pick<Conditioning, "inputs"> => {
	const inputs = pickBy(lists, (items) => items.length > 0);
	return Object.keys(inputs).length > 0 ? { inputs } : {};
};
