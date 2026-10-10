"use client";

import { useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import type { ProviderKeyRecord } from "@/lib/connectors/provider-key";
import { ConfigProvider } from "@/lib/config/config-provider";
import { ScriptProvider } from "@/lib/script/script-provider";
import { UserProvider } from "@/lib/user/user-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createProjectStore } from "@/lib/project/store";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import type { SavedProject } from "@/lib/project/saved-project";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { ElementHistoryProvider } from "@/lib/generation/element-history-provider";
import { elementHistoryStorage } from "@/lib/project/element-history";
import Editor from "@/app/components/editor";

export default function ProjectEditor({
	projectId,
	initial,
	user,
	providerKeys,
}: {
	projectId: string;
	initial: SavedProject;
	user: User;
	providerKeys: ProviderKeyRecord[];
}): ReactNode {
	const [store] = useState(() => createProjectStore(initial.store));

	return (
		<TooltipProvider>
			<UserProvider user={user} providerKeys={providerKeys}>
				<GenerationQueueProvider initialState={initial.generation}>
					<ElementHistoryProvider storage={elementHistoryStorage(projectId)}>
						<ProjectStoreProvider store={store}>
							<ConfigProvider projectId={projectId}>
								<ScriptProvider initialScript={initial.script}>
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
