import type { ReactNode } from "react";
import { InfoTip } from "@/components/ui/info-tip";

export function PanelCard({
	title,
	action,
	children,
}: {
	title?: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="grain relative shrink-0 overflow-hidden rounded-xl border border-border bg-element-card shadow-elevation-3 dark:border-transparent dark:shadow-elevation-1">
			<div className="relative z-10 flex flex-col gap-3 p-3 text-panel-fg">
				{title && (
					<div className="flex items-center justify-between gap-2 text-panel-label">
						<h3 className="text-label font-semibold tracking-wider uppercase">
							{title}
						</h3>
						{action}
					</div>
				)}
				{children}
			</div>
		</section>
	);
}

export function PanelField({
	label,
	info,
	children,
}: {
	label: string;
	info?: string;
	children: ReactNode;
}) {
	return (
		<div className="flex items-center justify-between gap-3">
			<span className="flex shrink-0 items-center gap-1 text-label font-medium text-panel-label">
				{label}
				{info && <InfoTip label={info} />}
			</span>
			{children}
		</div>
	);
}

/** A title, and the action beside it, over a control too wide to sit beside it; all of it in the label color. */
export function PanelSection({
	title,
	action,
	children,
}: {
	title: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2 text-panel-label">
			<div className="flex items-center justify-between gap-2">
				<span className="text-label font-medium">{title}</span>
				<div className="flex items-center gap-1">{action}</div>
			</div>
			{children}
		</div>
	);
}
