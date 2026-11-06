import type { ComponentProps } from "react";
import type { PointerDragProps } from "@/lib/components/use-pointer-drag";
import type { TrimEdge } from "@/lib/render/clip-trim";
import { cn } from "@/lib/utils";

const EDGES = {
	start: { side: "left-0", cursor: "cursor-trim-start" },
	end: { side: "right-0", cursor: "cursor-trim-end" },
} as const satisfies Record<TrimEdge, { side: string; cursor: string }>;

/** Pointer only: keyboard users reset the trim from the clip's button. */
export function TimelineTrimHandle({
	edge,
	handleProps,
}: {
	edge: TrimEdge;
	handleProps?: PointerDragProps & Pick<ComponentProps<"div">, "onDoubleClick">;
}) {
	const { side, cursor } = EDGES[edge];
	return (
		<div
			aria-hidden="true"
			className={cn(
				"absolute inset-y-0 z-10 w-1.5 touch-none rounded-md",
				side,
				handleProps ? [cursor, "hover:bg-foreground/25"] : "cursor-not-allowed",
			)}
			{...handleProps}
		/>
	);
}
