import { Children, useMemo } from "react";
import { RenderElementProps } from "slate-react";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { Scene } from "@/lib/canvas/types";
import { useSceneSequence } from "@/app/components/player/render-layout-context";
import { isForeground } from "@/lib/canvas/guards";
import { useDropIndex } from "../dnd/drag-transfer-context";
import { useSceneCollapsed, useViewMode } from "../view-mode-context";
import { CollapsibleHeader } from "./collapsible-header";

import { ForegroundPreview } from "./foreground-preview";
import { PlayFromHereButton } from "./play-from-here-button";
import { SceneDeleteButton } from "./scene-delete-button";
import { SceneGenerateButton } from "./scene-generate-button";
import { SceneTimestamp } from "./scene-timestamp";

const COLLAPSED_MAX_VISIBLE = 3;

const SCENE_FRAME_CLASS =
	"pr-3 py-2 transition-[box-shadow,background-color] duration-200";
interface SceneProps {
	attributes: RenderElementProps["attributes"];
	scene: Scene;
	/** 1-based position in the document, resolved by whoever mounts the scene. */
	sceneIndex: number;
	children: React.ReactNode;
}

/** Opens a gap at the end of the scene while a cross-scene drag would land there. */
function useDropPadding(scene: Scene): React.CSSProperties {
	const dropIndex = useDropIndex(scene.id);
	return {
		paddingBottom:
			dropIndex !== null && dropIndex >= scene.children.length
				? "3rem"
				: undefined,
		transition: "padding-bottom 200ms ease",
	};
}

function SceneHeader({
	sceneIndex,
	collapsed,
	onToggle,
	scene,
}: {
	sceneIndex: number;
	collapsed: boolean;
	onToggle: () => void;
	scene: Scene;
}) {
	const seq = useSceneSequence(scene);
	const label = (
		<>
			Scene {sceneIndex}
			{seq && <SceneTimestamp start={seq.start} duration={seq.duration} />}
		</>
	);
	return (
		<CollapsibleHeader
			label={label}
			collapsed={collapsed}
			onToggle={onToggle}
			ariaLabel={collapsed ? "Expand scene" : "Collapse scene"}
			rightSlot={
				<div className="flex items-center gap-1">
					<SceneGenerateButton scene={scene} />
					<PlayFromHereButton scene={scene} />
					<SceneDeleteButton scene={scene} />
				</div>
			}
		/>
	);
}

function CollapsedScene({
	attributes,
	scene,
	sceneIndex,
	children,
}: SceneProps) {
	const dropPadding = useDropPadding(scene);
	const { toggle } = useViewMode();

	const foregroundElement = useMemo(
		() => scene.children.find(isForeground) ?? null,
		[scene.children],
	);

	const childArray = Children.toArray(children);
	const overflowCount = Math.max(0, childArray.length - COLLAPSED_MAX_VISIBLE);

	return (
		<div
			{...attributes}
			data-scene-id={scene.id}
			className={`group/collapsible relative h-32 ${SCENE_FRAME_CLASS}`}
			style={dropPadding}
		>
			<div className="relative z-[1] flex flex-col h-full">
				{/* Pull the header back over the drag-handle gutter so it lines up
				    with the expanded header instead of shifting right. */}
				<div className="-ml-[34px]">
					<SceneHeader
						sceneIndex={sceneIndex}
						collapsed
						onToggle={() => toggle(scene.id)}
						scene={scene}
					/>
				</div>
				<div className="flex flex-col gap-0.5 flex-1 min-h-0 overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none">
					{childArray.slice(0, COLLAPSED_MAX_VISIBLE)}
					{overflowCount > 0 && (
						<div className="hidden">
							{childArray.slice(COLLAPSED_MAX_VISIBLE)}
						</div>
					)}
				</div>
				{overflowCount > 0 && (
					<span
						className="text-badge text-muted-foreground pl-1 select-none shrink-0 text-left"
						contentEditable={false}
					>
						+{overflowCount} more
					</span>
				)}
			</div>
			{foregroundElement && (
				<div
					className="absolute right-0 top-0 bottom-0 w-32 select-none"
					contentEditable={false}
				>
					<ForegroundPreview element={foregroundElement} />
				</div>
			)}
		</div>
	);
}

function ExpandedScene({
	attributes,
	scene,
	sceneIndex,
	children,
}: SceneProps) {
	const dropPadding = useDropPadding(scene);
	const { toggle } = useViewMode();
	const childIds = useMemo(
		() => scene.children.map((child) => child.id),
		[scene.children],
	);

	return (
		<div
			{...attributes}
			data-scene-id={scene.id}
			className={`group/collapsible ${SCENE_FRAME_CLASS}`}
			style={dropPadding}
		>
			<div className="relative z-[1]">
				<SceneHeader
					sceneIndex={sceneIndex}
					collapsed={false}
					onToggle={() => toggle(scene.id)}
					scene={scene}
				/>
				<SortableContext
					items={childIds}
					strategy={verticalListSortingStrategy}
				>
					{children}
				</SortableContext>
			</div>
		</div>
	);
}

export function SceneContainer(props: SceneProps) {
	return useSceneCollapsed(props.scene.id) ? (
		<CollapsedScene {...props} />
	) : (
		<ExpandedScene {...props} />
	);
}
