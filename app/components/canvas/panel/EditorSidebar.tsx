"use client";

import Link from "next/link";
import { useState } from "react";
import {
	Home,
	Layout,
	type LucideIcon,
	SlidersAlt,
	SlidersAltFill,
} from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { LayoutPanel } from "./LayoutPanel";
import { PropertiesPanel } from "./PropertiesPanel";

type PanelKey = "layout" | "properties";

const PANELS: Record<
	PanelKey,
	{
		label: string;
		icon: LucideIcon;
		iconActive: LucideIcon;
		Panel: () => React.ReactNode;
	}
> = {
	layout: {
		label: "Layout",
		icon: Layout,
		iconActive: Layout,
		Panel: LayoutPanel,
	},
	properties: {
		label: "Properties",
		icon: SlidersAlt,
		iconActive: SlidersAltFill,
		Panel: PropertiesPanel,
	},
};

function RailItem({
	icon: Icon,
	label,
	selected = false,
	href,
	onClick,
}: {
	icon: LucideIcon;
	label: string;
	selected?: boolean;
	href?: string;
	onClick?: () => void;
}) {
	const className = cn(
		"flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center text-[11px] font-medium transition-colors",
		selected
			? "bg-secondary font-semibold text-panel-label"
			: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
	);
	const body = (
		<>
			<Icon className="h-5 w-5" />
			<span className="leading-tight">{label}</span>
		</>
	);
	return href ? (
		<Link href={href} className={className} aria-label={label}>
			{body}
		</Link>
	) : (
		<button type="button" onClick={onClick} className={className}>
			{body}
		</button>
	);
}

export function EditorSidebar() {
	const [active, setActive] = useState<PanelKey | null>(null);
	const toggle = (key: PanelKey) =>
		setActive((prev) => (prev === key ? null : key));

	const current = active ? PANELS[active] : null;
	const HeaderIcon = current?.iconActive;
	const Panel = current?.Panel;

	return (
		<div className="flex shrink-0">
			<nav className="flex w-[72px] shrink-0 flex-col items-center gap-1 pt-4 pr-0.5 pl-1">
				<RailItem icon={Home} label="Home" href="/" />
				<div className="my-1.5 h-px w-8 bg-border" />
				{(Object.keys(PANELS) as PanelKey[]).map((key) => {
					const { label, icon, iconActive } = PANELS[key];
					const selected = active === key;
					return (
						<RailItem
							key={key}
							icon={selected ? iconActive : icon}
							label={label}
							selected={selected}
							onClick={() => toggle(key)}
						/>
					);
				})}
			</nav>

			{current && HeaderIcon && Panel && (
				<div className="flex w-60 shrink-0 flex-col gap-3 overflow-y-auto px-2 pt-4 pb-3 text-panel-fg">
					<div className="flex items-center gap-2 px-1">
						<HeaderIcon className="h-5 w-5 text-panel-label" />
						<h2 className="text-sm font-semibold text-panel-label">
							{current.label}
						</h2>
					</div>
					<Panel />
				</div>
			)}
		</div>
	);
}
