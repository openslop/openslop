import { Loader2 } from "@/components/ui/icon";

import { cn } from "@/lib/utils";

function Spinner({
	className,
	...props
}: React.ComponentProps<typeof Loader2>) {
	return (
		<Loader2
			role="status"
			aria-hidden={false}
			aria-label="Loading"
			className={cn("size-4 animate-spin text-muted-foreground", className)}
			{...props}
		/>
	);
}

export { Spinner };
