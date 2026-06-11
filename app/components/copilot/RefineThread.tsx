"use client";

import { Sparkles } from "lucide-react";
import type { RefineTurn } from "../canvas/hooks/useRefineScript";

const SUGGESTIONS = [
	"Add motion to all scenes",
	"Make the script funnier",
	"Make narration faster",
	"Vary character poses",
];

interface RefineThreadProps {
	latestTurn: RefineTurn | null;
	loading: boolean;
	onApply: (id: number) => void;
	onDiscard: (id: number) => void;
	onSuggest: (text: string) => void;
}

function TurnCard({
	turn,
	onApply,
	onDiscard,
}: {
	turn: RefineTurn;
	onApply: (id: number) => void;
	onDiscard: (id: number) => void;
}) {
	// Preview is live in the editor (highlighted). Apply keeps it; Discard reverts.
	if (turn.status === "pending") {
		return (
			<div className="flex items-center gap-3 rounded-xl border border-glass-border bg-glass-fill px-3 py-2 backdrop-blur-xl">
				<span className="font-body shrink-0 rounded-full bg-accent-violet/20 px-2 py-0.5 text-[10px] font-medium text-accent-violet-soft">
					Preview
				</span>
				<p className="font-body min-w-0 flex-1 truncate text-sm text-white/80">
					{turn.summary}
				</p>
				<button
					type="button"
					onClick={() => onDiscard(turn.id)}
					className="font-body shrink-0 rounded-lg px-3 py-1 text-xs text-white/60 transition-colors hover:bg-glass-fill hover:text-white"
				>
					Discard
				</button>
				<button
					type="button"
					onClick={() => onApply(turn.id)}
					className="font-body shrink-0 rounded-lg bg-accent-violet px-3 py-1 text-xs font-medium text-white shadow-glow transition hover:brightness-110"
				>
					Apply
				</button>
			</div>
		);
	}

	if (turn.status === "empty") {
		return (
			<p className="font-body px-1 text-[11px] text-white/40">
				No changes suggested.
			</p>
		);
	}

	// applied (kept) / discarded (reverted): the editor already reflects the
	// result, so the thread clears.
	return null;
}

export default function RefineThread({
	latestTurn,
	loading,
	onApply,
	onDiscard,
	onSuggest,
}: RefineThreadProps) {
	const showChips =
		!loading && (!latestTurn || latestTurn.status !== "pending");

	return (
		<div className="flex w-full flex-col gap-2">
			{latestTurn && (
				<TurnCard turn={latestTurn} onApply={onApply} onDiscard={onDiscard} />
			)}
			{showChips && (
				<div className="flex flex-wrap gap-1.5">
					{SUGGESTIONS.map((s) => (
						<button
							key={s}
							type="button"
							onClick={() => onSuggest(s)}
							className="font-body inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-fill px-3 py-1 text-[11px] text-white/60 transition-colors hover:border-white/20 hover:text-white"
						>
							<Sparkles
								className="h-3 w-3 text-accent-violet-soft"
								strokeWidth={1.5}
							/>
							{s}
						</button>
					))}
				</div>
			)}
		</div>
	);
}
