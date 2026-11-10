"use client";

import { useState, type KeyboardEvent } from "react";
import { createEditor, Editor, type Descendant } from "slate";
import { HistoryEditor, withHistory } from "slate-history";
import { Slate, useSlateStatic, type RenderElementProps } from "slate-react";
import { getAssets } from "@/lib/canvas/assets";
import { createCanvasElement } from "@/lib/canvas/create-canvas-element";
import { updateElementText } from "@/lib/canvas/editor-ops";
import { getElementBodyText } from "@/lib/canvas/osml-serializer";
import { getContentElements } from "@/lib/canvas/scenes";
import {
	draftedType,
	isPlaygroundType,
	type AssetElement,
	type ContentElement,
	type PlaygroundType,
} from "@/lib/canvas/types";
import { useAvatarNames } from "@/lib/canvas/use-assets";
import { useWriteThrough } from "../hooks/use-write-through";
import { ElementInput } from "../elements/element-input";
import { MentionEditable } from "../elements/mention-editable";
import { withCanvas } from "../plugins/with-canvas";
import {
	CANVAS_TEXT_CLASS,
	renderCanvasElement,
} from "../render-canvas-element";

type Draft = AssetElement<PlaygroundType>;

const renderElement = renderCanvasElement({
	Scene: ({ attributes, children }) => <div {...attributes}>{children}</div>,
	Content: ({
		attributes,
		element,
		children,
	}: {
		attributes: RenderElementProps["attributes"];
		element: ContentElement;
		children: React.ReactNode;
	}) => (
		<div {...attributes}>
			<ElementInput element={element} look="panel">
				{children}
			</ElementInput>
		</div>
	),
});

/** The draft's prompt as the canvas would type it, beside the assets its chips resolve against. */
function scratchValue(canvas: Descendant[], draft: Draft): Descendant[] {
	const assets = getAssets(canvas).filter(
		(asset) => !isPlaygroundType(asset.type),
	);
	const prompt = createCanvasElement(draftedType(draft.type), {
		text: getElementBodyText(draft),
	});
	return structuredClone([...assets, prompt]);
}

function useScratchEditor(draft: Draft, onWrite: (text: string) => void) {
	const canvas = useSlateStatic();
	const [scratch] = useState(() => {
		const editor = withCanvas(withHistory(createEditor()));
		editor.defaultModels = canvas.defaultModels;
		editor.children = scratchValue(canvas.children, draft);
		Editor.normalize(editor, { force: true });
		return editor;
	});
	const onValueChange = () => {
		const [prompt] = getContentElements(scratch.children);
		onWrite(prompt ? getElementBodyText(prompt) : "");
	};
	return { scratch, onValueChange };
}

/** Enter starts a new line: the prompt is one element, never split in two. */
function PromptEditable() {
	const editor = useSlateStatic();
	const onKeyDown = (event: KeyboardEvent) => {
		if (event.key !== "Enter") return;
		event.preventDefault();
		editor.insertSoftBreak();
	};
	return (
		<MentionEditable
			renderElement={renderElement}
			onKeyDown={onKeyDown}
			aria-label="Prompt"
			className={`${CANVAS_TEXT_CLASS} outline-none`}
		/>
	);
}

function ScratchPrompt({
	draft,
	onWrite,
}: {
	draft: Draft;
	onWrite: (text: string) => void;
}) {
	const { scratch, onValueChange } = useScratchEditor(draft, onWrite);
	return (
		<Slate
			editor={scratch}
			initialValue={scratch.children}
			onValueChange={onValueChange}
		>
			<PromptEditable />
		</Slate>
	);
}

/** Typed like an element's prompt on the canvas, `@` mentions and all; a new character, or a prompt set from outside, rebuilds it. */
export function DraftPrompt({ draft }: { draft: Draft }) {
	const canvas = useSlateStatic();
	const names = useAvatarNames();
	const [, write, replaced] = useWriteThrough(
		getElementBodyText(draft),
		(text) =>
			// The prompt box keeps its own undo; the canvas's would rewrite the draft behind it.
			HistoryEditor.withoutSaving(canvas, () =>
				updateElementText(canvas, draft.id, text),
			),
	);
	return (
		<ScratchPrompt
			key={`${draft.id}:${names.join("|")}:${replaced}`}
			draft={draft}
			onWrite={write}
		/>
	);
}
