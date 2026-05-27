"use client";

import { useState } from "react";
import { Mic, Palette, Plus, User } from "lucide-react";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { AssetTile } from "./AssetTile";
import { CharacterEditModal } from "./character/CharacterEditModal";
import { NarratorEditModal } from "./character/NarratorEditModal";
import { NewCharacterDialog } from "./character/NewCharacterDialog";
import { CollapsibleHeader } from "./CollapsibleHeader";

export function AssetsSection() {
	const { projectId } = useConfig();
	const hydrated = useProjectStore(projectId, (s) => s.hydrated);
	const characters = useProjectStore(projectId, (s) => s.metadata.characters);
	const referenceImages = useProjectStore(projectId, (s) => s.referenceImages);
	const [collapsed, setCollapsed] = useState(false);
	const [editingName, setEditingName] = useState<string | undefined>();
	const [editingNarrator, setEditingNarrator] = useState(false);
	const [creating, setCreating] = useState(false);

	if (!hydrated) return null;

	return (
		<section className="group/collapsible mb-4 select-none" aria-label="Assets">
			<CollapsibleHeader
				label="Assets"
				collapsed={collapsed}
				onToggle={() => setCollapsed((c) => !c)}
				ariaLabel={collapsed ? "Expand assets" : "Collapse assets"}
			/>
			{!collapsed && (
				<div className="flex flex-wrap gap-2">
					<AssetTile
						name="Narrator"
						Icon={Mic}
						fallback="icon"
						onEdit={() => setEditingNarrator(true)}
					/>
					<button
						type="button"
						onClick={() => setCreating(true)}
						aria-label="Add character"
						className="flex w-16 flex-col gap-1 sm:w-20"
					>
						<div className="flex aspect-square items-center justify-center rounded-md border border-dashed border-white/15 bg-white/[0.02] text-white/50 transition-colors hover:border-white/30 hover:bg-white/[0.05] hover:text-white/80">
							<Plus className="h-4 w-4" />
						</div>
						<span className="truncate text-[10px] text-white/40">New</span>
					</button>
					{Object.entries(characters).map(([name, ch]) => (
						<AssetTile
							key={`character:${name}`}
							name={name}
							previewUrl={ch.avatarUrl}
							Icon={User}
							elementId={characterAvatarElementId(name)}
							onEdit={() => setEditingName(name)}
						/>
					))}
					{referenceImages.map((url, i) => (
						<AssetTile
							key={`style:${url}`}
							name={`Reference ${i + 1}`}
							previewUrl={url}
							Icon={Palette}
						/>
					))}
				</div>
			)}
			<NewCharacterDialog
				open={creating}
				onOpenChange={setCreating}
				onCreated={(name) => {
					setCreating(false);
					setEditingName(name);
				}}
			/>
			<CharacterEditModal
				open={editingName !== undefined}
				onOpenChange={(open) => !open && setEditingName(undefined)}
				name={editingName}
			/>
			<NarratorEditModal
				open={editingNarrator}
				onOpenChange={setEditingNarrator}
			/>
		</section>
	);
}
