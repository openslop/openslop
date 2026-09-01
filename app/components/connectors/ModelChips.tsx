import {
	Coin1,
	Coin2,
	Coin3,
	Minutes1,
	Minutes2,
	Minutes3,
	type IconComponent,
} from "@/components/ui/icon";
import {
	MODEL_META,
	type ModelMeta,
	type Tier,
} from "@/lib/connectors/modelMeta";
import { cn } from "@/lib/utils";
import { IconChip } from "./IconChip";

type Metric = {
	key: keyof ModelMeta;
	/** Both metrics count: coins for what it costs, minutes for what it takes. */
	icon: Record<Tier, IconComponent>;
	/** How the tier reads on its own, since the chip shows no other label. */
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

/**
 * How a model compares to its siblings. The icons carry the reading — a stack
 * of coins, a dial of minutes — so the words are only there on hover, and for
 * anyone who cannot see the difference.
 */
export function ModelChips({
	model,
	className,
}: {
	model: string;
	className?: string;
}) {
	const meta = MODEL_META[model];
	if (!meta) return null;
	return (
		<span className={cn("flex flex-wrap items-center gap-1", className)}>
			{METRICS.map(({ key, icon, phrase }) => {
				const tier = meta[key];
				return <IconChip key={key} icon={icon[tier]} label={phrase[tier]} />;
			})}
		</span>
	);
}
