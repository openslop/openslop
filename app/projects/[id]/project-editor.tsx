"use client";

import { useState, type ReactNode } from "react";
import type { SloppyMessage } from "@/lib/agent/types";
import type { ProviderKeyRecord } from "@/lib/connectors/provider-key";
import { ScriptProvider } from "@/lib/script/script-provider";
import type { Account } from "@/lib/user/account";
import { UserProvider } from "@/lib/user/user-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createProjectStore } from "@/lib/project/store";
import { ProjectProvider } from "@/lib/project/project-provider";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import type { SavedProject } from "@/lib/project/saved-project";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { ElementHistoryProvider } from "@/lib/generation/element-history-provider";
import { elementHistoryStorage } from "@/lib/project/element-history";
import Editor from "@/app/components/editor";

export default function ProjectEditor({
	projectId,
	initial,
	initialTranscript,
	account,
	providerKeys,
}: {
	projectId: string;
	initial: SavedProject;
	initialTranscript: SloppyMessage[];
	account: Account;
	providerKeys: ProviderKeyRecord[];
}): ReactNode {
	const [store] = useState(() => createProjectStore(initial.store));

	return (
		<TooltipProvider>
			<UserProvider account={account} providerKeys={providerKeys}>
				<GenerationQueueProvider initialState={initial.generation}>
					<ElementHistoryProvider storage={elementHistoryStorage(projectId)}>
						<ProjectStoreProvider store={store}>
							<ProjectProvider
								projectId={projectId}
								initialTranscript={initialTranscript}
							>
								<ScriptProvider initialScript={initial.script}>
									<Editor />
								</ScriptProvider>
							</ProjectProvider>
						</ProjectStoreProvider>
					</ElementHistoryProvider>
				</GenerationQueueProvider>
			</UserProvider>
		</TooltipProvider>
	);
}
