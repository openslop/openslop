import type { Metadata } from "@/lib/project/types";
import type { CanvasContentElement, CanvasElementType } from "../../types";
import type { AttributeContributor } from "../inputContributors";
import { compact } from "lodash";

const APPLIES_TO: CanvasElementType[] = ["image", "animated_image"];

function parseNames(raw: string | undefined = ""): string[] {
	return compact(
		raw
			.split(",")
			.map((s) => s.trim())
			.sort(),
	);
}

export const characterAvatarsContributor: AttributeContributor = {
	name: "characterAvatars",
	appliesTo: APPLIES_TO,
	derive: (element: CanvasContentElement, metadata: Metadata) => {
		const names = parseNames(element.customAttributes?.characters);
		if (names.length === 0) return {};
		const pairs = names.map((name) => metadata.characters[name]?.avatarUrl);
		return { characterAvatars: compact(pairs).join(",") };
	},
};
