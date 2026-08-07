import { Children, useMemo } from "react";
import { RenderElementProps } from "slate-react";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SceneElement } from "@/lib/canvas/types";
import { useSceneSequence } from "@/app/components/video/VideoLayoutContext";
import { isForeground } from "@/lib/canvas/guards";
import { useDragTransfer } from "../dnd/DragTransferContext";
import { useViewMode } from "../ViewModeContext";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { DeleteButton } from "./DeleteButton";
import { ForegroundPreview } from "./ForegroundPreview";
import { PlayFromHereButton } from "./PlayFromHereButton";
import { SceneTimestamp } from "./SceneTimestamp";

const COLLAPSED_MAX_VISIBLE = 3;

const SCENE_FRAME_CLASS =
	"pr-3 py-2 transition-[box-shadow,background-color] duration-200";
interface SceneProps {
	attributes: RenderElementProps["attributes"];
	element: SceneElement;
	/** 1-based position in the document, resolved by whoever mounts the scene. */
	sceneIndex: number;
	children: React.ReactNode;
}

function useSceneState(element: SceneElement) {
	const childIds = useMemo(
		() => element.children.map((c) => c.id),
		[element.children],
	);

	const transfer = useDragTransfer();
	const isDropTarget =
		transfer &&
		element.id === transfer.toSceneId &&
		element.id !== transfer.fromSceneId;

	return {
		childIds,
		dropPadding: {
			paddingBottom:
				isDropTarget && transfer.atIndex >= childIds.length
					? "3rem"
					: undefined,
			transition: "padding-bottom 200ms ease",
		} as React.CSSProperties,
	};
}

function SceneHeader({
	sceneIndex,
	collapsed,
	onToggle,
	element,
}: {
	sceneIndex: number;
	collapsed: boolean;
	onToggle: () => void;
	element: SceneElement;
}) {
	const seq = useSceneSequence(element);
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
					<PlayFromHereButton scene={element} />
					<DeleteButton element={element} />
				</div>
			}
		/>
	);
}

function CollapsedScene({
	attributes,
	element,
	sceneIndex,
	children,
}: SceneProps) {
	const { dropPadding } = useSceneState(element);
	const { toggle } = useViewMode();

	const foregroundElement = useMemo(
		() => element.children.find(isForeground) ?? null,
		[element.children],
	);

	const childArray = Children.toArray(children);
	const overflowCount = Math.max(0, childArray.length - COLLAPSED_MAX_VISIBLE);

	return (
		<div
			{...attributes}
			data-scene-id={element.id}
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
						onToggle={() => toggle(element.id)}
						element={element}
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
	element,
	sceneIndex,
	children,
}: SceneProps) {
	const { childIds, dropPadding } = useSceneState(element);
	const { toggle } = useViewMode();

	return (
		<div
			{...attributes}
			data-scene-id={element.id}
			className={`group/collapsible ${SCENE_FRAME_CLASS}`}
			style={dropPadding}
		>
			<div className="relative z-[1]">
				<SceneHeader
					sceneIndex={sceneIndex}
					collapsed={false}
					onToggle={() => toggle(element.id)}
					element={element}
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
	const { isCollapsed } = useViewMode();
	return isCollapsed(props.element.id) ? (
		<CollapsedScene {...props} />
	) : (
		<ExpandedScene {...props} />
	);
}
