import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Hourglass } from "@/components/ui/icon";
import type { ConnectorStatus } from "@/lib/connectors/connectorRecord";

const STATUS = {
	valid: { variant: "default", Icon: CheckCircle, label: "Connected" },
	// The same pill a stale element wears: something to look at, not an error.
	invalid: { variant: "tertiary", Icon: AlertCircle, label: "Not working" },
	unverified: { variant: "caution", Icon: Hourglass, label: "Unverified" },
} as const;

/** Whether the stored key was working the last time it was tried. */
export function ConnectorStatusBadge({ status }: { status: ConnectorStatus }) {
	const { variant, Icon, label } = STATUS[status];
	return (
		<Badge variant={variant}>
			<Icon aria-hidden="true" />
			{label}
		</Badge>
	);
}
