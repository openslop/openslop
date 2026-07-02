"use client";

import { User } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";
import { RemoveCrossButton } from "./RemoveCrossButton";

function useCharacterAvatarUrl(name?: string) {
	const { projectId } = useConfig();
	return useProjectStore(projectId, (state) =>
		name ? state.metadata.characters[name]?.avatarUrl : undefined,
	);
}

function CharacterAvatar({
	name,
	avatarUrl,
	className,
}: {
	name?: string;
	avatarUrl?: string;
	className?: string;
}) {
	const initial = name?.trim().charAt(0).toUpperCase();
	return (
		<Avatar size="sm" className={className}>
			{avatarUrl && (
				<AvatarImage
					src={avatarUrl}
					alt={name ?? "Character"}
					className="object-cover object-center"
				/>
			)}
			<AvatarFallback>
				{initial || <User className="h-3 w-3" aria-hidden="true" />}
			</AvatarFallback>
		</Avatar>
	);
}

function CharacterName({ name }: { name: string }) {
	return (
		<span className="truncate text-xs font-medium text-foreground">{name}</span>
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
			className={`group/pill relative inline-flex max-w-[140px] shrink-0 items-center rounded-md transition-colors hover:bg-button-hover ${
				name ? "gap-1.5 py-0.5 pl-1 pr-2" : "p-0.5"
			}`}
		>
			<CharacterAvatar
				name={name}
				avatarUrl={avatarUrl}
				className="rounded-md"
			/>
			{name && <CharacterName name={name} />}
			{onRemove && (
				<RemoveCrossButton
					label={`Remove ${name}`}
					onClick={onRemove}
					className="opacity-0 group-hover/pill:opacity-100"
				/>
			)}
		</div>
	);
}
