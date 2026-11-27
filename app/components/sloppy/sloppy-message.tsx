"use client";

import { CopyButton } from "@/components/ui/copy-button";
import { turnBlocks, type TurnBlock } from "@/lib/agent/step-runs";
import type { SloppyMessage } from "@/lib/agent/types";
import { PanelCard } from "../canvas/panel/panel-card";
import { ReplyMarkdown } from "./reply-markdown";
import { StepRun, WorkedStatus } from "./turn-status";
import { userText } from "./turn-display";

export function UserMessage({ message }: { message: SloppyMessage }) {
	return (
		<p className="ml-auto w-fit max-w-[88%] shrink-0 whitespace-pre-wrap wrap-break-word rounded-xl rounded-br-sm bg-user-message px-3 py-2 text-label text-user-message-foreground">
			{userText(message)}
		</p>
	);
}

function ReplyText({ text, streaming }: { text: string; streaming: boolean }) {
	return (
		<div className="group/reply">
			<PanelCard>
				<div className="pr-6 text-label text-foreground">
					<ReplyMarkdown text={text} streaming={streaming} />
				</div>
				<CopyButton
					text={text}
					label="Copy reply"
					size="sm"
					className="absolute top-2 right-2 opacity-0 group-hover/reply:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
				/>
			</PanelCard>
		</div>
	);
}

/** A turn that has streamed nothing yet still shows its first run, waiting on its first step. */
const WAITING: TurnBlock[] = [{ kind: "steps", run: 0, steps: [] }];

export function AgentTurn({
	message,
	streaming,
}: {
	message: SloppyMessage;
	streaming: boolean;
}) {
	const blocks = turnBlocks(message.parts);
	const rows = streaming && blocks.length === 0 ? WAITING : blocks;

	return (
		<>
			{rows.map((block, index) =>
				block.kind === "reply" ? (
					<ReplyText
						key={index}
						text={block.part.text}
						streaming={streaming && block.part.state === "streaming"}
					/>
				) : (
					<StepRun
						key={index}
						steps={block.steps}
						live={streaming && index === rows.length - 1}
						seconds={message.metadata?.stepSeconds?.[block.run]}
					/>
				),
			)}
			{!streaming && blocks.some((block) => block.kind === "steps") && (
				<WorkedStatus seconds={message.metadata?.workSeconds} />
			)}
		</>
	);
}
