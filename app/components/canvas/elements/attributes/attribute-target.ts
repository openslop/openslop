import type { ComponentType, ReactNode } from "react";
import type { GeneratedElement } from "@/lib/canvas/types";

/** The attribute of an element an editor sets. */
export type AttributeTarget = {
	element: GeneratedElement;
	attrKey: string;
	label: string;
};

/** How a surface titles an editor, with the action that adds to it. */
export type EditorSection = ComponentType<{
	title: string;
	action: ReactNode;
	children: ReactNode;
}>;

/** In a surface with `columns`, its tiles fill a grid; otherwise they wrap in a row. */
export type LaidOutTarget = AttributeTarget & {
	columns?: 2;
	Section: EditorSection;
};
