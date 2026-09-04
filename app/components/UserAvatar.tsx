"use client";

import type { User } from "@supabase/supabase-js";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserAvatar({
	user,
	size = "default",
}: {
	user: User;
	size?: "sm" | "default" | "lg";
}) {
	const email = user.email ?? "";
	const avatarUrl: string | undefined = user.user_metadata.avatar_url;
	const initials = email.split("@")[0].slice(0, 2).toUpperCase();

	return (
		<Avatar size={size}>
			{avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
			<AvatarFallback
				className={size === "sm" ? "text-label-xs" : "text-label"}
			>
				{initials}
			</AvatarFallback>
		</Avatar>
	);
}
