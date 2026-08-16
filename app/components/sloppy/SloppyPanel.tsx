"use client";

import { memo, useEffect, useRef } from "react";
import type { AgentMessageRow } from "@/lib/agent/types";
import { AgentTurn, UserMessage } from "./SloppyMessage";
import { useSloppyLive, useSloppyMessages } from "./SloppyProvider";
import { TranscriptSkeleton } from "./TranscriptSkeleton";

const EMPTY_HINT = "Ask Sloppy to change the script however you want.";

type Group =
	| { kind: "user"; id: string; row: AgentMessageRow }
	| { kind: "turn"; id: string; rows: AgentMessageRow[] };

/**
 * A turn is stored as an assistant row plus the tool rows that answer it. They
 * read as one reply, so they share one activity block.
 */
function groupTranscript(rows: AgentMessageRow[]): Group[] {
	const groups: Group[] = [];
	for (const row of rows) {
		if (row.message.role === "user") {
			groups.push({ kind: "user", id: row.id, row });
			continue;
		}
		const last = groups.at(-1);
		if (last?.kind === "turn") last.rows.push(row);
		else groups.push({ kind: "turn", id: row.id, rows: [row] });
	}
	return groups;
}

/** The turn's own row carries how it was produced; the rest are its tool results. */
function TurnGroup({ id, rows }: { id: string; rows: AgentMessageRow[] }) {
	const [turn] = rows;
	return (
		<AgentTurn
			messages={rows.map((row) => row.message)}
			systemPrompt={turn.request?.system}
			thoughtSeconds={turn.usage?.thoughtSeconds}
			workSeconds={turn.usage?.workSeconds}
			idPrefix={id}
		/>
	);
}

/** Reads only the messages context, so a streaming turn never re-renders history. */
const Transcript = memo(function Transcript() {
	const messages = useSloppyMessages();
	if (!messages) return <TranscriptSkeleton />;
	return (
		<>
			{groupTranscript(messages).map((group) =>
				group.kind === "user" ? (
					<UserMessage key={group.id} message={group.row.message} />
				) : (
					<TurnGroup key={group.id} id={group.id} rows={group.rows} />
				),
			)}
		</>
	);
});

function LiveTurn() {
	const live = useSloppyLive();
	if (!live) return null;

	// Only the live turn animates in: stored ones would all replay on load.
	return (
		<div className="flex animate-fadeInUp flex-col gap-2">
			<UserMessage message={{ role: "user", content: live.user }} />
			<AgentTurn
				messages={[live.assistant]}
				systemPrompt={live.request?.system}
				thoughtSeconds={live.thoughtSeconds}
				streaming
				idPrefix="live"
			/>
		</div>
	);
}

function EmptyHint() {
	const messages = useSloppyMessages();
	const live = useSloppyLive();
	if (!messages || messages.length > 0 || live) return null;
	return <p className="px-1 text-label text-muted-foreground">{EMPTY_HINT}</p>;
}

export function SloppyPanel() {
	const live = useSloppyLive();
	const messages = useSloppyMessages();
	const endRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [live, messages]);

	return (
		<div
			aria-live="polite"
			aria-busy={messages === null}
			className="flex flex-col gap-3"
		>
			<EmptyHint />
			<Transcript />
			<LiveTurn />
			<div ref={endRef} />
		</div>
	);
}
