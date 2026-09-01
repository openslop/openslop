import type { ReactNode } from "react";

/** A labelled group of settings, with the action that acts on the group. */
export function SettingsSection({
	title,
	action,
	children,
}: {
	title: string;
	action?: ReactNode;
	children: ReactNode;
}) {
	return (
		<section className="flex flex-col gap-3">
			<div className="flex items-center justify-between gap-3">
				<h4 className="text-label font-semibold text-muted-foreground">
					{title}
				</h4>
				{action}
			</div>
			{children}
		</section>
	);
}

/** Rows that belong together: fenced as one block, and ruled between. */
export function SettingsList({ children }: { children: ReactNode }) {
	return (
		<div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
			{children}
		</div>
	);
}

export function SettingsRow({
	label,
	children,
}: {
	label: ReactNode;
	children: ReactNode;
}) {
	return (
		<div className="flex min-h-11 items-center justify-between gap-4 px-3 py-2">
			<div className="flex min-w-0 items-center gap-2 text-label font-book text-foreground">
				{label}
			</div>
			<div className="flex shrink-0 items-center gap-3">{children}</div>
		</div>
	);
}
