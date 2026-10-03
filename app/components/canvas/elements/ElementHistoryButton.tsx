"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import { applyNodeVersion } from "@/lib/canvas/editorOps";
import type { ScriptElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { ElementHistoryPopover } from "./ElementHistoryPopover";

export function ElementHistoryButton({ element }: { element: ScriptElement }) {
	const editor = useSlateStatic();
	const restore = useCallback(
		(version: ElementVersion) => applyNodeVersion(editor, element.id, version),
		[editor, element.id],
	);

	return <ElementHistoryPopover elementId={element.id} onRestore={restore} />;
}
