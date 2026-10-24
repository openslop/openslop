import { scrollIntoContainer } from "@/lib/components/scroll-into-container";

const scrollTo = (attribute: string, id: string) => {
	const node = document.querySelector(`[${attribute}="${CSS.escape(id)}"]`);
	if (node) scrollIntoContainer(node, "center");
};

export const scrollToScene = (sceneId: string) =>
	scrollTo("data-scene-id", sceneId);

export const scrollToElement = (elementId: string) =>
	scrollTo("data-element-id", elementId);
