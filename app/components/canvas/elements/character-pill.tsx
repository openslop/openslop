"use client";

import { getImageProps } from "next/image";
import { User } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCharacterAvatar } from "../hooks/use-character-avatar";

const AVATAR_PX = { sm: 24, xs: 18 };

export function CharacterAvatar({
	name,
	size = "sm",
	className,
}: {
	name?: string;
	size?: keyof typeof AVATAR_PX;
	className?: string;
}) {
	const { url: avatarUrl } = useCharacterAvatar(name);
	return (
		<Avatar size={size} className={className}>
			{/* Radix preloads whatever `src` it gets, so hand it the optimizer's size, not the original. */}
			{avatarUrl && (
				<AvatarImage
					{...getImageProps({
						src: avatarUrl,
						alt: name ?? "Character",
						width: AVATAR_PX[size],
						height: AVATAR_PX[size],
					}).props}
					className="object-cover object-center"
				/>
			)}
			{/* One placeholder for every character slot: no character picked and an
			    avatar-less character (the narrator) read the same, as "pick a
			    character" in the element's own media tint. */}
			<AvatarFallback className="bg-media-character/15 text-media-character">
				<User
					className={size === "sm" ? "size-3.5" : "size-3"}
					aria-hidden="true"
				/>
			</AvatarFallback>
		</Avatar>
	);
}

function CharacterName({ name }: { name: string }) {
	return (
		<span className="truncate text-label-xs font-medium text-foreground">
			{name}
		</span>
	);
}

export function CharacterPill({ name }: { name?: string }) {
	return (
		<div
			className={`inline-flex h-6 max-w-[140px] shrink-0 items-center rounded-md transition-colors hover:bg-button-hover ${
				name ? "gap-1.5 pl-1 pr-2" : "px-0.5"
			}`}
		>
			<CharacterAvatar name={name} className="rounded-md" />
			{name && <CharacterName name={name} />}
		</div>
	);
}
