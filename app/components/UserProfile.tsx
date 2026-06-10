"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/user/UserProvider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Moon, Sparkles } from "lucide-react";
import { useBackgroundTheme } from "@/lib/theme/backgroundTheme";

export default function UserProfile() {
	const router = useRouter();
	const user = useUser();
	const bgTheme = useBackgroundTheme((s) => s.theme);
	const toggleBgTheme = useBackgroundTheme((s) => s.toggle);
	const email = user.email ?? "";
	const avatarUrl: string | undefined = user.user_metadata?.avatar_url;
	const name: string | undefined = user.user_metadata?.full_name;

	const handleLogout = async () => {
		const supabase = createClient();
		await supabase.auth.signOut();
		router.refresh();
	};

	const initials = email.split("@")[0].slice(0, 2).toUpperCase();

	return (
		<div className="animate-in fade-in duration-300 motion-reduce:transition-none">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						suppressHydrationWarning
						className="relative z-[91] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Avatar className="h-9 w-9 cursor-pointer">
							{avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
							<AvatarFallback className="bg-white/10 text-white text-xs">
								{initials}
							</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					side="bottom"
					sideOffset={-44}
					alignOffset={-8}
					className="z-[90] w-56 origin-center rounded-3xl border border-glass-border bg-glass-fill backdrop-blur-xl shadow-md shadow-black/8 p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-105 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-105"
				>
					<div className="flex h-[52px] items-center gap-3 pl-12 pr-4">
						<span className="truncate text-sm font-medium text-white/90 pl-1">
							{name || email.split("@")[0]}
						</span>
					</div>
					<div className="border-t border-glass-border p-1">
						<DropdownMenuItem
							onSelect={(e) => {
								e.preventDefault();
								toggleBgTheme();
							}}
							className="cursor-pointer rounded-3xl py-2 my-1 text-white/70 hover:text-white focus:text-white focus:bg-white/10"
						>
							{bgTheme === "dark" ? (
								<Moon className="mr-2 h-4 w-4" />
							) : (
								<Sparkles className="mr-2 h-4 w-4" />
							)}
							Background: {bgTheme === "dark" ? "Dark" : "Purple"}
						</DropdownMenuItem>
						<DropdownMenuItem
							onClick={handleLogout}
							className="cursor-pointer rounded-3xl py-2 my-1 text-white/70 hover:text-white focus:text-white focus:bg-white/10"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
}
