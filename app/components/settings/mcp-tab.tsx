"use client";

import type { OAuthGrant } from "@supabase/supabase-js";
import Image, { type StaticImageData } from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/ui/copy-button";
import { EmptyState } from "@/components/ui/empty-state";
import { Mcp } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { SectionTitle } from "@/components/ui/section-title";
import { Separator } from "@/components/ui/separator";
import { agentMark } from "@/lib/agent/mcp/agent-marks";
import { MCP_PATH } from "@/lib/agent/mcp/bridge";
import { useClientValue } from "@/lib/components/use-client-value";
import { createClient } from "@/lib/supabase/client";
import { toastError } from "@/lib/toast-error";
import { cn } from "@/lib/utils";
import { SettingsList, SettingsRow, SettingsSection } from "./settings-section";

function CopyField({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-center gap-2">
			<Input readOnly value={value} aria-label={label} size="sm" />
			<CopyButton text={value} label={`Copy ${label}`} />
		</div>
	);
}

function LogoImage({
	src,
	className,
}: {
	src: StaticImageData;
	className?: string;
}) {
	return (
		<Image
			src={src}
			alt=""
			width={16}
			height={16}
			unoptimized
			className={cn("size-4 shrink-0 object-contain", className)}
		/>
	);
}

function AgentLogo({ name }: { name: string }) {
	const mark = agentMark(name);
	if (!mark) return <Mcp size={16} aria-hidden="true" />;
	if (!mark.dark) return <LogoImage src={mark.light} />;
	return (
		<>
			<LogoImage src={mark.light} className="dark:hidden" />
			<LogoImage src={mark.dark} className="hidden dark:block" />
		</>
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
				<SettingsRow
					key={grant.client.id}
					label={
						<>
							<AgentLogo name={grant.client.name} />
							{grant.client.name}
						</>
					}
				>
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
				Let your AI agent work on your projects. Sign in when it asks, then keep
				a project open here.
			</p>

			<SettingsSection title="Paste this into your agent">
				<CopyField
					label="Prompt"
					value={`Add OpenSlop as an MCP server: ${url}`}
				/>
			</SettingsSection>

			<Separator />

			<SettingsSection title="Connected agents">
				<ConnectedAgents />
			</SettingsSection>
		</div>
	);
}
