import { Badge } from "@/components/ui/badge";
import { AlertCircle, CheckCircle, Hourglass } from "@/components/ui/icon";
import type { KeyStatus } from "@/lib/connectors/providerKey";

const STATUS = {
	valid: { variant: "default", Icon: CheckCircle, label: "Connected" },
	invalid: { variant: "tertiary", Icon: AlertCircle, label: "Not working" },
	unverified: { variant: "caution", Icon: Hourglass, label: "Unverified" },
} as const;

export function KeyStatusBadge({ status }: { status: KeyStatus }) {
	const { variant, Icon, label } = STATUS[status];
	return (
		<Badge variant={variant}>
			<Icon aria-hidden="true" />
			{label}
		</Badge>
	);
}
