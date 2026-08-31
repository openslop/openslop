"use client";

import UserProfile from "./UserProfile";
import { EditorToolbar } from "./EditorToolbar";
import Canvas from "./canvas/Canvas";
import { CanvasVersionBanner } from "./canvas/CanvasVersionBanner";
import { EditorSidebar } from "./canvas/panel/EditorSidebar";
import { ProjectTitle } from "./canvas/ProjectTitle";
import { TopPlayerPanel, SidePlayerPanel } from "./video/PlayerPanel";
import { BottomDock } from "./video/BottomDock";
import { usePlayerPlacement } from "./video/PlayerPlacementContext";

export default function PostPromptView() {
	const { placement } = usePlayerPlacement();

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<div
				aria-hidden
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
			/>
			<UserProfile />

			<EditorToolbar />
			<CanvasVersionBanner />
			<div className="flex min-h-0 flex-1 overflow-hidden">
				<EditorSidebar />
				<div className="grain relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
					<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
						{placement === "top" && <TopPlayerPanel />}

						<div className="flex min-h-0 flex-1 overflow-hidden">
							<div
								className="flex-1 overflow-y-auto"
								style={{ scrollbarGutter: "stable" }}
							>
								<div className="mx-auto max-w-6xl px-4 py-4">
									<ProjectTitle />
									<Canvas />
								</div>
							</div>

							{placement === "right" && <SidePlayerPanel />}
						</div>

						<BottomDock />
					</div>
				</div>
			</div>
		</div>
	);
}
