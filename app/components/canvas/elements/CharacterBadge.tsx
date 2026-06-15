"use client";

import { User, X } from "@/components/ui/icon";
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
				<button
					type="button"
					aria-label={`Remove ${name}`}
					onMouseDown={(e) => e.preventDefault()}
					onClick={onRemove}
					className="absolute -top-1 -right-1 flex cursor-pointer items-center justify-center rounded-full border border-border bg-popover p-0.5 opacity-0 transition-opacity group-hover/pill:opacity-100 hover:bg-muted"
				>
					<X className="h-2.5 w-2.5 text-foreground" />
				</button>
			)}
		</div>
	);
}
