"use client";

import { memo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signOut } from "@/lib/auth/session";
import { errorMessage } from "@/lib/errors";
import { useUser } from "@/lib/user/UserProvider";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Check, Contrast, LogOut, User } from "@/components/ui/icon";
import ImpersonateDialog from "./ImpersonateDialog";

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
	const email = user.email ?? "";
	const avatarUrl: string | undefined = user.user_metadata?.avatar_url;
	const name: string | undefined = user.user_metadata?.full_name;

	const handleLogout = async () => {
		try {
			await signOut();
		} catch (cause) {
			toast.error(errorMessage(cause));
			return;
		}
		router.refresh();
	};

	const initials = email.split("@")[0].slice(0, 2).toUpperCase();

	return (
		<div className="fixed left-5 top-4 z-[100] animate-in fade-in duration-300 motion-reduce:transition-none">
			<DropdownMenu modal={false}>
				<DropdownMenuTrigger asChild>
					<button
						type="button"
						suppressHydrationWarning
						aria-label="Account menu"
						className="relative z-[91] rounded-full focus-ring"
					>
						<Avatar className="h-9 w-9 cursor-pointer">
							{avatarUrl && <AvatarImage src={avatarUrl} alt={email} />}
							<AvatarFallback className="text-label">{initials}</AvatarFallback>
						</Avatar>
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent
					align="start"
					side="bottom"
					sideOffset={-44}
					alignOffset={-8}
					className="z-[90] w-56 origin-center rounded-2xl p-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-105 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-105"
				>
					<div className="flex h-[52px] items-center gap-3 pr-4 pl-12">
						<span className="truncate pl-1 text-body font-medium text-foreground">
							{name || email.split("@")[0]}
						</span>
					</div>
					<div className="border-t border-border p-1">
						<DropdownMenuSub>
							<DropdownMenuSubTrigger className="my-1 cursor-pointer rounded-xl py-2">
								<Contrast className="mr-2 h-4 w-4" />
								Appearance
							</DropdownMenuSubTrigger>
							<DropdownMenuSubContent className="rounded-xl">
								<DropdownMenuLabel className="text-label text-muted-foreground">
									Mode
								</DropdownMenuLabel>
								{THEME_MODES.map((m) => (
									<DropdownMenuItem
										key={m.value}
										onClick={() => setTheme(m.value)}
										className="cursor-pointer rounded-lg"
									>
										<span className="flex w-4 items-center justify-center">
											{theme === m.value && <Check className="h-3.5 w-3.5" />}
										</span>
										{m.label}
									</DropdownMenuItem>
								))}
							</DropdownMenuSubContent>
						</DropdownMenuSub>
						{IS_DEV && (
							<DropdownMenuItem
								onClick={() => setImpersonateOpen(true)}
								className="my-1 cursor-pointer rounded-xl py-2"
							>
								<User className="mr-2 h-4 w-4" />
								Impersonate user
								<Badge variant="caution" className="ml-auto">
									Dev
								</Badge>
							</DropdownMenuItem>
						)}
						<DropdownMenuItem
							onClick={handleLogout}
							className="my-1 cursor-pointer rounded-xl py-2"
						>
							<LogOut className="mr-2 h-4 w-4" />
							Log out
						</DropdownMenuItem>
					</div>
				</DropdownMenuContent>
			</DropdownMenu>
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
