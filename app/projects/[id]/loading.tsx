import { Skeleton } from "@/components/ui/skeleton";

/** High-level placeholder for the editor: refine bar, canvas, transport bar. */
export default function Loading() {
	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden text-foreground">
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>

			{/* Refine bar + generate button */}
			<div className="flex w-full shrink-0 items-start gap-3 px-4 py-3 pb-2 pl-16">
				<div className="hidden flex-1 sm:block" aria-hidden />
				<Skeleton className="h-12 min-w-0 max-w-2xl flex-1 rounded-xl" />
				<div className="flex flex-1 justify-end">
					<Skeleton className="h-11 w-36 rounded-xl" />
				</div>
			</div>

			{/* Canvas card with bottom transport bar */}
			<div className="relative mx-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
				<Skeleton className="min-h-0 flex-1 rounded-none" />
				<div className="flex w-full shrink-0 flex-col gap-1.5 border-t border-border px-4 py-2">
					<Skeleton className="h-2 w-full rounded-full" />
					<div className="flex items-center justify-between">
						<Skeleton className="h-4 w-20 rounded" />
						<Skeleton className="h-7 w-28 rounded-md" />
						<Skeleton className="h-4 w-16 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
}
