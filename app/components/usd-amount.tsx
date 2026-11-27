import NumberFlow, { type Format } from "@number-flow/react";
import { Skeleton } from "@/components/ui/skeleton";

const USD: Format = { style: "currency", currency: "USD" };

/** Counts to each new amount, and shimmers until the first one lands. */
export function UsdAmount({ usd }: { usd: number | undefined }) {
	return usd === undefined ? (
		<Skeleton className="h-3 w-8" />
	) : (
		<NumberFlow value={usd} locales="en-US" format={USD} />
	);
}
