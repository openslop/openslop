"use client";

import { useState } from "react";
import { PanelLeft } from "lucide-react";
import UserProfile from "@/app/components/UserProfile";
import BackToMySlopLink from "@/app/components/BackToMySlopLink";
import AutoScrollPanel from "./AutoScrollPanel";
import PlayerPositionPanel from "./PlayerPositionPanel";
import TransitionPanel from "./TransitionPanel";
import ViewModePanel from "./ViewModePanel";

export default function Sidebar() {
	const [open, setOpen] = useState(false);
	const onToggle = () => setOpen((prev) => !prev);
	return (
		<>
			{open && (
				<div className="fixed left-4 top-4 z-[100]">
					<UserProfile />
				</div>
			)}
			<div
				className={`fixed top-0 left-0 h-full z-[80] w-[calc(14rem+2.5rem)] transition-transform duration-300 motion-reduce:transition-none ${
					open ? "translate-x-0" : "-translate-x-52 pointer-events-none"
				}`}
			>
				<div
					className={`absolute inset-0 bg-glass-fill backdrop-blur-xl shadow-[2px_0_50px_rgba(0,0,0,0.25)] border-r border-glass-border transition-opacity duration-300 motion-reduce:transition-none ${
						open ? "opacity-100" : "opacity-0"
					}`}
				/>
				<div className="relative pt-6 px-2">
					<button
						type="button"
						onClick={onToggle}
						aria-label={open ? "Close sidebar" : "Open sidebar"}
						className="pointer-events-auto absolute right-2 top-6 p-1.5 rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
					>
						<PanelLeft size={23} strokeWidth={1} aria-hidden="true" />
					</button>

					{open && (
						<div className="mt-10 px-2 flex flex-col gap-4">
							<BackToMySlopLink />
							<PlayerPositionPanel />
							<AutoScrollPanel />
							<TransitionPanel />
							<ViewModePanel />
						</div>
					)}
				</div>
			</div>
		</>
	);
}
