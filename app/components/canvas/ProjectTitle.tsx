"use client";

import { useState } from "react";
import { Pencil } from "@/components/ui/icon";
import { IconButton } from "@/components/ui/icon-button";
import { Skeleton } from "@/components/ui/skeleton";
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
				<Skeleton className="h-7 w-48" />
			</div>
		);
	}

	const commit = () => {
		const next = draft.trim();
		if (next && next !== title) updateMetadata({ title: next });
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
			<IconButton
				ariaLabel="Edit title"
				size="sm"
				variant="quiet"
				className="opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
				onClick={startEditing}
			>
				<Pencil size={14} />
			</IconButton>
		</div>
	);
}
