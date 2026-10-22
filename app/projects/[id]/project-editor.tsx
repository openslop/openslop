"use client";

import { useState, type ReactNode } from "react";
import type { SloppyMessage } from "@/lib/agent/types";
import type { ProviderKeyRecord } from "@/lib/connectors/provider-key";
import type { Account } from "@/lib/user/account";
import { UserProvider } from "@/lib/user/user-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { createProjectStore } from "@/lib/project/store";
import { ProjectProvider } from "@/lib/project/project-provider";
import { ProjectStoreProvider } from "@/lib/project/project-store-provider";
import type { SavedProject } from "@/lib/project/saved-project";
import { GenerationQueueProvider } from "@/lib/generation/generation-queue-provider";
import { elementHistoryStorage } from "@/lib/project/element-history";
import { CanvasProviders } from "@/app/components/canvas/canvas-providers";
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
				<GenerationQueueProvider
					initialState={initial.generation}
					storage={elementHistoryStorage(projectId)}
				>
					<ProjectStoreProvider store={store}>
						<ProjectProvider
							projectId={projectId}
							initialScript={initial.script}
							initialTranscript={initialTranscript}
						>
							<CanvasProviders>
								<Editor />
							</CanvasProviders>
						</ProjectProvider>
					</ProjectStoreProvider>
				</GenerationQueueProvider>
			</UserProvider>
		</TooltipProvider>
	);
}
