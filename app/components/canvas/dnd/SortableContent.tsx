import { useCallback, useMemo, useState } from "react";
import { Path } from "slate";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import type {
	CanvasContentElement,
	CanvasElementType,
} from "@/lib/canvas/types";
import { parentSceneId } from "@/lib/canvas/scenes";
import { ELEMENT_LIST } from "@/lib/canvas/elementConfigs";
import { insertElement } from "@/lib/canvas/insertElement";
import { useViewMode } from "../ViewModeContext";
import { CompactElement } from "../elements/CompactElement";
import { ElementContainer } from "../elements/ElementContainer";
import { SortableItem } from "./SortableItem";
import { useDragTransfer } from "./DragTransferContext";
import { InsertMenu, type InsertOption } from "./SortableActions";

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
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const editor = useSlateStatic();
	const { connectorConfig } = useConfig();
	const transfer = useDragTransfer();
	const { isCollapsed } = useViewMode();

	const path = ReactEditor.findPath(editor, element);
	const sceneId = parentSceneId(editor, path);
	const collapsed = isCollapsed(sceneId);
	const Content = collapsed ? CompactElement : ElementContainer;

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
			insertMenu={
				<InsertMenu
					options={INSERT_OPTIONS}
					onInsert={handleInsert}
					onOpenChange={setIsMenuOpen}
				/>
			}
			menuOpen={isMenuOpen}
			disabled={collapsed}
			readOnly={collapsed}
			attributes={attributes}
			element={element}
		>
			<Content attributes={attributes} element={element}>
				{children}
			</Content>
		</SortableItem>
	);
}
