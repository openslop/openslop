"use client";

import { Mic, Palette, User } from "lucide-react";
import { AssetTile } from "@/app/components/canvas/elements/AssetTile";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProject } from "@/lib/project/useProject";
import { getProjectStore } from "@/lib/project/store";

interface ComposerAssetsProps {
	uploadingCount: number;
	onEditCharacter: (name: string) => void;
	onEditNarrator: () => void;
}

export function ComposerAssets({
	uploadingCount,
	onEditCharacter,
	onEditNarrator,
}: ComposerAssetsProps) {
	const { projectId } = useConfig();
	const referenceImages = useProject((s) => s.referenceImages);
	const characters = useProject((s) => s.metadata.characters);
	const narration = useProject((s) => s.metadata.narration);

	const hasNarration = Object.keys(narration).length > 0;
	const characterEntries = Object.entries(characters);

	const removeReferenceImage = (index: number) =>
		getProjectStore(projectId)
			.getState()
			.setReferenceImages(referenceImages.filter((_, j) => j !== index));

	return (
		<div className="flex flex-wrap gap-2 pb-2">
			{hasNarration && (
				<AssetTile
					name="Narrator"
					Icon={Mic}
					fallback="icon"
					onEdit={onEditNarrator}
				/>
			)}
			{characterEntries.map(([name, ch]) => (
				<AssetTile
					key={`character:${name}`}
					name={name}
					previewUrl={ch.avatarUrl}
					Icon={User}
					elementId={characterAvatarElementId(name)}
					onEdit={() => onEditCharacter(name)}
				/>
			))}
			{referenceImages.map((url, i) => (
				<AssetTile
					key={`ref:${url}`}
					name={`Reference ${i + 1}`}
					previewUrl={url}
					Icon={Palette}
					onRemove={() => removeReferenceImage(i)}
				/>
			))}
			{Array.from({ length: uploadingCount }).map((_, i) => (
				<div
					key={i}
					className="aspect-square w-16 shrink-0 rounded-md shimmer-surface sm:w-20"
				/>
			))}
		</div>
	);
}
