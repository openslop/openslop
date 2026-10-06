"use client";

import { Node } from "slate";
import type { RenderElementProps } from "slate-react";
import type { TitleElement } from "@/lib/canvas/types";

export function TitleBlock({
	attributes,
	children,
	element,
}: Omit<RenderElementProps, "element"> & { element: TitleElement }) {
	return (
		<h1
			{...attributes}
			className="relative mb-3 min-h-lh font-body text-heading font-semibold text-foreground"
		>
			{Node.string(element) === "" && (
				<span
					contentEditable={false}
					className="pointer-events-none absolute inset-x-0 top-0 text-muted-foreground select-none"
				>
					Untitled
				</span>
			)}
			{children}
		</h1>
	);
}
