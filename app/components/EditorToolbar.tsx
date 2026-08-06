"use client";

import { memo, useState } from "react";
import type { Editor } from "slate";
import { Sparkles, X } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useScriptControl } from "@/lib/script/ScriptProvider";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import InlineCopilot from "./copilot/InlineCopilot";
import { useGenerateAll } from "./canvas/hooks/useGenerateAll";
import { useRefine } from "./canvas/RefineProvider";
import { ExportButton } from "./video/ExportButton";
import editorStyles from "./Editor.module.css";

function RefineComposer() {
	const [value, setValue] = useState("");
	const { loading, stopGeneration } = useScriptControl();
	const { refineScript, refineLoading, stopRefine } = useRefine();
	return (
		<InlineCopilot
			value={value}
			onValueChange={setValue}
			onSubmit={() => {
				refineScript(value);
				setValue("");
			}}
			onStop={refineLoading ? stopRefine : stopGeneration}
			loading={loading || refineLoading}
			placeholder="Refine your script…"
		/>
	);
}

function getGenerateLabel(loading: boolean, generating: boolean): string {
	if (loading) return "Writing…";
	if (generating) return "Generating…";
	return "Generate All";
}

function EditorToolbarComponent({ editor }: { editor: Editor }) {
	const { loading } = useScriptControl();
	const { generateAll } = useGenerateAll(editor);
	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const busy = loading || generating;
	const generateLabel = getGenerateLabel(loading, generating);

	return (
		<div
			className={`z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-1.5 pl-16 ${editorStyles.copilotEnter}`}
		>
			<div className="flex w-full items-center gap-3">
				<div className="hidden flex-1 sm:block" aria-hidden />
				<div className="min-w-0 max-w-2xl flex-1">
					<RefineComposer />
				</div>
				<div className="flex flex-1 items-center justify-end gap-2 max-sm:flex-none">
					<Button
						type="button"
						variant="generate"
						size="sm"
						onClick={generateAll}
						className="shrink-0 sm:px-4"
						aria-label={generateLabel}
						disabled={busy}
					>
						{busy ? (
							<Spinner className="text-current" />
						) : (
							<Sparkles aria-hidden="true" />
						)}
						<span className="hidden sm:inline">{generateLabel}</span>
					</Button>
					<ExportButton />
					{generating && (
						<TooltipIconButton
							label="Cancel generation"
							className="self-center bg-muted text-muted-foreground hover:text-foreground"
							onClick={() => queue.cancelAll()}
						>
							<X className="h-3 w-3" aria-hidden="true" />
						</TooltipIconButton>
					)}
				</div>
			</div>
		</div>
	);
}

export const EditorToolbar = memo(EditorToolbarComponent);
