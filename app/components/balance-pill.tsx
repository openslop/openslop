"use client";

import { Badge } from "@/components/ui/badge";
import { CreditCard } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useBalance } from "@/lib/user/use-balance";

const USD = new Intl.NumberFormat("en-US", {
	style: "currency",
	currency: "USD",
});

export function BalancePill() {
	const usd = useBalance();

	return (
		<SimpleTooltip
			label="Your balance. Each generation on OpenSlop's models spends what the provider charged for it."
			side="bottom"
		>
			<Badge
				variant="indicator"
				className="h-8 gap-2 rounded-lg border-indicator-foreground/20 px-2.5"
			>
				<CreditCard />
				<span className="sr-only">Balance</span>
				{usd === null ? "…" : USD.format(usd)}
			</Badge>
		</SimpleTooltip>
	);
}
