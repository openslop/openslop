import { Children, useMemo } from "react";
import { RenderElementProps } from "slate-react";
import {
	SortableContext,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { SceneElement } from "@/lib/canvas/types";
import { useLayout } from "@/app/components/video/VideoLayoutContext";
import { isForeground } from "../utils/guards";
import { useDragTransfer } from "../dnd/DragTransferContext";
import { useSceneIndex } from "../hooks/useSceneIndex";
import { useViewMode } from "../ViewModeContext";
import { CollapsibleHeader } from "./CollapsibleHeader";
import { DeleteButton } from "./DeleteButton";
import { ForegroundPreview } from "./ForegroundPreview";
import { SceneTimestamp } from "./SceneTimestamp";

const COLLAPSED_MAX_VISIBLE = 3;

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
	const foreground = element.children.find(isForeground);
	const seq = foreground && layout?.sequenceByElementId.get(foreground.id);
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
			rightSlot={<DeleteButton element={element} />}
		/>
	);
}

function CollapsedScene({ attributes, element, children }: SceneProps) {
	const { sceneIndex, dropPadding } = useSceneState(element);
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
			className="group/collapsible relative h-32"
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
	const { childIds, sceneIndex, dropPadding } = useSceneState(element);
	const { toggle } = useViewMode();

	return (
		<div {...attributes} className="group/collapsible" style={dropPadding}>
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
