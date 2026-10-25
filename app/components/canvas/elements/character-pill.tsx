"use client";

import type { ReactNode } from "react";
import { getImageProps } from "next/image";
import { User } from "@/components/ui/icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ICON_SIZES } from "@/components/ui/icon-button";
import { useCharacterAvatar } from "../hooks/use-character-avatar";

const AVATAR_PX = { sm: 24, xs: 18 };
const FALLBACK_ICON_PX = { sm: ICON_SIZES.header, xs: ICON_SIZES.sm };

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
		// Radix keeps its "loaded" status after the image unmounts, so a new url remounts it.
		<Avatar key={avatarUrl} size={size} className={className}>
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
			<AvatarFallback className="bg-transparent text-current">
				<User size={FALLBACK_ICON_PX[size]} aria-hidden="true" />
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

export function CharacterPill({
	name,
	children,
}: {
	name?: string;
	children?: ReactNode;
}) {
	return (
		<div
			className={`relative inline-flex h-6 max-w-[140px] shrink-0 items-center rounded-md text-muted-foreground transition-colors hover:bg-button-hover hover:text-foreground ${
				name ? "gap-1.5 pl-1 pr-2" : "px-0.5"
			}`}
		>
			<CharacterAvatar name={name} className="rounded-md" />
			{name && <CharacterName name={name} />}
			{children}
		</div>
	);
}
