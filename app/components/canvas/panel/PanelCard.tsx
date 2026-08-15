import type { ReactNode } from "react";

/** A side-panel subsection. Untitled cards carry the same surface with no heading. */
export function PanelCard({
	title,
	children,
}: {
	title?: string;
	children: ReactNode;
}) {
	return (
		<section className="grain relative shrink-0 overflow-hidden rounded-xl bg-element-card shadow-elevation-1">
			<div className="relative z-10 flex flex-col gap-3 p-3 text-panel-fg">
				{title && (
					<h3 className="text-label font-semibold tracking-wider text-panel-label uppercase">
						{title}
					</h3>
				)}
				{children}
			</div>
		</section>
	);
}

/** A labeled control row inside a `PanelCard` */
export function PanelField({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="shrink-0 text-label font-medium text-panel-label">
				{label}
			</span>
			{children}
		</div>
	);
}
