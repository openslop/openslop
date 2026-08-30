import {
	PINNED_PANEL_KEYS,
	RAIL_PANEL_KEYS,
} from "@/app/components/canvas/panel/panelKeys";
import { Skeleton } from "@/components/ui/skeleton";

const SCENES = [3, 2, 4];

/** Mirrors the dock's default height and the lanes a video always has. */
const DOCK_HEIGHT = 260;
const LANES: { height: string; clips: [start: number, width: number][] }[] = [
	{
		height: "h-20",
		clips: [
			[0, 0.34],
			[0.35, 0.28],
			[0.64, 0.36],
		],
	},
	{
		height: "h-16",
		clips: [
			[0, 0.61],
			[0.62, 0.38],
		],
	},
	{
		height: "h-16",
		clips: [
			[0.06, 0.22],
			[0.4, 0.16],
			[0.71, 0.24],
		],
	},
	{ height: "h-16", clips: [[0, 1]] },
];

function TimelineSkeleton() {
	return (
		<div className="flex min-h-0 flex-1 overflow-hidden">
			<div className="flex w-10 shrink-0 flex-col border-r border-border">
				<div className="h-7 shrink-0 border-b border-border" />
				{LANES.map(({ height }, lane) => (
					<div
						key={lane}
						className={`flex shrink-0 items-center justify-center border-b border-border/50 ${height}`}
					>
						<Skeleton className="size-3.5 rounded-xs" />
					</div>
				))}
			</div>

			<div className="flex min-w-0 flex-1 flex-col">
				<div className="relative h-7 shrink-0">
					{[0, 0.2, 0.4, 0.6, 0.8].map((at) => (
						<Skeleton
							key={at}
							className="absolute top-3.5 h-2 w-8 -translate-y-1/2 rounded-xs"
							style={{ left: `${at * 100}%` }}
						/>
					))}
				</div>
				{LANES.map(({ height, clips }, lane) => (
					<div
						key={lane}
						className={`relative shrink-0 border-b border-border/50 ${height}`}
					>
						{clips.map(([start, width]) => (
							<Skeleton
								key={start}
								className="absolute inset-y-0.5 h-auto rounded-md"
								style={{ left: `${start * 100}%`, width: `${width * 100}%` }}
							/>
						))}
					</div>
				))}
			</div>
		</div>
	);
}

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
			<div className="fixed top-4 left-5 z-[100]">
				<Skeleton className="size-8 rounded-full" />
			</div>

			{/* Refine bar + generate and export buttons */}
			<div className="z-40 flex w-full shrink-0 items-center gap-3 px-4 py-1.5">
				<div className="hidden flex-1 sm:block" aria-hidden />
				<Skeleton className="h-8 min-w-0 max-w-2xl flex-1 rounded-xl" />
				<div className="flex flex-1 items-center justify-end gap-2">
					<Skeleton className="h-8 w-28 rounded-md" />
					<Skeleton className="h-8 w-20 rounded-md" />
				</div>
			</div>

			{/* Left rail + canvas card */}
			<div className="flex min-h-0 flex-1 overflow-hidden">
				<nav className="mr-2 flex w-14 shrink-0 flex-col items-center gap-1 pt-4 pr-0.5 pl-1 lg:w-[72px]">
					<RailItemSkeleton />
					<div className="my-1 h-px w-full bg-border" />
					{RAIL_PANEL_KEYS.map((key) => (
						<RailItemSkeleton key={key} />
					))}
					<div className="mt-auto flex w-full flex-col items-center gap-1 pb-3">
						<div className="my-1 h-px w-full bg-border" />
						{PINNED_PANEL_KEYS.map((key) => (
							<RailItemSkeleton key={key} />
						))}
					</div>
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

					{/* Transport bar and the timeline below it */}
					<div
						className="flex shrink-0 flex-col overflow-hidden"
						style={{ height: DOCK_HEIGHT }}
					>
						<div className="h-2 shrink-0" />
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
						<TimelineSkeleton />
					</div>
				</div>
			</div>
		</div>
	);
}
