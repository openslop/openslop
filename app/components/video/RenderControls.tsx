"use client";

import { Download, Loader2, X } from "@/components/ui/icon";
import { SimpleTooltip } from "@/components/ui/tooltip";
import type { VideoLayout } from "@/lib/video/types";
import { useRendering } from "./useRendering";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const pillClass =
	"flex items-center gap-2 rounded-lg border border-border bg-card/90 px-3 py-2 shadow-md shadow-black/20";

export function RenderControls({ layout }: { layout: VideoLayout }) {
	const { state, render, reset } = useRendering();

	if (state.status === "idle") {
		return (
			<SimpleTooltip label="Export Video">
				<button
					type="button"
					onClick={() => render(layout)}
					aria-label="Export Video"
					className="relative rounded-lg bg-secondary p-2 text-accent opacity-0 shadow-md shadow-black/25 transition-[opacity,filter] hover:brightness-[1.3] group-hover:opacity-100"
				>
					<Download size={16} />
				</button>
			</SimpleTooltip>
		);
	}

	if (state.status === "invoking") {
		return (
			<div className={pillClass}>
				<Loader2 size={14} className="animate-spin text-muted-foreground" />
				<span className="text-xs text-foreground">Starting...</span>
			</div>
		);
	}

	if (state.status === "rendering") {
		return (
			<div className={pillClass}>
				<Loader2 size={14} className="animate-spin text-muted-foreground" />
				<div className="flex flex-col gap-1">
					<span className="text-xs text-foreground">Rendering...</span>
					<div className="h-1 w-32 overflow-hidden rounded-full bg-muted">
						<div
							className="h-full rounded-full bg-accent transition-all"
							style={{ width: `${state.progress * 100}%` }}
						/>
					</div>
				</div>
			</div>
		);
	}

	if (state.status === "done") {
		return (
			<div className={pillClass}>
				<a
					href={state.url}
					download
					className="relative flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-xs font-medium text-accent transition-[filter] hover:brightness-[1.3]"
				>
					<Download size={14} />
					{formatBytes(state.size)}
				</a>
				<button
					type="button"
					onClick={reset}
					aria-label="Dismiss"
					className="rounded-md p-1 text-muted-foreground hover:text-foreground"
				>
					<X size={14} />
				</button>
			</div>
		);
	}

	return (
		<div className={pillClass}>
			<span className="text-xs text-destructive">{state.message}</span>
			<button
				type="button"
				onClick={reset}
				className="text-xs text-muted-foreground underline hover:text-foreground"
			>
				Dismiss
			</button>
		</div>
	);
}
