"use client";

import { Fragment, useMemo } from "react";
import type { Editor } from "slate";
import { ReactEditor } from "slate-react";
import { useSetActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { removeElement } from "@/app/components/canvas/utils/nodeOps";
import { scrollToScene } from "@/app/components/canvas/utils/scrollToScene";
import { insertScene } from "@/lib/canvas/insertScene";
import { useConfig } from "@/lib/config/ConfigProvider";
import { toFrames } from "@/lib/video/frames";
import { usePlayerControl } from "../PlayerControlContext";
import { useLayout } from "../VideoLayoutContext";
import { SceneInsertHandle } from "./SceneInsertHandle";
import { buildStoryboardScenes } from "./storyboardScenes";
import { StoryboardScene } from "./StoryboardScene";

/**
 * Read-only strip of the project's scenes in order, sharing the seek bar's
 * segments so a thumbnail seeks to exactly the frame its scene starts on.
 */
export function Storyboard({ editor }: { editor: Editor }) {
	const { layout, segments, scenes } = useLayout();
	const { player } = usePlayerControl();
	const { connectorConfig } = useConfig();
	const setActiveSceneId = useSetActiveSceneId();

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
			className="flex shrink-0 items-start overflow-x-auto border-t border-border px-3 py-4"
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
						onDelete={() => removeElement(editor, item.scene)}
					/>
				</Fragment>
			))}
			<SceneInsertHandle onInsert={() => addSceneBefore(items.length)} />
		</section>
	);
}
