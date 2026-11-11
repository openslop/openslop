"use client";

import range from "lodash/range";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { ThumbnailGrid } from "@/components/ui/thumbnail";
import { cn } from "@/lib/utils";

const COLUMNS = 2;

/** One row of tiles a page, with arrows and a dot per page once they overflow one. */
export function PagedTiles({
	label,
	empty,
	children,
}: {
	label: string;
	empty: ReactNode;
	children: ReactNode[];
}) {
	const [requestedPage, setRequestedPage] = useState(0);

	if (children.length === 0) return empty;

	const pageCount = Math.ceil(children.length / COLUMNS);
	const page = Math.min(requestedPage, pageCount - 1);

	return (
		<div className="flex flex-col gap-3">
			<ThumbnailGrid columns={COLUMNS}>
				{children.slice(page * COLUMNS, (page + 1) * COLUMNS)}
			</ThumbnailGrid>
			{pageCount > 1 && (
				<nav
					aria-label={`${label} pages`}
					className="flex items-center justify-between"
				>
					<IconButton
						ariaLabel="Previous page"
						variant="quiet"
						disabled={page === 0}
						onClick={() => setRequestedPage(page - 1)}
					>
						<ChevronLeft />
					</IconButton>
					<div className="flex items-center">
						{range(pageCount).map((index) => (
							<button
								key={index}
								type="button"
								aria-label={`Page ${index + 1}`}
								aria-current={index === page ? "page" : undefined}
								onClick={() => setRequestedPage(index)}
								className="group/dot focus-ring flex size-6 items-center justify-center rounded-full"
							>
								<span
									className={cn(
										"block size-1.5 rounded-full transition-colors",
										index === page
											? "bg-foreground"
											: "bg-muted-foreground/40 group-hover/dot:bg-muted-foreground",
									)}
								/>
							</button>
						))}
					</div>
					<IconButton
						ariaLabel="Next page"
						variant="quiet"
						disabled={page === pageCount - 1}
						onClick={() => setRequestedPage(page + 1)}
					>
						<ChevronRight />
					</IconButton>
				</nav>
			)}
		</div>
	);
}
