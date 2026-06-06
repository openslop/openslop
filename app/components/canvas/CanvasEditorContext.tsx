"use client";

import { createContext, use, useMemo, type ReactNode } from "react";
import type { Descendant, Editor } from "slate";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useScriptInitial } from "@/lib/script/ScriptProvider";
import { getContentElements } from "@/lib/canvas/scenes";
import { getLayoutKey } from "@/lib/video/layoutKey";
import { useTransitionType } from "@/lib/video/useTransitionType";
import { useEditorSetup } from "./hooks/useEditorSetup";
import { useAutosave } from "./hooks/useAutosave";
import { useGenerateAll } from "./hooks/useGenerateAll";
import { useMetadataSync } from "./hooks/useMetadataSync";
import { useProjectRehydrate } from "./hooks/useProjectRehydrate";
import { useScriptSync } from "./hooks/useScriptSync";

type CanvasEditorContextValue = {
	editor: Editor;
	value: Descendant[];
	setValue: (v: Descendant[]) => void;
	layoutKey: string;
	generateAll: () => void;
};

const CanvasEditorContext = createContext<CanvasEditorContextValue | null>(
	null,
);

export function CanvasEditorProvider({ children }: { children: ReactNode }) {
	const { editor, value, setValue } = useEditorSetup();
	const { projectId } = useConfig();
	const initialScript = useScriptInitial();

	useProjectRehydrate(editor, initialScript);
	useAutosave(projectId, value);
	useScriptSync(editor);
	useMetadataSync();
	const { generateAll } = useGenerateAll(editor);

	const transitionType = useTransitionType();
	const layoutKey = useMemo(
		() => getLayoutKey(getContentElements(value), transitionType),
		[value, transitionType],
	);

	const ctxValue = useMemo(
		() => ({ editor, value, setValue, layoutKey, generateAll }),
		[editor, value, setValue, layoutKey, generateAll],
	);

	return <CanvasEditorContext value={ctxValue}>{children}</CanvasEditorContext>;
}

export function useCanvasEditor() {
	const ctx = use(CanvasEditorContext);
	if (!ctx) {
		throw new Error(
			"useCanvasEditor must be used inside <CanvasEditorProvider>",
		);
	}
	return ctx;
}
