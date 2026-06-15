import Link from "next/link";
import { ArrowLeft } from "@/components/ui/icon";

export default function BackToMySlopLink({
	className = "",
}: {
	className?: string;
}) {
	return (
		<Link
			href="/"
			className={`inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground focus-ring ${className}`}
		>
			<ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
			Back to My Slop
		</Link>
	);
}
