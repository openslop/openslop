"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut } from "lucide-react";

interface UserProfileProps {
  email: string;
  avatarUrl?: string;
  name?: string;
}

export default function UserProfile({
  email,
  avatarUrl,
  name,
}: UserProfileProps) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const initials = email.split("@")[0].slice(0, 2).toUpperCase();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative z-[51] rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
        className="w-56 origin-center rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-md shadow-black/8 p-0 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-105 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-105"
      >
        <div className="flex h-[52px] items-center gap-3 pl-12 pr-4">
          <span className="truncate text-sm font-medium text-white/90 pl-1">
            {name || email.split("@")[0]}
          </span>
        </div>
        <div className="border-t border-white/10 p-1">
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
  );
}
