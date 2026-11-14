import { Loader2 } from "@/components/ui/icon";

import { cn } from "@/lib/utils";

function Spinner({
	className,
	...props
}: React.ComponentProps<typeof Loader2>) {
	return <Loader2 className={cn("animate-spin", className)} {...props} />;
}

export { Spinner };
