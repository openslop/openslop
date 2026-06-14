import { Children, useMemo } from "react";
import { RenderElementProps } from "slate-react";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SceneElement } from "@/lib/canvas/types";
import { useActiveSceneId } from "@/app/components/scene-selection/ActiveSceneContext";
import { findSceneSequence } from "@/app/components/video/useSceneSegments";
import { useLayout } from "@/app/components/video/VideoLayoutContext";
import { isForeground } from "@/lib/canvas/guards";
import { useDragTransfer } from "../dnd/DragTransferContext";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { useViewMode } from "../ViewModeContext";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { DeleteButton } from "./DeleteButton";
import { ForegroundPreview } from "./ForegroundPreview";
import { PlayFromHereButton } from "./PlayFromHereButton";
import { SceneTimestamp } from "./SceneTimestamp";

const COLLAPSED_MAX_VISIBLE = 3;

const ACTIVE_SCENE_CLASS =
	"ring-2 ring-violet-300 bg-violet-400/45 shadow-[0_0_0_6px_rgba(196,181,253,0.22),0_0_52px_-2px_rgba(196,181,253,0.7)]";
const SCENE_FRAME_CLASS =
	"rounded-lg transition-[box-shadow,background-color] duration-200";

interface SceneProps {
	attributes: RenderElementProps["attributes"];
	element: SceneElement;
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
		sceneIndex: useSceneIndex(element.id),
		isActive: useActiveSceneId() === element.id,
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
	const { layout } = useLayout();
	const seq = findSceneSequence(element, layout);
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

function CollapsedScene({ attributes, element, children }: SceneProps) {
	const { sceneIndex, isActive, dropPadding } = useSceneState(element);
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
			className={`group/collapsible relative h-32 ${SCENE_FRAME_CLASS}${isActive ? ` ${ACTIVE_SCENE_CLASS}` : ""}`}
			style={dropPadding}
		>
			<div className="flex flex-col h-full pr-[calc(8rem+0.75rem)]">
				<SceneHeader
					sceneIndex={sceneIndex}
					collapsed
					onToggle={() => toggle(element.id)}
					element={element}
				/>
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
						className="text-[10px] text-white/30 pl-1 select-none shrink-0 text-left"
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

function ExpandedScene({ attributes, element, children }: SceneProps) {
	const { childIds, sceneIndex, isActive, dropPadding } =
		useSceneState(element);
	const { toggle } = useViewMode();

	return (
		<div
			{...attributes}
			data-scene-id={element.id}
			className={`group/collapsible ${SCENE_FRAME_CLASS}${isActive ? ` ${ACTIVE_SCENE_CLASS}` : ""}`}
			style={dropPadding}
		>
			<SceneHeader
				sceneIndex={sceneIndex}
				collapsed={false}
				onToggle={() => toggle(element.id)}
				element={element}
			/>
			<SortableContext items={childIds} strategy={verticalListSortingStrategy}>
				{children}
			</SortableContext>
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
