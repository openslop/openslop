"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { User } from "@/lib/user/user-provider";

export function UserAvatar({
	user,
	size = "default",
}: {
	user: User;
	size?: "sm" | "default" | "lg";
}) {
	const initials = user.email.split("@")[0].slice(0, 2).toUpperCase();

	return (
		<Avatar size={size}>
			{user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.email} />}
			<AvatarFallback
				className={size === "sm" ? "text-label-xs" : "text-label"}
			>
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}
