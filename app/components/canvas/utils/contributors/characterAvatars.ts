import type { Metadata } from "@/lib/project/types";
import type { CanvasContentElement, CanvasElementType } from "../../types";
import type { AttributeContributor } from "../inputContributors";

const APPLIES_TO: CanvasElementType[] = ["image", "animated_image"];

function parseNames(raw: string | undefined): string[] {
	return (raw ?? "")
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);
}

export const characterAvatarsContributor: AttributeContributor = {
	name: "characterAvatars",
	appliesTo: APPLIES_TO,
	derive: (element: CanvasContentElement, metadata: Metadata) => {
		const names = parseNames(element.customAttributes?.characters);
		if (names.length === 0) return {};
		const pairs = names
			.map((name) => {
				const url = metadata.characters[name]?.avatarUrl;
				return url ? `${name}:${url}` : null;
			})
			.filter((p): p is string => p !== null)
			.sort();
		return { characterAvatars: pairs.join(",") || undefined };
	},
};
