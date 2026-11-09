import type { ComponentProps, ReactNode } from "react";
import { Plus } from "@/components/ui/icon";
import { TooltipIconButton } from "@/components/ui/icon-button";
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
					<div className="flex items-center justify-between gap-2">
						<h3 className="text-label font-semibold tracking-wider text-panel-label uppercase">
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

/** A label over a control too wide to sit beside it. */
export function PanelSection({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<div className="flex flex-col gap-2">
			<span className="text-label font-medium text-panel-label">{label}</span>
			{children}
		</div>
	);
}

/** The card header's add button; also a menu's trigger. */
export function PanelCardAddButton(
	props: Omit<ComponentProps<typeof TooltipIconButton>, "children">,
) {
	return (
		<TooltipIconButton variant="quiet" {...props}>
			<Plus />
		</TooltipIconButton>
	);
}
