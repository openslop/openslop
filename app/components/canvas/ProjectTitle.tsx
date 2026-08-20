"use client";

import { useState } from "react";
import { Pencil } from "@/components/ui/icon";
import { useProject } from "@/lib/project/useProject";
import { useSloppy } from "../sloppy/SloppyProvider";

export function ProjectTitle() {
	const title = useProject((s) => s.metadata.title);
	const updateMetadata = useProject((s) => s.updateMetadata);
	const { loading } = useSloppy();
	const [editing, setEditing] = useState(false);
	const [draft, setDraft] = useState("");

	if (!title && !editing) {
		if (!loading) return null;
		return (
			<div className="mb-3 flex h-8 items-center">
				<div className="shimmer-surface h-7 w-48 rounded-md" />
			</div>
		);
	}

	const commit = () => {
		const next = draft.trim();
		if (next && next !== title) {
			updateMetadata({ title: next });
		}
		setEditing(false);
	};

	const startEditing = () => {
		setDraft(title);
		setEditing(true);
	};

	if (editing) {
		return (
			<input
				autoFocus
				value={draft}
				onChange={(e) => setDraft(e.target.value)}
				onBlur={commit}
				onFocus={(e) => e.currentTarget.select()}
				onKeyDown={(e) => {
					if (e.key === "Enter") commit();
					else if (e.key === "Escape") setEditing(false);
				}}
				className="mb-3 w-full bg-transparent font-body text-heading font-semibold text-foreground outline-none"
				aria-label="Project title"
			/>
		);
	}

	return (
		<div className="group mb-3 flex items-center gap-2">
			<h1 className="font-body text-heading font-semibold text-foreground">
				{title}
			</h1>
			<button
				type="button"
				onClick={startEditing}
				className="rounded p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-muted hover:text-foreground group-hover:opacity-100"
				aria-label="Edit title"
			>
				<Pencil className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}
