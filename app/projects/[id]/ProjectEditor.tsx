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
import type { ProjectContent } from "@/lib/project/projectDocument";
import { GenerationQueueProvider } from "@/lib/generation/GenerationQueueProvider";
import { ElementHistoryProvider } from "@/lib/generation/ElementHistoryProvider";
import { elementHistoryStorage } from "@/lib/project/elementHistory";
import Editor from "@/app/components/Editor";

export default function ProjectEditor({
	projectId,
	initial,
	user,
	providerKeys,
}: {
	projectId: string;
	initial: ProjectContent;
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
