"use client";

import { useCallback } from "react";
import { useSlateStatic } from "slate-react";
import type { CanvasContentElement } from "@/lib/canvas/types";
import type { ElementVersion } from "@/lib/generation/versions";
import { applyNodeInputs } from "../utils/nodeOps";
import { VersionHistoryPopover } from "./VersionHistoryPopover";

export function ElementHistoryButton({
	element,
}: {
	element: CanvasContentElement;
}) {
	const editor = useSlateStatic();
	const restoreInputs = useCallback(
		(version: ElementVersion) =>
			applyNodeInputs(editor, element, version.inputs),
		[editor, element],
	);

	return (
		<VersionHistoryPopover elementId={element.id} onRestore={restoreInputs} />
	);
}
