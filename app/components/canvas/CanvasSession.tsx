"use client";

import { useState } from "react";
import type { Descendant, Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import Canvas from "./Canvas";
import { useAutosave } from "./hooks/useAutosave";

const initialValue: Descendant[] = [];

/**
 * Owns the document snapshot the canvas renders from, and the autosave that
 * follows it. Holding it here rather than in the editor view keeps a keystroke
 * inside the canvas: the toolbar, sidebar, player and transport bar all render
 * off the layout key, which text edits never change.
 */
export function CanvasSession({ editor }: { editor: Editor }) {
	const { projectId } = useConfig();
	const [value, setValue] = useState<Descendant[]>(initialValue);

	useAutosave(projectId, value);

	return <Canvas editor={editor} value={value} setValue={setValue} />;
}
