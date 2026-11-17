import { Badge } from "@/components/ui/badge";
import { CreditCard } from "@/components/ui/icon";
import { formatCost } from "@/lib/format";

export function GenerationCost({
	costUsd,
	size,
}: {
	costUsd: number | undefined;
	size: "xs" | "sm";
}) {
	if (costUsd === undefined) return null;
	return (
		<Badge variant="indicator" size={size}>
			<CreditCard />
			<span className="sr-only">Cost</span>
			<span className="font-numeric">{formatCost(costUsd)}</span>
		</Badge>
	);
}
