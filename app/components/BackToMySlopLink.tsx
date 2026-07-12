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
			className={`inline-flex items-center gap-2 text-body text-muted-foreground transition-colors hover:text-foreground focus-ring ${className}`}
		>
			<ArrowLeft size={16} aria-hidden="true" />
			Back to My Slop
		</Link>
	);
}
