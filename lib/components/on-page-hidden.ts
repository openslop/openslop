export function onPageHidden(listener: () => void): () => void {
	const onVisibilityChange = () => {
		if (document.visibilityState === "hidden") listener();
	};
	document.addEventListener("visibilitychange", onVisibilityChange);
	window.addEventListener("pagehide", listener);
	return () => {
		document.removeEventListener("visibilitychange", onVisibilityChange);
		window.removeEventListener("pagehide", listener);
	};
}
