"use client";

import { DotGrid } from "@/components/ui/dot-grid";
import { Input } from "@/components/ui/input";
import { UNTITLED_PROJECT } from "@/lib/project/project-document";
import { useProject } from "@/lib/project/use-project";
import UserProfile from "./user-profile";
import { EditorToolbar } from "./editor-toolbar";
import Canvas from "./canvas/canvas";
import { CanvasVersionBanner } from "./canvas/canvas-version-banner";
import {
	AssetStrip,
	AssetStripArtStyle,
	AssetStripCharacters,
	AssetStripReferences,
} from "./canvas/elements/asset-strip";
import { EditorSidebar } from "./canvas/panel/editor-sidebar";
import { TopPlayerPanel, SidePlayerPanel } from "./player/player-panel";
import { BottomDock } from "./player/bottom-dock";
import { usePlayerPlacement } from "./player/player-placement-context";

function ProjectTitle() {
	const title = useProject((state) => state.title);
	const setTitle = useProject((state) => state.setTitle);

	return (
		<h1 className="mb-3">
			<Input
				variant="bare"
				size="heading"
				value={title}
				onChange={(event) => setTitle(event.target.value)}
				placeholder={UNTITLED_PROJECT}
				aria-label="Project title"
				autoComplete="off"
			/>
		</h1>
	);
}

export default function PostPromptView() {
	const { placement } = usePlayerPlacement();

	return (
		<div className="relative flex h-screen w-full flex-col overflow-hidden">
			<DotGrid />
			<UserProfile />

			<EditorToolbar />
			<CanvasVersionBanner />
			<div className="flex min-h-0 flex-1 overflow-hidden">
				<EditorSidebar />
				<div className="grain relative mr-2 mb-2 flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-element-card shadow-elevation-5">
					<div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden">
						{placement === "top" && <TopPlayerPanel />}

						<div className="flex min-h-0 flex-1 overflow-hidden">
							<div className="flex-1 overflow-y-auto [scrollbar-gutter:stable]">
								<div className="mx-auto max-w-6xl px-4 py-4">
									<ProjectTitle />
									<AssetStrip>
										<AssetStripArtStyle />
										<AssetStripCharacters />
										<AssetStripReferences />
									</AssetStrip>
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
