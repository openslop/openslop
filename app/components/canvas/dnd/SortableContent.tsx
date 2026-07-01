import { useCallback, useMemo } from "react";
import { Node, Path } from "slate";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import type {
	CanvasContentElement,
	CanvasElementType,
	SceneElement,
} from "@/lib/canvas/types";
import { ELEMENT_LIST } from "@/lib/canvas/elementConfigs";
import { insertElement } from "@/lib/canvas/insertElement";
import { useViewMode } from "../ViewModeContext";
import { SortableItem } from "./SortableItem";
import { useDragTransfer } from "./DragTransferContext";
import type { InsertOption } from "./SortableActions";

const INSERT_OPTIONS: InsertOption<CanvasElementType>[] = ELEMENT_LIST.map(
	(c) => ({
		key: c.type,
		label: c.label,
		icon: c.icon,
		iconBgClass: c.iconBgClass,
		colorClass: c.colorClass,
	}),
);

export function SortableContent({
	attributes,
	element,
	children,
}: {
	attributes: RenderElementProps["attributes"];
	element: CanvasContentElement;
	children: React.ReactNode;
}) {
	const editor = useSlateStatic();
	const { connectorConfig } = useConfig();
	const transfer = useDragTransfer();
	const { isCollapsed } = useViewMode();

	const path = ReactEditor.findPath(editor, element);
	const sceneId = (Node.parent(editor, path) as SceneElement).id;
	const collapsed = isCollapsed(sceneId);

	const insertGap =
		sceneId === transfer?.toSceneId &&
		sceneId !== transfer?.fromSceneId &&
		path[path.length - 1] === transfer?.atIndex;

	const wrapperStyle = useMemo(
		() => ({
			marginTop: insertGap ? "3rem" : undefined,
			transition: "margin-top 200ms ease",
		}),
		[insertGap],
	);

	const handleInsert = useCallback(
		(type: CanvasElementType) => {
			const p = ReactEditor.findPath(editor, element);
			insertElement(editor, type, Path.next(p), connectorConfig);
		},
		[connectorConfig, editor, element],
	);

	return (
		<SortableItem
			sceneId={sceneId}
			sortableType="content"
			wrapperStyle={wrapperStyle}
			insertOptions={collapsed ? undefined : INSERT_OPTIONS}
			onInsert={collapsed ? undefined : handleInsert}
			disabled={collapsed}
			attributes={attributes}
			element={element}
		>
			{children}
		</SortableItem>
	);
}
