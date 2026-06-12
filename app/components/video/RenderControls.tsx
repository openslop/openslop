"use client";

import { Download, Loader2, X } from "lucide-react";
import {
	Tooltip,
	TooltipTrigger,
	TooltipContent,
} from "@/components/ui/tooltip";
import type { VideoLayout } from "@/lib/video/types";
import { useRendering } from "./useRendering";

function formatBytes(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const pillClass =
	"flex items-center gap-2 rounded-lg border border-glass-border bg-card/90 px-3 py-2 backdrop-blur-xl shadow-md shadow-black/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.12)]";

export function RenderControls({ layout }: { layout: VideoLayout }) {
	const { state, render, reset } = useRendering();

	if (state.status === "idle") {
		return (
			<Tooltip>
				<TooltipTrigger asChild>
					<button
						type="button"
						onClick={() => render(layout)}
						aria-label="Export Video"
						className="relative grain rounded-lg bg-[#1f1528]/90 p-2 text-violet-300 opacity-0 shadow-md shadow-black/25 transition-[opacity,filter] hover:brightness-[1.3] group-hover:opacity-100"
					>
						<Download size={16} />
					</button>
				</TooltipTrigger>
				<TooltipContent>Export Video</TooltipContent>
			</Tooltip>
		);
	}

	if (state.status === "invoking") {
		return (
			<div className={pillClass}>
				<Loader2 size={14} className="animate-spin text-white/60" />
				<span className="text-xs text-white/80">Starting...</span>
			</div>
		);
	}

	if (state.status === "rendering") {
		return (
			<div className={pillClass}>
				<Loader2 size={14} className="animate-spin text-white/60" />
				<div className="flex flex-col gap-1">
					<span className="text-xs text-white/80">Rendering...</span>
					<div className="h-1 w-32 overflow-hidden rounded-full bg-white/15">
						<div
							className="h-full rounded-full bg-violet-500 transition-all"
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
					className="relative grain flex items-center gap-1.5 rounded-md bg-[#1f1528]/60 px-3 py-1.5 text-xs font-medium text-violet-300 transition-[filter] hover:brightness-[1.3]"
				>
					<Download size={14} />
					{formatBytes(state.size)}
				</a>
				<button
					type="button"
					onClick={reset}
					aria-label="Dismiss"
					className="rounded-md p-1 text-white/40 hover:text-white/80"
				>
					<X size={14} />
				</button>
			</div>
		);
	}

	return (
		<div className={pillClass}>
			<span className="text-xs text-red-400">{state.message}</span>
			<button
				type="button"
				onClick={reset}
				className="text-xs text-white/60 underline hover:text-white/80"
			>
				Dismiss
			</button>
		</div>
	);
}
