"use client";

import { memo, useEffect, useRef } from "react";
import { foldTurns } from "@/lib/agent/turns";
import { AgentTurn, UserMessage } from "./SloppyMessage";
import { useSloppyLive, useSloppyMessages } from "./SloppyProvider";
import { TranscriptSkeleton } from "./TranscriptSkeleton";

const EMPTY_HINT = "Ask Sloppy to change the script however you want.";

/** Reads only the messages context, so a streaming turn never re-renders history. */
const Transcript = memo(function Transcript() {
	const messages = useSloppyMessages();
	if (!messages) return <TranscriptSkeleton />;
	return (
		<>
			{foldTurns(messages).map((turn) =>
				turn.role === "user" ? (
					<UserMessage key={turn.id} message={turn.messages[0]} />
				) : (
					<AgentTurn key={turn.id} turn={turn} />
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
				turn={{
					id: "live",
					role: "assistant",
					messages: [live.assistant],
					request: live.request,
					usage: null,
				}}
				thoughtSeconds={live.thoughtSeconds}
				streaming
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
