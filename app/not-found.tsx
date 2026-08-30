import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import SlopYard from "./components/not-found/SlopYard";

export const metadata: Metadata = {
	title: "404 · OpenSlop",
	description: "The page you asked for was generated, and it came out wrong.",
};

export default function NotFound() {
	return (
		<div className="relative min-h-screen bg-background text-foreground">
			<div
				className="dot-grid-bg pointer-events-none fixed inset-0 -z-10"
				aria-hidden
			/>

			<main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-6 px-6 py-16 text-center">
				<SlopYard />

				<div className="flex flex-col items-center gap-3">
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
						The model was very confident about this one. It may never have
						existed, or it may belong to someone else.
					</p>
				</div>

				<Button variant="accent" size="default" asChild>
					<Link href="/">Back to My Slop</Link>
				</Button>
			</main>
		</div>
	);
}
