"use client";

import Link from "next/link";
import { memo } from "react";
import {
	Home,
	Layout,
	type IconComponent,
	SlidersAlt,
	SlidersAltFill,
	Robot,
	RobotFill,
	TextBox,
	TextBoxFill,
} from "@/components/ui/icon";
import partition from "lodash/partition";
import { cn } from "@/lib/utils";
import { SloppyComposer } from "@/app/components/sloppy/SloppyComposer";
import { SloppyPanel } from "@/app/components/sloppy/SloppyPanel";
import { useEditorPanel, type PanelKey } from "./EditorPanelContext";
import { CaptionsPanel } from "./CaptionsPanel";
import { LayoutPanel } from "./LayoutPanel";
import { PropertiesPanel } from "./PropertiesPanel";

type PanelEntry = {
	label: string;
	icon: IconComponent;
	iconActive: IconComponent;
	Panel: () => React.ReactNode;
	pinned?: boolean;
	Footer?: () => React.ReactNode;
};

const PANELS: Record<PanelKey, PanelEntry> = {
	layout: {
		label: "Layout",
		icon: Layout,
		iconActive: Layout,
		Panel: LayoutPanel,
	},
	captions: {
		label: "Captions",
		icon: TextBox,
		iconActive: TextBoxFill,
		Panel: CaptionsPanel,
	},
	properties: {
		label: "Properties",
		icon: SlidersAlt,
		iconActive: SlidersAltFill,
		Panel: PropertiesPanel,
	},
	sloppy: {
		label: "Sloppy",
		icon: Robot,
		iconActive: RobotFill,
		Panel: SloppyPanel,
		pinned: true,
		Footer: SloppyComposer,
	},
};

const [PINNED_KEYS, RAIL_KEYS] = partition(
	Object.keys(PANELS) as PanelKey[],
	(key) => PANELS[key].pinned,
);

function RailItem({
	icon: Icon,
	label,
	selected = false,
	href,
	onClick,
}: {
	icon: IconComponent;
	label: string;
	selected?: boolean;
	href?: string;
	onClick?: () => void;
}) {
	const className = cn(
		"flex w-full flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-center text-label-xs font-medium transition-colors",
		selected
			? "bg-secondary font-semibold text-panel-label"
			: "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
	);
	const body = (
		<>
			<Icon className="h-4 w-4" />
			<span className="hidden leading-tight lg:block">{label}</span>
		</>
	);
	return href ? (
		<Link href={href} className={className} aria-label={label}>
			{body}
		</Link>
	) : (
		<button
			type="button"
			onClick={onClick}
			className={className}
			aria-label={label}
		>
			{body}
		</button>
	);
}

function PanelRailItem({ panelKey }: { panelKey: PanelKey }) {
	const { active, setActive } = useEditorPanel();
	const { label, icon, iconActive } = PANELS[panelKey];
	const selected = active === panelKey;
	return (
		<RailItem
			icon={selected ? iconActive : icon}
			label={label}
			selected={selected}
			onClick={() => setActive(selected ? null : panelKey)}
		/>
	);
}

function EditorSidebarComponent() {
	const { active } = useEditorPanel();
	const current = active ? PANELS[active] : null;
	const HeaderIcon = current?.iconActive;
	const Panel = current?.Panel;

	return (
		<div className="flex shrink-0">
			<nav
				aria-label="Panels"
				className="flex w-14 shrink-0 flex-col items-center gap-1 pt-16 mr-2 pl-1 lg:w-[72px] lg:pt-4"
			>
				<RailItem icon={Home} label="Home" href="/" />
				<div className="my-1 h-px w-full bg-border" />
				{RAIL_KEYS.map((key) => (
					<PanelRailItem key={key} panelKey={key} />
				))}

				<div className="mt-auto flex w-full flex-col items-center gap-1 pb-3">
					<div className="my-1 h-px w-full bg-border" />
					{PINNED_KEYS.map((key) => (
						<PanelRailItem key={key} panelKey={key} />
					))}
				</div>
			</nav>

			{current && HeaderIcon && Panel && (
				<div className="flex w-64 shrink-0 flex-col gap-3 pr-1 pt-4 pb-3 text-panel-fg">
					<div className="flex shrink-0 items-center gap-2 px-1">
						<HeaderIcon className="h-5 w-5 text-panel-label" />
						<h2 className="text-body font-semibold text-panel-label">
							{current.label}
						</h2>
					</div>
					<div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto overscroll-contain pr-1 [scrollbar-gutter:stable]">
						<Panel />
					</div>
					{current.Footer && (
						// The scroll area's own inset plus the 6px scrollbar globals.css
						// reserves, so the footer lines up with the cards above it.
						<div className="pr-2.5">
							<current.Footer />
						</div>
					)}
				</div>
			)}
		</div>
	);
}

export const EditorSidebar = memo(EditorSidebarComponent);
