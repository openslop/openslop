import { execSync } from "child_process";
import { rmSync } from "fs";

export function bundleRemotionProject(bundleDir: string): void {
	execSync(`node_modules/.bin/remotion bundle --out-dir ./${bundleDir}`, {
		cwd: process.cwd(),
		stdio: "inherit",
	});
	// Remove public assets from bundle — compositions use external URLs only.
	// Prevents addBundleToSandbox from failing on nested directory creation.
	rmSync(`./${bundleDir}/public`, { recursive: true, force: true });
}
