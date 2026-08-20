import { Fragment } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { PanelCard } from "../canvas/panel/PanelCard";

const TURNS: { prompt: string; reply: string[] | null }[] = [
	{ prompt: "w-28", reply: ["w-full", "w-3/5"] },
	{ prompt: "w-20", reply: null },
];

export function TranscriptSkeleton() {
	return (
		<div aria-hidden="true" className="flex flex-col gap-3">
			{TURNS.map((turn, index) => (
				<Fragment key={index}>
					<Skeleton
						className={`ml-auto h-8 rounded-xl rounded-br-sm ${turn.prompt}`}
					/>
					<div className="flex items-center gap-1.5 px-1">
						<Skeleton className="h-3 w-3" />
						<Skeleton className="h-3 w-24" />
					</div>
					{turn.reply && (
						<PanelCard>
							{turn.reply.map((width, line) => (
								<Skeleton key={line} className={`h-3 ${width}`} />
							))}
						</PanelCard>
					)}
				</Fragment>
			))}
		</div>
	);
}
