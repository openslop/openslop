import type { Metadata } from "next";
import localFont from "next/font/local";
import { Instrument_Serif } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./components/ThemeProvider";
import { AppToaster } from "./components/AppToaster";
import { GlobalErrorToaster } from "./components/GlobalErrorToaster";
import { ToastErrorBoundary } from "./components/ToastErrorBoundary";

const slopella = localFont({
	src: "../public/fonts/Slopella.woff2",
	variable: "--font-slopella",
	weight: "100 900",
	display: "swap",
});

const sentient = localFont({
	src: "../public/fonts/Sentient.woff2",
	variable: "--font-sentient",
	weight: "400",
	display: "swap",
});

const inter = localFont({
	src: "../public/fonts/InterVariable.woff2",
	variable: "--font-inter",
	weight: "100 900",
	display: "swap",
});

const instrumentSerif = Instrument_Serif({
	variable: "--font-instrument-serif",
	subsets: ["latin"],
	weight: "400",
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
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta name="theme-color" content="#fdfcfc" />
			</head>
			<body
				className={`${slopella.variable} ${sentient.variable} ${inter.variable} ${instrumentSerif.variable} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="light"
					enableSystem
					disableTransitionOnChange
				>
					<div className="relative">
						<ToastErrorBoundary>{children}</ToastErrorBoundary>
					</div>
					<GlobalErrorToaster />
					<AppToaster />
				</ThemeProvider>
			</body>
		</html>
	);
}
