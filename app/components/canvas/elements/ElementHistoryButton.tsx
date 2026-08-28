"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { applyElementVersion } from "../utils/nodeOps";
import { ElementHistoryPopover } from "./ElementHistoryPopover";

export function ElementHistoryButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	const restore = useCallback(
		(version: ElementVersion) => applyElementVersion(editor, element, version),
		[editor, element],
	);

	return <ElementHistoryPopover elementId={element.id} onRestore={restore} />;
}
