"use client";

import { useState, type ReactNode } from "react";
import { Editor, Transforms } from "slate";
import { ReactEditor, useSlateStatic } from "slate-react";
import { ZERO_WIDTH_SPACE } from "@/lib/canvas/constants";
import { getElementText } from "@/lib/canvas/osml-serializer";
import { resultIdentity } from "@/lib/connectors/asset-url";
import type { ContentElement } from "@/lib/canvas/types";
import { Lock } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { ELEMENT_CONFIGS } from "./element-configs";
import { useElementGeneration } from "./element-generation-context";

const LOOKS = {
	card: "bg-element-input",
	panel: "bg-input",
} as const;

/** The box an element's prompt is typed in, with its placeholder while empty; `panel` matches the side panel's fields. */
export function ElementInput({
	element,
	look = "card",
	dir,
	upload,
	children,
}: {
	element: ContentElement;
	look?: keyof typeof LOOKS;
	dir?: string;
	/** Identifies the uploaded result whose prompt stays locked until unlocked. */
	upload?: string;
	children: ReactNode;
}) {
	const editor = useSlateStatic();
	const [unlockedFor, setUnlockedFor] = useState<string>();
	const locked = upload !== undefined && upload !== unlockedFor;
	const unlock = () => {
		setUnlockedFor(upload);
		Transforms.select(
			editor,
			Editor.end(editor, ReactEditor.findPath(editor, element)),
		);
		ReactEditor.focus(editor);
	};

	return (
		<div
			dir={dir}
			className={cn(
				"relative min-w-0 rounded-xl border border-transparent px-3 py-2.5 transition-colors hover:border-element-input-border-hover focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/30",
				LOOKS[look],
			)}
		>
			{getElementText(element) === ZERO_WIDTH_SPACE && (
				<div className="pointer-events-none absolute top-2.5 start-3 text-start text-label text-muted-foreground select-none">
					{ELEMENT_CONFIGS[element.type].placeholder}
				</div>
			)}
			<div
				contentEditable={locked ? false : undefined}
				aria-readonly={locked || undefined}
				className={cn(
					"overflow-hidden text-start text-label leading-relaxed transition-[max-height,opacity] duration-200",
					locked ? "text-muted-foreground opacity-40" : "text-foreground",
				)}
			>
				{children}
			</div>
			{locked && (
				<div
					contentEditable={false}
					className="absolute inset-0 flex items-center justify-center select-none"
				>
					<SimpleTooltip label="Unlock the prompt to regenerate over the upload">
						<Button variant="secondary" size="xs" onClick={unlock}>
							<Lock className="size-3" />
							Unlock
						</Button>
					</SimpleTooltip>
				</div>
			)}
		</div>
	);
}

export function ElementPrompt({
	element,
	dir,
	children,
}: {
	element: ContentElement;
	dir?: string;
	children: ReactNode;
}) {
	const { uploaded, result } = useElementGeneration();
	const upload = uploaded && result ? resultIdentity(result) : undefined;
	return (
		<ElementInput element={element} dir={dir} upload={upload}>
			{children}
		</ElementInput>
	);
}
