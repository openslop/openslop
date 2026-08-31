"use client";

import { Fragment, useMemo, useState } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import { insertScene } from "@/lib/canvas/insertScene";
import { useProject } from "@/lib/project/useProject";
import { useLayout } from "../VideoLayoutContext";
import { useSelectScene } from "../useSelectScene";
import { SceneInsertHandle } from "./SceneInsertHandle";
import {
	buildStoryboardScenes,
	type StoryboardScene as StoryboardSceneData,
} from "./storyboardScenes";
import { StoryboardScene } from "./StoryboardScene";

export function Storyboard() {
	const editor = useSlateStatic();
	const { layout, segments, scenes } = useLayout();
	const selectScene = useSelectScene();
	const projectModels = useProject((s) => s.metadata.connectorModels);
	const [deleting, setDeleting] = useState<StoryboardSceneData | null>(null);

	const items = useMemo(
		() => buildStoryboardScenes(scenes, segments),
		[scenes, segments],
	);

	const aspectRatio = `${layout.width} / ${layout.height}`;

	const addSceneBefore = (index: number) => {
		const anchor = items[index]?.scene;
		const at = anchor
			? ReactEditor.findPath(editor, anchor)
			: [editor.children.length];
		insertScene(editor, at, projectModels);
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
				open={deleting !== null}
				onOpenChange={(open) => {
					if (!open) setDeleting(null);
				}}
				title={`Delete scene ${deleting?.sceneIndex}?`}
				description="This removes the scene and everything in it. Undo from the canvas to bring it back."
				actionLabel="Delete scene"
				onConfirm={() => {
					if (deleting) removeElement(editor, deleting.scene);
					setDeleting(null);
				}}
			/>
		</section>
	);
}
