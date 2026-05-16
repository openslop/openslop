"use client";

import { User, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";

function useCharacterAvatarUrl(name?: string) {
	const { projectId } = useConfig();
	return useProjectStore(projectId, (state) =>
		name ? state.metadata.characters[name]?.avatarUrl : undefined,
	);
}

function CharacterAvatar({
	name,
	avatarUrl,
}: {
	name?: string;
	avatarUrl?: string;
}) {
	const initial = name?.trim().charAt(0).toUpperCase();
	return (
		<Avatar size="sm">
			{avatarUrl && (
				<AvatarImage
					src={avatarUrl}
					alt={name ?? "Character"}
					className="object-cover object-center"
				/>
			)}
			<AvatarFallback className="bg-white/15 text-white">
				{initial || <User className="w-3 h-3" aria-hidden="true" />}
			</AvatarFallback>
		</Avatar>
	);
}

function CharacterName({ name }: { name: string }) {
	return (
		<span className="truncate text-xs font-medium text-white/80">{name}</span>
	);
}

export function CharacterBadge({ name }: { name?: string }) {
	const avatarUrl = useCharacterAvatarUrl(name);
	return (
		<div className="flex items-center gap-2 shrink-0 min-w-0 max-w-[140px]">
			<CharacterAvatar name={name} avatarUrl={avatarUrl} />
			{name && <CharacterName name={name} />}
		</div>
	);
}

export function CharacterPill({
	name,
	onRemove,
}: {
	name?: string;
	onRemove?: () => void;
}) {
	const avatarUrl = useCharacterAvatarUrl(name);
	return (
		<div
			className={`group/pill relative inline-flex items-center shrink-0 max-w-[140px] rounded-full bg-white/10 ${
				name ? "gap-1.5 pr-2" : ""
			}`}
		>
			<CharacterAvatar name={name} avatarUrl={avatarUrl} />
			{name && <CharacterName name={name} />}
			{onRemove && (
				<button
					type="button"
					aria-label={`Remove ${name}`}
					onMouseDown={(e) => e.preventDefault()}
					onClick={onRemove}
					className="absolute -top-1 -right-1 rounded-full bg-black/60 ring-1 ring-white/20 p-0.5 opacity-0 group-hover/pill:opacity-100 transition-opacity cursor-pointer hover:bg-black/80"
				>
					<X className="w-2.5 h-2.5 text-white" />
				</button>
			)}
		</div>
	);
}
