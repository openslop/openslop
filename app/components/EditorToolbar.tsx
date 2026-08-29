"use client";

import Link from "next/link";
import { memo } from "react";
import { useSlateStatic } from "slate-react";
import { Check, Lock, Sparkles, X } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { TooltipIconButton } from "@/components/ui/icon-button";
import { useProject } from "@/lib/project/useProject";
import {
	useGenerationQueue,
	useQueueSelector,
} from "@/lib/generation/GenerationQueueProvider";
import { useGenerateAll } from "./canvas/hooks/useGenerateAll";
import type { GenerateScope } from "./canvas/hooks/useGenerateScope";
import { useSloppy } from "./sloppy/SloppyProvider";
import { ExportButton } from "./video/ExportButton";
import editorStyles from "./Editor.module.css";

function Breadcrumbs() {
	const title = useProject((s) => s.metadata.title);

	return (
		<nav
			aria-label="Breadcrumb"
			className="absolute inset-y-0 left-1/2 flex max-w-[40vw] -translate-x-1/2 items-center"
		>
			<ol className="flex min-w-0 items-center gap-1.5 text-label font-[475] text-foreground">
				<li className="shrink-0">
					<Button
						variant="ghost"
						size="sm"
						asChild
						className="h-7 gap-1.5 px-2 font-[475]"
					>
						<Link href="/">
							<Lock className="size-3" aria-hidden="true" />
							Personal
						</Link>
					</Button>
				</li>
				{title && (
					<>
						<li aria-hidden="true" className="shrink-0">
							/
						</li>
						<li className="min-w-0">
							<span
								aria-current="page"
								className="block h-7 truncate px-2 leading-7"
							>
								{title}
							</span>
						</li>
					</>
				)}
			</ol>
		</nav>
	);
}

/**
 * Generate All only ever runs what is missing or out of date, so when there is
 * nothing left it says so instead of offering a click that would do nothing.
 */
function getGenerateLabel(
	loading: boolean,
	generating: boolean,
	{ empty, pending, total }: GenerateScope,
): string {
	if (loading) return "Writing…";
	if (generating) return "Generating…";
	if (empty || pending === total) return "Generate All";
	if (pending === 0) return "Up to date";
	return `Generate ${pending} of ${total}`;
}

function EditorToolbarComponent() {
	const editor = useSlateStatic();
	const { loading } = useSloppy();
	const scope = useGenerateAll(editor);
	const queue = useGenerationQueue();
	const generating = useQueueSelector((q) => q.isBusy());
	const busy = loading || generating;
	const generateLabel = getGenerateLabel(loading, generating, scope);
	const current = !busy && !scope.empty && scope.pending === 0;

	return (
		<div
			className={`relative z-40 flex w-full shrink-0 flex-col items-center gap-3 px-4 py-1.5 ${editorStyles.copilotEnter}`}
		>
			<Breadcrumbs />
			<div className="flex w-full items-center gap-3">
				<div className="ml-auto flex shrink-0 items-center justify-end gap-2">
					<Button
						type="button"
						variant="generate"
						size="sm"
						onClick={scope.generate}
						className="shrink-0 sm:px-4"
						aria-label={generateLabel}
						disabled={busy || scope.empty || current}
					>
						{busy ? (
							<Spinner className="text-current" />
						) : current ? (
							<Check aria-hidden="true" />
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
