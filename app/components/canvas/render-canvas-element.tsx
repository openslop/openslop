import type { ComponentType, ReactNode } from "react";
import type { RenderElementProps } from "slate-react";
import { isAssetElement, isCharacterRef } from "@/lib/canvas/guards";
import { isScene } from "@/lib/canvas/scenes";
import type { ContentElement, Scene } from "@/lib/canvas/types";
import { CharacterRef } from "./elements/character-ref";
import { ELEMENT_CONFIGS } from "./elements/element-configs";
import { ElementErrorBoundary } from "./elements/element-error-boundary";

type BlockProps = {
	attributes: RenderElementProps["attributes"];
	children: ReactNode;
};

type Blocks = {
	Scene: ComponentType<BlockProps & { scene: Scene }>;
	Content: ComponentType<BlockProps & { element: ContentElement }>;
};

/** Renders any canvas node, leaving how a scene or an element is framed to the caller. */
export function renderCanvasElement({ Scene, Content }: Blocks) {
	return function renderElement({
		attributes,
		children,
		element,
	}: RenderElementProps) {
		if (isCharacterRef(element))
			return (
				<CharacterRef attributes={attributes} element={element}>
					{children}
				</CharacterRef>
			);
		if (isAssetElement(element))
			return (
				<div {...attributes} hidden>
					{children}
				</div>
			);
		if (isScene(element))
			return (
				<Scene attributes={attributes} scene={element}>
					{children}
				</Scene>
			);
		return (
			<ElementErrorBoundary
				label={ELEMENT_CONFIGS[element.type].label}
				attributes={attributes}
				leaves={children}
			>
				<Content attributes={attributes} element={element}>
					{children}
				</Content>
			</ElementErrorBoundary>
		);
	};
}
