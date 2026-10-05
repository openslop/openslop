import type { ReactNode } from "react";

export function ProjectTitle({
	empty,
	children,
}: {
	empty: boolean;
	children?: ReactNode;
}) {
	return (
		<h1 className="relative mb-3 min-h-lh font-body text-heading font-semibold text-foreground">
			{empty && (
				<span
					contentEditable={false}
					className="pointer-events-none absolute inset-x-0 top-0 text-muted-foreground select-none"
				>
					Untitled
				</span>
			)}
			{children}
		</h1>
	);
}
