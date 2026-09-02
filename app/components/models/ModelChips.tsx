import {
	Coin1,
	Coin2,
	Coin3,
	Minutes1,
	Minutes2,
	Minutes3,
	type IconComponent,
} from "@/components/ui/icon";
import type { ModelMeta, Tier } from "@/lib/connectors/types";
import { cn } from "@/lib/utils";
import { IconChip } from "./IconChip";

type Metric = {
	key: keyof ModelMeta;
	icon: Record<Tier, IconComponent>;
	phrase: Record<Tier, string>;
};

const METRICS: Metric[] = [
	{
		key: "cost",
		icon: { low: Coin1, medium: Coin2, high: Coin3 },
		phrase: { low: "Cheap", medium: "Moderate", high: "Expensive" },
	},
	{
		key: "speed",
		icon: { low: Minutes3, medium: Minutes2, high: Minutes1 },
		phrase: { low: "Slow", medium: "Balanced", high: "Fast" },
	},
];

export function ModelChips({
	meta,
	className,
}: {
	meta: ModelMeta;
	className?: string;
}) {
	return (
		<span className={cn("flex flex-wrap items-center gap-1", className)}>
			{METRICS.map(({ key, icon, phrase }) => {
				const tier = meta[key];
				return <IconChip key={key} icon={icon[tier]} label={phrase[tier]} />;
			})}
		</span>
	);
}
