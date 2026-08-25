"use client";

import { Fragment, useMemo, useState } from "react";
import { ReactEditor, useSlateStatic } from "slate-react";
import { ConfirmDeleteDialog } from "@/components/ui/confirm-delete-dialog";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { insertScene } from "@/lib/canvas/insertScene";
import { useConfig } from "@/lib/config/ConfigProvider";
import { toFrames } from "@/lib/video/frames";
import { usePlayerControl } from "../PlayerControlContext";
import { useLayout } from "../VideoLayoutContext";
import { SceneInsertHandle } from "./SceneInsertHandle";
import {
	buildStoryboardScenes,
	type StoryboardScene as StoryboardSceneData,
} from "./storyboardScenes";
import { StoryboardScene } from "./StoryboardScene";

export function Storyboard() {
	const editor = useSlateStatic();
	const { layout, segments, scenes } = useLayout();
	const { player } = usePlayerControl();
	const { connectorConfig } = useConfig();
	const setActiveSceneId = useSetActiveSceneId();
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
		insertScene(editor, at, connectorConfig);
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
						onSelect={() => {
							setActiveSceneId(item.scene.id);
							scrollToScene(item.scene.id);
							if (item.start === null) return;
							player?.seekTo(toFrames(item.start, layout.fps));
						}}
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
