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
		<SimpleTooltip label="Your balance for OpenSlop's models" side="bottom">
			<Badge variant="indicatorOutline" size="lg">
				<CreditCard />
				<span className="sr-only">Balance</span>
				{usd === null ? "…" : USD.format(usd)}
			</Badge>
		</SimpleTooltip>
	);
}
