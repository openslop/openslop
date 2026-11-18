// `npm run local`: OpenSlop on this machine, on a local Supabase, with no hosted infra.
import { spawn, spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const LOCAL_EMAIL = "local@openslop.local";
const LOCAL_BUCKET = readFileSync("supabase/config.toml", "utf8").match(
	/^\[storage\.buckets\.([\w-]+)\]\r?$/m,
)[1];
// Relative, so a space in the user's folder path survives the Windows shell
const REMOTION_BUNDLE = ".remotion/bundle";

function fail(message) {
	console.error(`\n${message}\n`);
	process.exit(1);
}

function npx(args, { capture = false, hint = "" } = {}) {
	const result = spawnSync("npx", args, {
		stdio: ["inherit", capture ? "pipe" : "inherit", "inherit"],
		shell: process.platform === "win32",
	});
	if (result.status !== 0) fail(`\`npx ${args.join(" ")}\` failed. ${hint}`);
	return result.stdout?.toString();
}

function openBrowser(url) {
	const [command, ...args] = {
		darwin: ["open"],
		win32: ["cmd", "/c", "start", '""'],
	}[process.platform] ?? ["xdg-open"];
	spawn(command, [...args, url], {
		stdio: "ignore",
		detached: true,
	}).unref();
}

async function ensureLocalUser(url, secretKey) {
	const supabase = createClient(url, secretKey);
	const { error } = await supabase.auth.admin.createUser({
		email: LOCAL_EMAIL,
		email_confirm: true,
	});
	if (error && error.code !== "email_exists") fail(error.message);
}

if (Number(process.versions.node.split(".")[0]) < 22)
	fail(
		`OpenSlop needs Node.js 22 or newer, and this is ${process.version}. Get it from https://nodejs.org`,
	);

const { env } = JSON.parse(
	npx(["supabase", "start", "--output-format", "json"], {
		capture: true,
		hint: "On Windows or an Intel Mac, install Docker Desktop (https://www.docker.com/products/docker-desktop/), open it, then run `npm run local` again.",
	}),
);
npx(["supabase", "migration", "up"]);
npx(["supabase", "seed", "buckets"]);
await ensureLocalUser(env.API_URL, env.SECRET_KEY);

npx([
	"remotion",
	"bundle",
	"remotion/index.ts",
	`--out-dir=${REMOTION_BUNDLE}`,
]);
npx(["remotion", "browser", "ensure"]);

const next = spawn("npx", ["next", "dev", "-H", "localhost"], {
	stdio: ["inherit", "pipe", "inherit"],
	shell: process.platform === "win32",
	env: {
		...process.env,
		NEXT_PUBLIC_OPENSLOP_LOCAL: "1",
		NEXT_PUBLIC_SUPABASE_URL: env.API_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: env.ANON_KEY,
		SUPABASE_SECRET_KEY: env.SECRET_KEY,
		NEXT_PUBLIC_LOCAL_BUCKET: LOCAL_BUCKET,
		REMOTION_SERVE_URL: path.resolve(REMOTION_BUNDLE),
		NEXT_PUBLIC_BLOB_URL: `${env.API_URL}/storage/v1/object/public/${LOCAL_BUCKET}`,
	},
});

let opened = false;
next.stdout.on("data", (chunk) => {
	process.stdout.write(chunk);
	const appUrl = chunk.toString().match(/Local:\s+(http\S+)/)?.[1];
	if (appUrl && !opened) {
		opened = true;
		openBrowser(`${appUrl}/api/dev/impersonate?email=${LOCAL_EMAIL}`);
	}
});

// Ctrl+C reaches next too; stop Supabase once it has exited
process.on("SIGINT", () => {});
next.on("exit", (code) => {
	npx(["supabase", "stop"]);
	process.exit(code ?? 0);
});
