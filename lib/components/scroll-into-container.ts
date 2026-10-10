export type ScrollBlock = "center" | "end";

type Extent = { top: number; height: number };

export function scrollTopFor(
	container: Extent,
	node: Extent,
	scrollTop: number,
	block: ScrollBlock,
): number {
	const slack =
		(container.height - node.height) * (block === "center" ? 0.5 : 1);
	return Math.max(0, node.top - container.top + scrollTop - slack);
}

function scrollableAncestor(node: Element): Element | null {
	for (let el = node.parentElement; el; el = el.parentElement) {
		const { overflowY } = getComputedStyle(el);
		if (overflowY === "auto" || overflowY === "scroll") return el;
	}
	return null;
}

/**
 * `scrollIntoView` aligns every scroll-container ancestor, including
 * `overflow: hidden` ones the user has no way to scroll back.
 */
export function scrollIntoContainer(
	node: Element,
	block: ScrollBlock,
	behavior: ScrollBehavior = "smooth",
) {
	const container = scrollableAncestor(node);
	const target = container ?? document.scrollingElement;
	if (!target) return;

	const extent = container
		? container.getBoundingClientRect()
		: { top: 0, height: window.innerHeight };
	const top = scrollTopFor(
		extent,
		node.getBoundingClientRect(),
		target.scrollTop,
		block,
	);
	target.scrollTo({ top, behavior });
}
