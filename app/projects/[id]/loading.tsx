import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen text-white">
			<div className="max-w-3xl mx-auto px-6 pt-24 space-y-6">
				<Skeleton className="h-10 w-2/3" />
				<Skeleton className="h-40 w-full" />
				<div className="space-y-3">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-20 w-full" />
					))}
				</div>
			</div>
		</div>
	);
}
