import { JSX } from "react";
import { RenderElementProps, ReactEditor, useSlateStatic } from "slate-react";
import { Node } from "slate";
import type { CanvasContentElement, SceneElement } from "../types";
import { isSceneElement } from "../utils/guards";
import { getElementCharacterNames } from "../utils/characters";
import { ZERO_WIDTH_SPACE } from "../config/constants";
import { ELEMENT_CONFIGS } from "../config/elementConfigs";
import { useViewMode } from "../ViewModeContext";
import { OutputPreview } from "./OutputPreview";
import { DeleteButton } from "./DeleteButton";
import { CompactElement } from "./CompactElement";
import { SceneContainer } from "./SceneContainer";
import { CharacterPill } from "./CharacterBadge";
import { AttributeBadge } from "./AttributeBadge";
import { ModelBadge } from "./ModelBadge";

interface ElementContainerProps {
	attributes: RenderElementProps["attributes"];
	element: CanvasContentElement;
	children: React.ReactNode;
}

export function ElementContainer({
	attributes,
	children,
	element,
}: ElementContainerProps) {
	const config = ELEMENT_CONFIGS[element.type];
	const isEmpty = Node.string(element) === ZERO_WIDTH_SPACE;

	return (
		<div className="flex items-stretch mb-1.5 animate-fadeInUp" {...attributes}>
			{/* Left: element card */}
			<div
				className={`group/card grain rounded-lg ${config.bgColor} p-2 shadow-md relative overflow-hidden flex-1 min-w-0`}
			>
				<div
					className="absolute top-1.5 right-1.5 z-20 opacity-0 pointer-events-none group-hover/card:opacity-100 group-hover/card:pointer-events-auto transition-opacity duration-200"
					contentEditable={false}
				>
					<DeleteButton element={element} />
				</div>
				<div className="relative z-10 min-w-0">
					<div
						className="flex items-center gap-1.5 mb-1 flex-wrap select-none"
						contentEditable={false}
					>
						<div className="flex items-center gap-1 text-white font-medium">
							{config.icon}
							<span className="text-xs">{config.label}</span>
						</div>
						{getElementCharacterNames(element).map((name) => (
							<CharacterPill key={`char:${name}`} name={name} />
						))}
						{Object.entries(config.visibleAttributes).map(([key, spec]) => (
							<AttributeBadge
								key={key}
								element={element}
								attrKey={key}
								spec={spec}
							/>
						))}
						<ModelBadge element={element} />
					</div>
					<div className="relative min-w-0">
						{isEmpty && (
							<div
								style={{ userSelect: "none" }}
								className="absolute top-0 left-0 text-white/50 text-xs text-left pointer-events-none"
							>
								{config.placeholder}
							</div>
						)}
						<div className="text-white/90 text-xs leading-relaxed overflow-hidden transition-[max-height,opacity] duration-200 text-left">
							{children}
						</div>
					</div>
				</div>
			</div>

			{/* Center divider */}
			<div
				className="relative flex-shrink-0 w-px self-stretch mx-3 sm:mx-4 select-none"
				contentEditable={false}
				aria-hidden="true"
			>
				<div
					className="absolute inset-0 w-px"
					style={{
						background: "rgba(255,255,255,0.15)",
						boxShadow:
							"0 0 6px 1px rgba(255,255,255,0.05), 0 0 16px 2px rgba(167,139,250,0.03)",
					}}
				/>
			</div>

			{/* Right: preview */}
			<div
				className="flex-1 min-w-0 flex items-center select-none"
				contentEditable={false}
			>
				<OutputPreview element={element} />
			</div>
		</div>
	);
}

function ContentElement(
	props: RenderElementProps & { element: CanvasContentElement },
) {
	const editor = useSlateStatic();
	const { isCollapsed, hasCollapsed } = useViewMode();

	if (hasCollapsed) {
		const path = ReactEditor.findPath(editor, props.element);
		const sceneId = (Node.parent(editor, path) as SceneElement).id;
		if (isCollapsed(sceneId)) {
			return (
				<CompactElement attributes={props.attributes} element={props.element}>
					{props.children}
				</CompactElement>
			);
		}
	}
	return <ElementContainer {...props} element={props.element} />;
}

export const renderCanvasElement = (props: RenderElementProps): JSX.Element => {
	if (isSceneElement(props.element)) {
		return (
			<SceneContainer attributes={props.attributes} element={props.element}>
				{props.children}
			</SceneContainer>
		);
	}
	return <ContentElement {...props} element={props.element} />;
};
