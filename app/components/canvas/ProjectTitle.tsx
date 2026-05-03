"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { getProjectStore, useProjectStore } from "@/lib/project/store";
import { useScript } from "@/lib/script/ScriptProvider";

export function ProjectTitle() {
	const { projectId } = useConfig();
	const title = useProjectStore(projectId, (s) => s.metadata.title);
	const { loading } = useScript();
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
			getProjectStore(projectId).getState().updateMetadata({ title: next });
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
				className="mb-3 w-full bg-transparent text-2xl font-semibold text-white/90 outline-none"
				aria-label="Project title"
			/>
		);
	}

	return (
		<div className="group mb-3 flex items-center gap-2">
			<h1 className="text-2xl font-semibold text-white/90">{title}</h1>
			<button
				type="button"
				onClick={startEditing}
				className="rounded p-1 text-white/40 opacity-0 transition-opacity hover:bg-white/10 hover:text-white/80 group-hover:opacity-100"
				aria-label="Edit title"
			>
				<Pencil className="h-3.5 w-3.5" />
			</button>
		</div>
	);
}
