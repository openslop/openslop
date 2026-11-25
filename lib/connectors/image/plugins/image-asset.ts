import type { AssetKind } from "@/lib/canvas/assets";
import type { ConnectorPlugin } from "@/lib/connectors/types";

type ImageAssetParams = { prompt: string; name?: string };

type Framing = { lead: (name: string) => string; rules: string[] };

const FRAMINGS: Record<AssetKind, Framing> = {
	character: {
		lead: (name) =>
			`Character turnaround sheet of ${name}: a close-up of the face, plus full-body front, side and three-quarter views`,
		rules: [
			"Same look and outfit in every view",
			"Plain light gray background with nothing else on it",
			"No text",
		],
	},
	location: {
		lead: (name) => `Wide establishing shot of ${name}`,
		rules: ["Empty of people and animals", "No text"],
	},
	prop: {
		lead: (name) => `Product shot of ${name}`,
		rules: [
			"The whole object, alone and centered",
			"Plain light gray background with nothing else on it",
			"No text",
		],
	},
};

/** Frames a named asset's appearance, its prompt, as the image every visual naming it is drawn after. */
export function createImageAssetPlugin(
	kind: AssetKind,
): ConnectorPlugin<ImageAssetParams> {
	const { lead, rules } = FRAMINGS[kind];
	return {
		name: `${kind}-image`,
		beforeGenerate: ({ prompt, name, ...params }) => {
			if (!name) throw new Error(`A ${kind} image needs the ${kind}'s name`);
			return { ...params, prompt: [lead(name), prompt, ...rules].join(". ") };
		},
	};
}
