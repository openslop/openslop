"use client";

import { memo, useEffect, useRef, useState } from "react";
import {
	findScrollableAncestor,
	scrollIntoContainer,
} from "@/lib/components/scrollIntoContainer";
import { cn } from "@/lib/utils";
import { trailingAssistant } from "@/lib/agent/messages";
import type { SloppyMessage } from "@/lib/agent/types";
import { AgentTurn, UserMessage } from "./SloppyMessage";
import { useSloppy, useSloppyMessages } from "./SloppyProvider";
import { TranscriptSkeleton } from "./TranscriptSkeleton";
import { turnStatus } from "./turnDisplay";
import { WorkingStatus } from "./TurnStatus";

const EMPTY_HINT = "Ask Sloppy to change the script however you want.";

/** A settled message never changes, so only the one being streamed re-renders. */
const Row = memo(function Row({
	message,
	streaming,
	entering,
}: {
	message: SloppyMessage;
	streaming: boolean;
	entering: boolean;
}) {
	return (
		<li className={cn("flex flex-col gap-2", entering && "animate-fadeInUp")}>
			<span className="sr-only">
				{message.role === "user" ? "You said" : "Sloppy said"}
			</span>
			{message.role === "user" ? (
				<UserMessage message={message} />
			) : (
				<AgentTurn message={message} streaming={streaming} />
			)}
		</li>
	);
});

function Transcript({
	messages,
	working,
}: {
	messages: SloppyMessage[];
	working: boolean;
}) {
	const [restored] = useState(messages.length);

	if (messages.length === 0) {
		return (
			<p className="px-1 text-label text-muted-foreground">{EMPTY_HINT}</p>
		);
	}

	return (
		<ol role="log" className="flex flex-col gap-3">
			{messages.map((message, index) => (
				<Row
					key={message.id}
					message={message}
					streaming={working && index === messages.length - 1}
					entering={index >= restored}
				/>
			))}
			{working && (
				<li>
					<WorkingStatus
						status={turnStatus(trailingAssistant(messages)?.parts ?? [])}
					/>
				</li>
			)}
		</ol>
	);
}

const BOTTOM_THRESHOLD_PX = 48;

export function SloppyPanel() {
	const messages = useSloppyMessages();
	const { loading } = useSloppy();
	const endRef = useRef<HTMLDivElement>(null);
	const isAtBottomRef = useRef(true);

	useEffect(() => {
		const end = endRef.current;
		if (!end) return;
		const target = findScrollableAncestor(end) ?? document.scrollingElement;
		if (!target) return;
		const onScroll = () => {
			const distance =
				target.scrollHeight - target.scrollTop - target.clientHeight;
			isAtBottomRef.current = distance <= BOTTOM_THRESHOLD_PX;
		};
		onScroll();
		target.addEventListener("scroll", onScroll, { passive: true });
		return () => target.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (!endRef.current || !messages) return;
		const last = messages[messages.length - 1];
		if (last?.role === "user") {
			isAtBottomRef.current = true;
		} else if (!isAtBottomRef.current) {
			return;
		}
		scrollIntoContainer(endRef.current, "end", "auto");
	}, [messages]);

	return (
		<div
			aria-busy={messages === null || loading}
			className="flex flex-col gap-3"
		>
			{messages === null ? (
				<TranscriptSkeleton />
			) : (
				<Transcript messages={messages} working={loading} />
			)}
			<div ref={endRef} />
		</div>
	);
}
