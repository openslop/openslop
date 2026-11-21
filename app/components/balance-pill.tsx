"use client";

import NumberFlow, { type Format } from "@number-flow/react";
import { Badge } from "@/components/ui/badge";
import { CreditCard } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import { useBalance } from "@/lib/user/use-balance";

const USD: Format = { style: "currency", currency: "USD" };

export function BalancePill() {
	const usd = useBalance();

	return (
		<SimpleTooltip label="Your balance for OpenSlop's models" side="bottom">
			<Badge variant="mutedOutline" size="lg">
				<CreditCard />
				<span className="sr-only">Balance</span>
				<NumberFlow value={usd} locales="en-US" format={USD} />
			</Badge>
		</SimpleTooltip>
	);
}
