"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth/session";
import { toastError } from "@/lib/toastError";
import { useUser } from "@/lib/user/UserProvider";
import { useTheme } from "next-themes";
import { UserAvatar } from "./UserAvatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Contrast, LogOut, Settings, User } from "@/components/ui/icon";
import ImpersonateDialog from "./ImpersonateDialog";
import { SettingsDialog } from "./settings/SettingsDialog";
import { useSettings } from "@/lib/settings/useSettings";

const IS_DEV = process.env.NODE_ENV !== "production";

const THEME_MODES = [
	{ value: "light", label: "Light" },
	{ value: "dark", label: "Dark" },
	{ value: "system", label: "System" },
];

function UserProfile() {
	const router = useRouter();
	const { theme, setTheme } = useTheme();
	const [impersonateOpen, setImpersonateOpen] = useState(false);
	const user = useUser();
	const settings = useSettings();
	const email = user.email ?? "";
	const name: string | undefined = user.user_metadata?.full_name;

	const handleLogout = async () => {
		try {
			await signOut();
		} catch (cause) {
			toastError(cause);
			return;
		}
		router.refresh();
	};

	return (
		<div className="fixed left-5 top-4 z-[100] animate-in fade-in duration-300 motion-reduce:transition-none">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						suppressHydrationWarning
						aria-label="Account menu"
						className="cursor-pointer rounded-full focus-ring"
					>
						<UserAvatar user={user} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="start" className="w-56">
					<DropdownMenuLabel className="truncate">
						{name || email.split("@")[0]}
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuSub>
						<DropdownMenuSubTrigger className="cursor-pointer">
							<Contrast />
							Appearance
						</DropdownMenuSubTrigger>
						<DropdownMenuSubContent>
							<DropdownMenuLabel className="text-label text-muted-foreground">
								Mode
							</DropdownMenuLabel>
							{THEME_MODES.map((m) => (
								<DropdownMenuItem
									key={m.value}
									onClick={() => setTheme(m.value)}
									className="cursor-pointer"
								>
									<span className="flex w-4 items-center justify-center">
										{theme === m.value && <Check className="size-3.5" />}
									</span>
									{m.label}
								</DropdownMenuItem>
							))}
						</DropdownMenuSubContent>
					</DropdownMenuSub>
					<DropdownMenuItem
						onClick={() => settings.open("models")}
						className="cursor-pointer"
					>
						<Settings />
						Settings
					</DropdownMenuItem>
					{IS_DEV && (
						<DropdownMenuItem
							onClick={() => setImpersonateOpen(true)}
							className="cursor-pointer"
						>
							<User />
							Impersonate user
							<Badge variant="caution" className="ml-auto">
								Dev
							</Badge>
						</DropdownMenuItem>
					)}
					<DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
						<LogOut />
						Log out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			<SettingsDialog />
			{IS_DEV && (
				<ImpersonateDialog
					open={impersonateOpen}
					onOpenChange={setImpersonateOpen}
				/>
			)}
		</div>
	);
}

export default memo(UserProfile);
