import type { ComponentProps } from "react";
import type { PointerDragProps } from "@/lib/components/use-pointer-drag";
import type { TrimEdge } from "@/lib/render/clip-trim";
import { cn } from "@/lib/utils";

type HandleProps = PointerDragProps &
	Pick<ComponentProps<"div">, "onDoubleClick">;

const EDGES = {
	start: { side: "left-0 after:left-0", cursor: "cursor-trim-start" },
	end: { side: "right-0 after:right-0", cursor: "cursor-trim-end" },
} as const satisfies Record<TrimEdge, { side: string; cursor: string }>;

function TrimHandle({
	edge,
	handleProps,
}: {
	edge: TrimEdge;
	handleProps?: HandleProps;
}) {
	const { side, cursor } = EDGES[edge];
	return (
		<div
			aria-hidden="true"
			className={cn(
				"pointer-events-auto absolute inset-y-0 w-1.5 touch-none after:absolute after:inset-y-0 after:w-1",
				side,
				handleProps
					? [cursor, "hover:after:bg-foreground/25"]
					: "cursor-not-allowed",
			)}
			{...handleProps}
		/>
	);
}

/** Pointer only, and clipped to the clip's frame: keyboard users reset the trim from the clip's button. */
export function TimelineTrimHandles({
	handleProps,
}: {
	handleProps: Record<TrimEdge, HandleProps> | null;
}) {
	return (
		<div className="pointer-events-none absolute inset-0 z-10 overflow-hidden rounded-md">
			<TrimHandle edge="start" handleProps={handleProps?.start} />
			<TrimHandle edge="end" handleProps={handleProps?.end} />
		</div>
	);
}
