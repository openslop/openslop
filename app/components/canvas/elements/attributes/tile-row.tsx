import type { ReactNode } from "react";
import { ThumbnailGrid } from "@/components/ui/thumbnail";

/** An attribute's tiles: a grid when the surface sets columns, else a wrapping row; `radiogroup` names it as one. */
export function TileRow({
	columns,
	radiogroup,
	children,
}: {
	columns?: 2;
	radiogroup?: string;
	children: ReactNode;
}) {
	const group = radiogroup && {
		role: "radiogroup",
		"aria-label": radiogroup,
	};
	return columns ? (
		<ThumbnailGrid columns={columns} {...group}>
			{children}
		</ThumbnailGrid>
	) : (
		<div className="flex flex-wrap gap-2" {...group}>
			{children}
		</div>
	);
}
