import { Fragment, type ComponentType, type ReactNode } from "react";
import { Separator } from "@/components/ui/separator";
import {
	PINNED_PANEL_KEYS,
	RAIL_PANEL_GROUPS,
	type PanelKey,
} from "./panel-keys";

export function Rail({
	home,
	Item,
}: {
	home: ReactNode;
	Item: ComponentType<{ panelKey: PanelKey }>;
}) {
	return (
		<nav
			aria-label="Panels"
			className="mr-2 flex w-14 shrink-0 flex-col items-center gap-1 pt-4 pl-1 lg:w-[72px]"
		>
			{home}
			<div
				data-slot="rail-body"
				className="flex min-h-0 w-full flex-1 flex-col items-center gap-1 overflow-y-auto"
			>
				{RAIL_PANEL_GROUPS.map((group) => (
					<Fragment key={group.join()}>
						<Separator className="my-1" />
						{group.map((key) => (
							<Item key={key} panelKey={key} />
						))}
					</Fragment>
				))}
			</div>
			<div
				data-slot="rail-foot"
				className="flex w-full shrink-0 flex-col items-center gap-1 pb-3"
			>
				<Separator className="my-1" />
				{PINNED_PANEL_KEYS.map((key) => (
					<Item key={key} panelKey={key} />
				))}
			</div>
		</nav>
	);
}
