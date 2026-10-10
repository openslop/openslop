import { scrollIntoContainer } from "@/lib/components/scroll-into-container";

export function scrollToScene(sceneId: string) {
	const node = document.querySelector(
		`[data-scene-id="${CSS.escape(sceneId)}"]`,
	);
	if (node) scrollIntoContainer(node, "center");
}
