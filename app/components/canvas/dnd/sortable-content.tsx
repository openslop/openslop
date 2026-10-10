import { useCallback, useMemo, useState } from "react";
import { Path } from "slate";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import type { ContentElement, ContentType } from "@/lib/canvas/types";
import { parentSceneId } from "@/lib/canvas/scenes";
import { ELEMENT_LIST } from "../elements/element-configs";
import { insertElement } from "@/lib/canvas/insert-element";
import { useSceneCollapsed } from "../view-mode-context";
import { CompactElement } from "../elements/compact-element";
import { ElementContainer } from "../elements/element-container";
import { SortableItem } from "./sortable-item";
import { useDropIndex } from "./drag-transfer-context";
import { InsertMenu, type InsertOption } from "./sortable-actions";

const INSERT_OPTIONS: InsertOption<ContentType>[] = ELEMENT_LIST.map(
	({ type, label, Icon, iconBgClass, colorClass }) => ({
		key: type,
		label,
		icon: <Icon size={16} />,
		iconBgClass,
		colorClass,
	}),
);

export function SortableContent({
	attributes,
	element,
	children,
}: {
	attributes: RenderElementProps["attributes"];
	element: ContentElement;
	children: React.ReactNode;
}) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const editor = useSlateStatic();

	const path = ReactEditor.findPath(editor, element);
	const sceneId = parentSceneId(editor, path);
	const collapsed = useSceneCollapsed(sceneId);
	const Content = collapsed ? CompactElement : ElementContainer;

	const insertGap = useDropIndex(sceneId) === path[path.length - 1];

	const wrapperStyle = useMemo(
		() => ({
			marginTop: insertGap ? "3rem" : undefined,
			transition: "margin-top 200ms ease",
		}),
		[insertGap],
	);

	const handleInsert = useCallback(
		(type: ContentType) => {
			const elementPath = ReactEditor.findPath(editor, element);
			insertElement(editor, type, Path.next(elementPath));
		},
		[editor, element],
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
			block={element}
		>
			<Content attributes={attributes} element={element}>
				{children}
			</Content>
		</SortableItem>
	);
}
