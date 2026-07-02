"use client";

import { Mic, Palette, User } from "@/components/ui/icon";
import { AssetTile } from "@/app/components/canvas/elements/AssetTile";
import { characterAvatarElementId } from "@/lib/project/ensureCharacterAvatars";
import { useGenerationQueue } from "@/lib/generation/GenerationQueueProvider";
import { useProject } from "@/lib/project/useProject";

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
	const queue = useGenerationQueue();
	const referenceImages = useProject((s) => s.referenceImages);
	const characters = useProject((s) => s.metadata.characters);
	const narration = useProject((s) => s.metadata.narration);
	const removeReferenceImage = useProject((s) => s.removeReferenceImage);
	const removeCharacterFromStore = useProject((s) => s.removeCharacter);

	const hasNarration = Object.keys(narration).length > 0;
	const characterEntries = Object.entries(characters);

	const removeCharacter = (name: string) => {
		queue.discard(characterAvatarElementId(name));
		removeCharacterFromStore(name);
	};

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
					onRemove={() => removeCharacter(name)}
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
