import { Loader2 } from "@/components/ui/icon";

import { cn } from "@/lib/utils";

function Spinner({
	className,
	...props
}: React.ComponentProps<typeof Loader2>) {
	return (
		<Loader2
			role="status"
			aria-label="Loading"
			strokeWidth={1.5}
			className={cn("size-4 animate-spin text-muted-foreground", className)}
			{...props}
		/>
	);
}

export { Spinner };
