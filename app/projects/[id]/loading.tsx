import { Skeleton } from "@/components/ui/skeleton";

/**
 * Editor placeholder that mirrors the real canvas
 */

const SCENES = [3, 2, 4];

function RailItemSkeleton() {
	return (
		<div className="flex w-full flex-col items-center gap-1 px-2 py-2.5">
			<Skeleton className="h-5 w-5 rounded-md" />
			<Skeleton className="hidden h-2 w-8 rounded lg:block" />
		</div>
	);
}

function SceneSkeleton({
	elements,
	first,
}: {
	elements: number;
	first?: boolean;
}) {
	return (
		<div className={first ? "" : "mt-3 border-t border-border pt-3"}>
			<Skeleton className="mb-2 h-3 w-16 rounded" />
			<div className="flex flex-col gap-2">
				{Array.from({ length: elements }).map((_, i) => (
					<Skeleton
						key={i}
						className={`h-9 rounded-md ${i === elements - 1 ? "w-2/3" : "w-full"}`}
					/>
				))}
			</div>
		</div>
	);
}

export default function Loading() {
	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden text-foreground">
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>

			{/* Profile avatar */}
			<div className="fixed top-4 left-4 z-[100]">
				<Skeleton className="h-9 w-9 rounded-full" />
			</div>

			{/* Refine bar + generate button */}
			<div className="z-40 flex w-full shrink-0 items-start gap-3 px-4 py-3 pb-2 pl-16">
				<div className="hidden flex-1 sm:block" aria-hidden />
				<Skeleton className="h-12 min-w-0 max-w-2xl flex-1 rounded-xl" />
				<div className="flex flex-1 justify-end">
					<Skeleton className="h-11 w-36 rounded-xl" />
				</div>
			</div>

			{/* Left rail + canvas card */}
			<div className="flex min-h-0 flex-1 overflow-hidden">
				<nav className="mr-2 flex w-14 shrink-0 flex-col items-center gap-1 pt-16 pr-0.5 pl-1 lg:w-[72px] lg:pt-4">
					<RailItemSkeleton />
					<div className="my-1.5 h-px w-8 bg-border" />
					<RailItemSkeleton />
					<RailItemSkeleton />
				</nav>

				<div className="relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
					<div className="flex min-h-0 flex-1 overflow-hidden">
						{/* Scene list */}
						<div
							className="flex-1 overflow-y-auto"
							style={{ scrollbarGutter: "stable" }}
						>
							<div className="mx-auto max-w-6xl px-4 py-4">
								<div className="mb-3 flex h-8 items-center">
									<Skeleton className="h-7 w-48 rounded-md" />
								</div>
								<div className="flex flex-col">
									{SCENES.map((elements, i) => (
										<SceneSkeleton
											key={i}
											elements={elements}
											first={i === 0}
										/>
									))}
								</div>
							</div>
						</div>

						{/* Side player panel */}
						<div className="hidden w-[42%] max-w-[560px] shrink-0 flex-col justify-center border-l border-border p-4 lg:flex">
							<Skeleton className="aspect-video w-full rounded-lg" />
						</div>
					</div>

					{/* Bottom transport bar */}
					<div className="flex w-full shrink-0 flex-col gap-1.5 border-t border-border px-4 py-2">
						<Skeleton className="h-3 w-full rounded-full" />
						<div className="flex items-center gap-2">
							<div className="flex flex-1 items-center">
								<Skeleton className="h-4 w-20 rounded" />
							</div>
							<div className="flex items-center gap-1">
								<Skeleton className="h-7 w-7 rounded-md" />
								<Skeleton className="h-7 w-7 rounded-md" />
								<Skeleton className="h-7 w-7 rounded-md" />
							</div>
							<div className="flex flex-1 items-center justify-end gap-1.5">
								<Skeleton className="h-7 w-7 rounded-md" />
								<Skeleton className="h-7 w-7 rounded-md" />
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
