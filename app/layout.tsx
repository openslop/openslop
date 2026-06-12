import type { Metadata } from "next";
import { Geist, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import BackgroundGradientAnimation from "./components/BackgroundGradientAnimation";
import { GlobalErrorToaster } from "./components/GlobalErrorToaster";
import { ToastErrorBoundary } from "./components/ToastErrorBoundary";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
	variable: "--font-instrument-serif",
	subsets: ["latin"],
	weight: "400",
	preload: false,
});

export const metadata: Metadata = {
	title: "OpenSlop",
	description: "OpenSlop Beta Access",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark bg-[#0a0a0a]">
			<head>
				<meta name="theme-color" content="#0a0a0a" />
				<link rel="preconnect" href="https://api.fontshare.com" />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link
					rel="preconnect"
					href="https://fonts.gstatic.com"
					crossOrigin="anonymous"
				/>
				<link
					href="https://api.fontshare.com/v2/css?f[]=sentient@400&f[]=satoshi@400,500,700&display=swap"
					rel="stylesheet"
				/>
			</head>
			<body
				className={`${geistSans.variable} ${instrumentSerif.variable} antialiased bg-[#0a0a0a]`}
			>
				<BackgroundGradientAnimation />

				<div className="relative">
					<ToastErrorBoundary>{children}</ToastErrorBoundary>
				</div>
				<GlobalErrorToaster />
				<Toaster theme="dark" position="bottom-center" richColors />
			</body>
		</html>
	);
}
