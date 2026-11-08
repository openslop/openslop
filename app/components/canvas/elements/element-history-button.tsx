"use client";

import { useSlateStatic } from "slate-react";
import { applyElementVersion } from "@/lib/canvas/editor-ops";
import type { CanvasElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { ElementHistoryPopover } from "./element-history-popover";

export function ElementHistoryButton({ element }: { element: CanvasElement }) {
	const editor = useSlateStatic();
	const restore = (version: ElementVersion) =>
		applyElementVersion(editor, element.id, version);

	return <ElementHistoryPopover elementId={element.id} onRestore={restore} />;
}
