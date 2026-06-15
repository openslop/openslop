import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<div className="mx-auto max-w-7xl px-6 pt-20 pb-16">
				<div className="mb-10 flex items-end justify-between">
					<div className="space-y-2">
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-9 w-28 rounded-md" />
				</div>
				<div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
					{Array.from({ length: 12 }).map((_, i) => (
						<div key={i}>
							<Skeleton className="aspect-square rounded-lg" />
							<Skeleton className="mt-2 h-4 w-3/4" />
							<Skeleton className="mt-1.5 h-3 w-1/2" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
