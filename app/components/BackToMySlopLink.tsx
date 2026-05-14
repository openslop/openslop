import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackToMySlopLink({
	className = "",
}: {
	className?: string;
}) {
	return (
		<Link
			href="/"
			className={`inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${className}`}
		>
			<ArrowLeft size={16} strokeWidth={1.5} aria-hidden="true" />
			Back to My Slop
		</Link>
	);
}
