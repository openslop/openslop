"use client";

import { useRef, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { ConfigProvider } from "@/lib/config/ConfigProvider";
import { ScriptProvider } from "@/lib/script/ScriptProvider";
import { UserProvider } from "@/lib/user/UserProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { getProjectStore } from "@/lib/project/store";
import {
	applyStoreSnapshot,
	type ProjectStoreSnapshot,
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
	initialStore: Partial<ProjectStoreSnapshot>;
	initialGeneration: Record<string, ElementSnapshot>;
	user: User;
}): ReactNode {
	const hydratedRef = useRef<true | null>(null);
	if (hydratedRef.current == null) {
		hydratedRef.current = true;
		applyStoreSnapshot(getProjectStore(projectId), initialStore);
	}

	return (
		<TooltipProvider>
			<ConfigProvider projectId={projectId}>
				<ScriptProvider initialScript={initialScript}>
					<UserProvider user={user}>
						<GenerationQueueProvider initialState={initialGeneration}>
							<Editor />
						</GenerationQueueProvider>
					</UserProvider>
				</ScriptProvider>
			</ConfigProvider>
		</TooltipProvider>
	);
}
