"use client";

import type { IconComponent } from "@/components/ui/icon";
import { Link } from "@/components/ui/icon";
import type { SettingsTab } from "@/lib/settings/useSettings";
import { cn } from "@/lib/utils";

type NavItem = { tab: SettingsTab; label: string; icon: IconComponent };

const GROUPS: { heading: string; items: NavItem[] }[] = [
	{
		heading: "Account",
		items: [{ tab: "models", label: "Models", icon: Link }],
	},
];

export function SettingsNav({
	active,
	onSelect,
}: {
	active: SettingsTab;
	onSelect: (tab: SettingsTab) => void;
}) {
	return (
		<nav aria-label="Settings" className="flex w-44 shrink-0 flex-col gap-3">
			{GROUPS.map((group) => (
				<div key={group.heading} className="flex flex-col gap-1">
					<p className="px-2 py-1 text-label font-semibold text-foreground">
						{group.heading}
					</p>
					{group.items.map(({ tab, label, icon: Icon }) => (
						<button
							key={tab}
							type="button"
							aria-current={tab === active ? "page" : undefined}
							onClick={() => onSelect(tab)}
							className={cn(
								"focus-ring flex items-center gap-2 rounded-md px-2 py-1.5 text-left text-label transition-colors",
								tab === active
									? "bg-card font-medium text-foreground"
									: "text-muted-foreground hover:bg-card/60 hover:text-foreground",
							)}
						>
							<Icon className="size-3.5 shrink-0" />
							{label}
						</button>
					))}
				</div>
			))}
		</nav>
	);
}
