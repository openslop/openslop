import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
	title: "404 · OpenSlop",
	description: "The page you asked for was generated, and it came out wrong.",
};

/**
 * Rotating deadpan excuses for a failed generation. Indexed from request
 * headers (server-only) so the pick is stable within a render and never
 * hydrates against a different value (issue #651).
 */
const EXCUSES = [
	"The model was very confident about this one.",
	"This page was in the training data. It is not in the app.",
	"Generated 4 variations. All of them were this.",
	"404 tokens in, zero pages out.",
	"We regenerated it. It got worse.",
	"The URL you typed is plausible. That is the whole problem.",
] as const;

function excuseIndex(seed: string): number {
	let h = 0;
	for (let i = 0; i < seed.length; i++) {
		h = (h * 31 + seed.charCodeAt(i)) >>> 0;
	}
	return h % EXCUSES.length;
}

export default async function NotFound() {
	const h = await headers();
	const seed =
		h.get("x-request-id") ??
		h.get("x-vercel-id") ??
		h.get("user-agent") ??
		"openslop-404";
	const excuse = EXCUSES[excuseIndex(seed)] ?? EXCUSES[0];

	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<div
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
				aria-hidden
			/>

			<main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center gap-8 px-6 py-16 text-center">
				<div className="flex flex-col items-center gap-3">
					{/* Hallucinated display number: one mirrored glyph, one slightly off zero. */}
					<p
						aria-label="404"
						className="font-title text-display text-foreground select-none"
					>
						<span className="inline-block scale-x-[-1]">4</span>
						<span className="inline-block origin-center scale-y-90 opacity-90">
							0
						</span>
						<span>4</span>
					</p>
					<p className="font-numeric text-label text-muted-foreground">
						confidence: 0.03 · this page is 12% real
					</p>
					<h1 className="font-title text-heading text-foreground text-balance">
						The page you asked for was generated, and it came out wrong.
					</h1>
					<p className="text-body text-muted-foreground text-balance">
						{excuse}
					</p>
				</div>

				{/* Fake storyboard element card: a failed generation of this route. */}
				<section
					aria-label="Failed generation"
					className="grain relative w-full overflow-hidden rounded-xl border border-border bg-element-card p-4 text-left shadow-elevation-1"
				>
					<div className="mb-3 flex items-start justify-between gap-3">
						<div className="flex items-center gap-2">
							<span
								className="inline-flex size-8 items-center justify-center rounded-md bg-media-image/15 text-media-image"
								aria-hidden
							>
								<span className="text-label font-medium">img</span>
							</span>
							<div>
								<p className="text-label font-medium text-panel-fg">
									the page the user asked for
								</p>
								<p className="text-label-xs text-panel-label">image · failed</p>
							</div>
						</div>
						<span className="rounded-full bg-destructive/15 px-2 py-0.5 text-label-xs font-medium text-destructive">
							failed
						</span>
					</div>
					<div className="aspect-video w-full overflow-hidden rounded-md bg-surface-recessed">
						<div className="flex h-full flex-col items-center justify-center gap-1 px-4">
							<p className="text-label text-muted-foreground">no output</p>
							<p className="font-numeric text-label-xs text-muted-foreground">
								prompt: &quot;the page the user asked for&quot;
							</p>
						</div>
					</div>
				</section>

				<nav
					aria-label="Ways out"
					className="flex w-full flex-col items-stretch gap-2 sm:flex-row sm:justify-center"
				>
					<Button variant="accent" size="default" asChild>
						<Link href="/">Back to gallery</Link>
					</Button>
					<Button variant="ghost" size="default" asChild>
						<Link href="/">Home</Link>
					</Button>
				</nav>
			</main>
		</div>
	);
}
