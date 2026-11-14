import type { ReactNode } from "react";
import { ThumbnailGrid } from "@/components/ui/thumbnail";

/** An attribute's tiles: a grid when the surface sets columns, else a wrapping row. */
export function TileRow({
	columns,
	children,
}: {
	columns?: 2;
	children: ReactNode;
}) {
	return columns ? (
		<ThumbnailGrid columns={columns}>{children}</ThumbnailGrid>
	) : (
		<div className="flex flex-wrap gap-2">{children}</div>
	);
}
