/**
 * The "+" grid behind the editor and the gallery. `viewport` pins it to the
 * screen for pages that do not scroll; `container` paints it over the full
 * height of a scrolling ancestor, whose content then needs its own `z-10`.
 */
const PLACEMENT = {
	viewport: "fixed inset-0 -z-10",
	container: "absolute inset-0 z-0",
} as const;

function DotGrid({
	placement = "viewport",
}: {
	placement?: keyof typeof PLACEMENT;
}) {
	return (
		<div
			aria-hidden
			className={`dot-grid-bg pointer-events-none ${PLACEMENT[placement]}`}
		/>
	);
}

export { DotGrid };
