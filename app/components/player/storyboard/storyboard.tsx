"use client";

import { Fragment, useMemo, useState } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { Plus } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { removeBlock } from "@/lib/canvas/editor-ops";
import { insertScene } from "@/lib/canvas/insert-scene";
import { useLayout } from "../render-layout-context";
import { useSelectScene } from "../use-select-scene";
import { buildStoryboardItems, type StoryboardItem } from "./storyboard-scenes";
import { StoryboardScene } from "./storyboard-scene";

function SceneInsertHandle({ onInsert }: { onInsert: () => void }) {
	return (
		<SimpleTooltip label="Add scene">
			<button
				type="button"
				aria-label="Add scene"
				onClick={onInsert}
				className="group/insert relative z-10 -mx-2 flex h-16 w-6 shrink-0 items-center justify-center rounded-xs focus-ring"
			>
				<span className="relative flex h-8 w-2 items-center justify-center rounded-xs bg-generate text-generate-foreground transition-[width,background-color,border-radius] duration-200 ease-out group-hover/insert:w-8 group-hover/insert:rounded-md group-hover/insert:bg-generate-hover group-focus-visible/insert:w-8 group-focus-visible/insert:rounded-md group-focus-visible/insert:bg-generate-hover motion-reduce:transition-none">
					<span className="absolute h-3 w-px bg-generate-foreground/60 transition-opacity duration-200 group-hover/insert:opacity-0 group-focus-visible/insert:opacity-0 motion-reduce:transition-none" />
					<Plus
						size={16}
						className="opacity-0 transition-opacity duration-200 group-hover/insert:opacity-100 group-focus-visible/insert:opacity-100 motion-reduce:transition-none"
					/>
				</span>
			</button>
		</SimpleTooltip>
	);
}

export function Storyboard() {
	const editor = useSlateStatic();
	const { layout, segments, scenes } = useLayout();
	const selectScene = useSelectScene();
	const [deleting, setDeleting] = useState<StoryboardItem>();

	const items = useMemo(
		() => buildStoryboardItems(scenes, segments),
		[scenes, segments],
	);

	const aspectRatio = `${layout.width} / ${layout.height}`;

	const addSceneBefore = (index: number) => {
		const anchor = items[index]?.scene;
		const at = anchor
			? ReactEditor.findPath(editor, anchor)
			: [editor.children.length];
		insertScene(editor, at);
	};

	return (
		<section
			aria-label="Storyboard"
			className="scrollbar-overlay flex shrink-0 items-start overflow-x-auto border-t border-border px-3 py-4"
		>
			{items.map((item, index) => (
				<Fragment key={item.scene.id}>
					<SceneInsertHandle onInsert={() => addSceneBefore(index)} />
					<StoryboardScene
						item={item}
						aspectRatio={aspectRatio}
						onSelect={() => selectScene(item.scene.id, item.start)}
						onRequestDelete={() => setDeleting(item)}
					/>
				</Fragment>
			))}
			<SceneInsertHandle onInsert={() => addSceneBefore(items.length)} />
			<ConfirmDeleteDialog
				target={deleting}
				onClose={() => setDeleting(undefined)}
				title={(item) => `Delete scene ${item.sceneIndex}?`}
				description="This removes the scene and everything in it. Undo from the canvas to bring it back."
				actionLabel="Delete scene"
				onConfirm={(item) => removeBlock(editor, item.scene.id)}
			/>
		</section>
	);
}
