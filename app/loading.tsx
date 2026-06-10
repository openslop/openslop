import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-screen text-white">
			<div className="max-w-5xl mx-auto px-6 pt-20 pb-16">
				<div className="flex items-end justify-between mb-10">
					<div className="space-y-2">
						<Skeleton className="h-9 w-40" />
						<Skeleton className="h-4 w-24" />
					</div>
					<Skeleton className="h-9 w-32 rounded-full" />
				</div>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 6 }).map((_, i) => (
						<div
							key={i}
							className="rounded-xl border border-glass-border overflow-hidden"
						>
							<Skeleton className="aspect-video rounded-none" />
							<div className="p-4 space-y-2">
								<Skeleton className="h-4 w-2/3" />
								<Skeleton className="h-3 w-1/3" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
