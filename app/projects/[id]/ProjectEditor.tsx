"use client";

import { useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { ConfigProvider } from "@/lib/config/ConfigProvider";
import { ScriptProvider } from "@/lib/script/ScriptProvider";
import { UserProvider } from "@/lib/user/UserProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getProjectStore } from "@/lib/project/store";
import {
	applyStoreSnapshot,
	parseStoreSnapshot,
} from "@/lib/project/storeSnapshot";
import type { ElementSnapshot } from "@/lib/generation/queue";
import { GenerationQueueProvider } from "@/lib/generation/GenerationQueueProvider";
import Editor from "@/app/components/Editor";

export default function ProjectEditor({
	projectId,
	initialScript,
	initialStore,
	initialGeneration,
	user,
}: {
	projectId: string;
	initialScript: string;
	initialStore: unknown;
	initialGeneration: Record<string, ElementSnapshot>;
	user: User;
}): ReactNode {
	// Hydrate the store once, before children render and without re-running each render.
	useState(() =>
		applyStoreSnapshot(
			getProjectStore(projectId),
			parseStoreSnapshot(initialStore),
		),
	);

	return (
		<TooltipProvider>
			<GenerationQueueProvider initialState={initialGeneration}>
				<ConfigProvider projectId={projectId}>
					<ScriptProvider initialScript={initialScript}>
						<UserProvider user={user}>
							<Editor />
						</UserProvider>
					</ScriptProvider>
				</ConfigProvider>
			</GenerationQueueProvider>
		</TooltipProvider>
	);
}
