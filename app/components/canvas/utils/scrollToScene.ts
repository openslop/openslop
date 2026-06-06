export function scrollToScene(sceneId: string) {
	const node = document.querySelector(
		`[data-scene-id="${CSS.escape(sceneId)}"]`,
	);
	node?.scrollIntoView({ behavior: "smooth", block: "center" });
}
