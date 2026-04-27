"use client";

import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useConfig } from "@/lib/config/ConfigProvider";
import { useProjectStore } from "@/lib/project/store";

export function CharacterBadge({ name }: { name?: string }) {
	const { projectId } = useConfig();
	const avatarUrl = useProjectStore(projectId, (state) =>
		name ? state.metadata.characters[name]?.avatarUrl : undefined,
	);
	const initial = name?.trim().charAt(0).toUpperCase();

	return (
		<div className="flex items-center gap-2 shrink-0 min-w-0 max-w-[140px]">
			<Avatar size="sm" className="bg-white/10">
				{avatarUrl && (
					<AvatarImage
						src={avatarUrl}
						alt={name ?? "Character"}
						className="object-cover object-center"
					/>
				)}
				<AvatarFallback className="bg-white/10 text-white">
					{initial || <User className="w-3 h-3" aria-hidden="true" />}
				</AvatarFallback>
			</Avatar>
			{name && (
				<span className="truncate text-xs font-medium text-white/80">
					{name}
				</span>
			)}
		</div>
	);
}
