import type { PointerDragProps } from "@/lib/components/use-pointer-drag";
import type { TrimEdge } from "@/lib/render/clip-trim";
import { cn } from "@/lib/utils";

const EDGES = {
	start: { side: "left-0", cursor: "cursor-trim-start" },
	end: { side: "right-0", cursor: "cursor-trim-end" },
} as const satisfies Record<TrimEdge, { side: string; cursor: string }>;

/** Pointer only: keyboard users trim from the element's settings. */
export function TimelineTrimHandle({
	edge,
	dragProps,
}: {
	edge: TrimEdge;
	dragProps?: PointerDragProps;
}) {
	const { side, cursor } = EDGES[edge];
	return (
		<div
			aria-hidden="true"
			className={cn(
				"absolute inset-y-0 z-10 w-1.5 touch-none rounded-md",
				side,
				dragProps ? [cursor, "hover:bg-foreground/25"] : "cursor-not-allowed",
			)}
			{...dragProps}
		/>
	);
}
