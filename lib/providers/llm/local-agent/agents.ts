import { spawn } from "node:child_process";
import { Readable, Writable } from "node:stream";
import * as acp from "@agentclientprotocol/sdk";
import pick from "lodash/pick";

export type Agent = {
	context: acp.ClientContext;
	capabilities: acp.AgentCapabilities;
};

/** Kinds that change something on this computer. Anything else is safe to allow. */
const SIDE_EFFECTS: acp.ToolKind[] = ["edit", "delete", "move", "execute"];

/** Enough of the user's environment for an agent to find itself and its sign-in, and none of the app's secrets. */
const PASSED_ENV = [
	"PATH",
	"HOME",
	"USER",
	"LOGNAME",
	"SHELL",
	"LANG",
	"TMPDIR",
	"XDG_CONFIG_HOME",
	"XDG_DATA_HOME",
	"XDG_CACHE_HOME",
	"XDG_RUNTIME_DIR",
	"HTTP_PROXY",
	"HTTPS_PROXY",
	"NO_PROXY",
	"NODE_EXTRA_CA_CERTS",
	"SYSTEMROOT",
	"COMSPEC",
	"PATHEXT",
	"USERPROFILE",
	"APPDATA",
	"LOCALAPPDATA",
];

// Next types NODE_ENV as always set, but an agent should not inherit the app's.
const agentEnv = () => pick(process.env, PASSED_ENV) as NodeJS.ProcessEnv;

function permit({
	toolCall,
	options,
}: acp.RequestPermissionRequest): acp.RequestPermissionResponse {
	const allowed = !SIDE_EFFECTS.includes(toolCall.kind ?? "other");
	const option = options.find(
		({ kind }) => kind === (allowed ? "allow_once" : "reject_once"),
	);
	return {
		outcome: option
			? { outcome: "selected", optionId: option.optionId }
			: { outcome: "cancelled" },
	};
}

const client = acp
	.client({ name: "openslop" })
	.onRequest(acp.methods.client.session.requestPermission, ({ params }) =>
		permit(params),
	);

const running = new Map<string, Promise<Agent>>();

async function start(command: string): Promise<Agent> {
	const [bin, ...args] = command.split(" ");
	const child = spawn(bin, args, {
		env: agentEnv(),
		stdio: ["pipe", "pipe", "ignore"],
	});
	let spawnError: NodeJS.ErrnoException | undefined;
	child.once("error", (error) => (spawnError = error));
	child.once("close", () => running.delete(command));
	const connection = client.connect(
		acp.ndJsonStream(
			Writable.toWeb(child.stdin),
			Readable.toWeb(child.stdout) as ReadableStream<Uint8Array>,
		),
	);
	try {
		const { agentCapabilities } = await connection.agent.request(
			acp.methods.agent.initialize,
			{ protocolVersion: acp.PROTOCOL_VERSION, clientCapabilities: {} },
		);
		return { context: connection.agent, capabilities: agentCapabilities ?? {} };
	} catch (error) {
		child.kill();
		if (spawnError?.code === "ENOENT")
			throw new Error(`Install \`${bin}\` on this computer, then retry.`);
		throw new Error(`\`${command}\` did not start as an ACP agent.`, {
			cause: spawnError ?? error,
		});
	}
}

/** One process per agent, started on first use and kept for every session after. */
export function agentFor(command: string): Promise<Agent> {
	const existing = running.get(command);
	if (existing) return existing;
	const agent = start(command);
	running.set(command, agent);
	return agent;
}
