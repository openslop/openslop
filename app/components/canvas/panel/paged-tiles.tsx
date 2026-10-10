"use client";

import range from "lodash/range";
import { useState, type ReactNode } from "react";
import { ChevronLeft, ChevronRight } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 4;

/** Tiles four to a page, with arrows and a dot per page once they overflow one. */
export function PagedTiles({
	label,
	empty,
	children,
}: {
	label: string;
	empty: string;
	children: ReactNode[];
}) {
	const [requested, setPage] = useState(0);

	if (children.length === 0)
		return <p className="text-label text-muted-foreground">{empty}</p>;

	const pageCount = Math.ceil(children.length / PAGE_SIZE);
	const page = Math.min(requested, pageCount - 1);

	return (
		<div className="flex flex-col gap-3">
			<div className="grid grid-cols-4 gap-2">
				{children.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)}
			</div>
			{pageCount > 1 && (
				<nav
					aria-label={`${label} pages`}
					className="flex items-center justify-between"
				>
					<IconButton
						ariaLabel="Previous page"
						size="header"
						variant="quiet"
						disabled={page === 0}
						onClick={() => setPage(page - 1)}
					>
						<ChevronLeft size={14} />
					</IconButton>
					<div className="flex items-center">
						{range(pageCount).map((index) => (
							<button
								key={index}
								type="button"
								aria-label={`Page ${index + 1}`}
								aria-current={index === page ? "page" : undefined}
								onClick={() => setPage(index)}
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
						size="header"
						variant="quiet"
						disabled={page === pageCount - 1}
						onClick={() => setPage(page + 1)}
					>
						<ChevronRight size={14} />
					</IconButton>
				</nav>
			)}
		</div>
	);
}
