"use client";

import type { OAuthGrant } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Mcp } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { Separator } from "@/components/ui/separator";
import { MCP_PATH } from "@/lib/agent/mcp/bridge";
import { useClientValue } from "@/lib/components/use-client-value";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast-error";
import { SettingsList, SettingsRow, SettingsSection } from "./settings-section";

function CopyField({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center gap-2">
			<Input readOnly value={value} aria-label={label} size="sm" />
			<CopyButton text={value} label={`Copy ${label}`} />
		</div>
	);
}

function ConnectedAgents() {
	const [grants, setGrants] = useState<OAuthGrant[]>();

	useEffect(() => {
		const load = () =>
			void createClient()
				.auth.oauth.listGrants()
				.then(({ data, error }) => {
					if (error) return toastError(error);
					setGrants(data);
				});
		load();
		window.addEventListener("focus", load);
		return () => window.removeEventListener("focus", load);
	}, []);

	const disconnect = async ({ client }: OAuthGrant) => {
		const { error } = await createClient().auth.oauth.revokeGrant({
			clientId: client.id,
		});
		if (error) return toastError(error);
		setGrants((current) =>
			current?.filter((grant) => grant.client.id !== client.id),
		);
	};

	if (!grants) return null;
	if (grants.length === 0)
		return (
			<EmptyState
				icon={Mcp}
				title="No agents connected yet"
				description="An agent shows up here once you allow it."
			/>
		);
	return (
		<SettingsList>
			{grants.map((grant) => (
				<SettingsRow key={grant.client.id} label={grant.client.name}>
					<Button
						size="sm"
						variant="destructive"
						onClick={() => void disconnect(grant)}
					>
						Disconnect
					</Button>
				</SettingsRow>
			))}
		</SettingsList>
	);
}

/** How the user's own agent drives OpenSlop over MCP, and which agents they have let in. */
export function McpTab() {
	const url = useClientValue(
		() => `${window.location.origin}${MCP_PATH}`,
		MCP_PATH,
	);

	return (
		<div className="flex flex-col gap-6">
			<SectionTitle>MCP</SectionTitle>
			<p className="text-label text-muted-foreground">
				Let your own coding agent, like Claude Code, Codex or Cursor, work in
				OpenSlop on its own sign-in. Add the server URL to it as an MCP server,
				sign in and allow it when it opens the browser, then open a project. It
				edits the project you opened last with Sloppy&apos;s tools, and you
				watch the changes land.
			</p>

			<SettingsSection title="Connect">
				<CopyField label="Server URL" value={url} />
				<CopyField
					label="Claude Code command"
					value={`claude mcp add --transport http openslop ${url}`}
				/>
			</SettingsSection>

			<Separator />

			<SettingsSection title="Connected agents">
				<ConnectedAgents />
			</SettingsSection>
		</div>
	);
}
