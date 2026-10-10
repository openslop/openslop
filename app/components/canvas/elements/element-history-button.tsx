"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { applyElementVersion } from "@/lib/canvas/editor-ops";
import type { CanvasElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { ElementHistoryPopover } from "./element-history-popover";

export function ElementHistoryButton({ element }: { element: CanvasElement }) {
	const editor = useSlateStatic();
	const restore = useCallback(
		(version: ElementVersion) =>
			applyElementVersion(editor, element.id, version),
		[editor, element.id],
	);

	return <ElementHistoryPopover elementId={element.id} onRestore={restore} />;
}
