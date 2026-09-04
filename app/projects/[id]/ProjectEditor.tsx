"use client";

import { useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { ProviderKeyRecord } from "@/lib/connectors/providerKey";
import { ConfigProvider } from "@/lib/config/ConfigProvider";
import { ScriptProvider } from "@/lib/script/ScriptProvider";
import { UserProvider } from "@/lib/user/UserProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createProjectStore } from "@/lib/project/store";
import { ProjectStoreProvider } from "@/lib/project/ProjectStoreProvider";
import {
	applyStoreSnapshot,
	parseStoreSnapshot,
} from "@/lib/project/storeSnapshot";
import type { ElementSnapshot } from "@/lib/generation/snapshots";
import { GenerationQueueProvider } from "@/lib/generation/GenerationQueueProvider";
import { ElementHistoryProvider } from "@/lib/generation/ElementHistoryProvider";
import { elementHistoryStorage } from "@/lib/project/elementHistory";
import Editor from "@/app/components/Editor";

export default function ProjectEditor({
	projectId,
	initialScript,
	initialStore,
	initialGeneration,
	user,
	providerKeys,
}: {
	projectId: string;
	initialScript: string;
	initialStore: unknown;
	initialGeneration: Record<string, ElementSnapshot>;
	user: User;
	providerKeys: ProviderKeyRecord[];
}): ReactNode {
	const [store] = useState(() => {
		const created = createProjectStore();
		applyStoreSnapshot(created, parseStoreSnapshot(initialStore));
		return created;
	});

	return (
		<TooltipProvider>
			<UserProvider user={user} providerKeys={providerKeys}>
				<GenerationQueueProvider initialState={initialGeneration}>
					<ElementHistoryProvider storage={elementHistoryStorage(projectId)}>
						<ProjectStoreProvider store={store}>
							<ConfigProvider projectId={projectId}>
								<ScriptProvider initialScript={initialScript}>
									<Editor />
								</ScriptProvider>
							</ConfigProvider>
						</ProjectStoreProvider>
					</ElementHistoryProvider>
				</GenerationQueueProvider>
			</UserProvider>
		</TooltipProvider>
	);
}
