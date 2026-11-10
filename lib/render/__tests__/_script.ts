import type { Descendant } from "slate";
import type { ContentElement, ContentType } from "@/lib/canvas/types";
import { splitAttributes } from "@/lib/canvas/element-attributes";

let nextId = 0;

export const element = (
	type: ContentType,
	text: string,
	attributes: Record<string, string> = {},
): ContentElement => {
	const id = `e${nextId++}`;
	return {
		id,
		type,
		...splitAttributes(attributes),
		children: [{ id: `${id}-t`, text }],
	};
};

export const scene = (...children: ContentElement[]): Descendant => ({
	id: `s${nextId++}`,
	type: "scene",
	children,
});

export const words = (count: number) => Array(count).fill("word").join(" ");
