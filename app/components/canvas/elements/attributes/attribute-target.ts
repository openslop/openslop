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

/** An attribute editor, titled by the surface it sits on. */
export type LaidOutTarget = AttributeTarget & { Section: EditorSection };
