import type { GeneratedElement } from "@/lib/canvas/types";

/** The attribute of an element an editor sets. */
export type AttributeTarget = {
	element: GeneratedElement;
	attrKey: string;
	label: string;
};

/** In a surface with `columns`, its tiles fill a grid; otherwise they wrap in a row. */
export type LaidOutTarget = AttributeTarget & { columns?: 2 };
