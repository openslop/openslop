const HAND_FINGERS = [
	{ x: 4, y: -14, height: 34 },
	{ x: 18, y: -20, height: 40 },
	{ x: 32, y: -23, height: 43 },
	{ x: 46, y: -20, height: 40 },
	{ x: 60, y: -13, height: 33 },
	{ x: 74, y: -4, height: 24 },
];

function Hand({ transform }: { transform: string }) {
	return (
		<g transform={transform} className="fill-element-card">
			{HAND_FINGERS.map((finger) => (
				<rect
					key={finger.x}
					x={finger.x}
					y={finger.y}
					width="12"
					height={finger.height}
					rx="6"
				/>
			))}
			<rect x="0" y="14" width="86" height="34" rx="15" />
			<rect x="80" y="22" width="28" height="13" rx="6.5" />
		</g>
	);
}

export function SceneDefs() {
	return (
		<defs>
			<pattern
				id="slop-dot-grid"
				width="12"
				height="12"
				patternUnits="userSpaceOnUse"
			>
				<path
					d="M6 5h2v1H6v2H5V6H3V5h2V3h1z"
					stroke="none"
					className="fill-foreground/15"
				/>
			</pattern>
			<linearGradient
				id="slop-floor-fade"
				x1="0"
				y1="372"
				x2="0"
				y2="500"
				gradientUnits="userSpaceOnUse"
			>
				<stop offset="0" stopColor="white" stopOpacity="0" />
				<stop offset="0.55" stopColor="white" stopOpacity="0.75" />
				<stop offset="1" stopColor="white" stopOpacity="1" />
			</linearGradient>
			<mask id="slop-floor-mask">
				<rect
					x="0"
					y="372"
					width="800"
					height="128"
					fill="url(#slop-floor-fade)"
				/>
			</mask>
			<filter id="slop-grain" x="0%" y="0%" width="100%" height="100%">
				<feTurbulence
					type="fractalNoise"
					baseFrequency="0.95"
					numOctaves="2"
					stitchTiles="stitch"
					result="noise"
				/>
				<feColorMatrix in="noise" type="saturate" values="0" result="mono" />
				<feComponentTransfer in="mono" result="soft">
					<feFuncA type="linear" slope="0.13" />
				</feComponentTransfer>
				<feComposite
					in="soft"
					in2="SourceAlpha"
					operator="in"
					result="speckle"
				/>
				<feComposite in="speckle" in2="SourceGraphic" operator="over" />
			</filter>
		</defs>
	);
}

export function Skyline({ spinClass }: { spinClass: string }) {
	return (
		<g
			strokeWidth="2"
			className="stroke-muted-foreground/60 fill-surface-recessed"
		>
			<circle
				cx="678"
				cy="82"
				r="36"
				strokeDasharray="28 18"
				strokeWidth="5"
				className={spinClass}
			/>
			<path d="M56 104c0-14 12-24 26-24 6-14 26-18 38-8 16-6 32 4 32 20 12 2 18 10 18 18H56z" />
			<path d="M222 124c0-11 9-19 21-19 5-11 21-14 30-6 13-5 26 3 26 16 10 2 15 8 15 14H222z" />
			<rect x="40" y="292" width="50" height="80" rx="4" />
			<path d="M48 306h34M48 318h34M48 330h34M48 342h34M48 354h34" />
			<rect x="98" y="272" width="44" height="100" rx="4" />
			<path d="M106 286h28M106 298h28M106 310h28M106 322h28M106 334h28M106 346h28M106 358h28" />
			<rect x="150" y="310" width="38" height="62" rx="4" />
			<path d="M158 322h22M158 334h22M158 346h22" />
			<path d="M116 266c0-14 18-10 18-24s-16-12-16-26" />
			<path d="M136 258c2-12 16-10 16-22" />
			<path d="M566 372V254M546 272h40M550 292h32" />
			<path d="M626 372V292M612 304h28" />
		</g>
	);
}

export function Yard({ spinClass }: { spinClass: string }) {
	return (
		<g strokeWidth="2.5">
			<rect
				x="0"
				y="372"
				width="800"
				height="128"
				stroke="none"
				fill="url(#slop-dot-grid)"
				mask="url(#slop-floor-mask)"
			/>
			<path d="M0 372h800" className="stroke-foreground/70" />
			<path
				d="M0 372c56-24 112-16 156 6"
				className="stroke-muted-foreground/70"
			/>
			<path
				d="M600 372c46-28 116-22 200 8"
				className="stroke-muted-foreground/70"
			/>

			<g
				transform="rotate(-7 142 128)"
				strokeDasharray="7 7"
				filter="url(#slop-grain)"
			>
				<rect
					x="86"
					y="84"
					width="112"
					height="88"
					rx="10"
					className="fill-element-card"
				/>
				<rect
					x="86"
					y="84"
					width="112"
					height="88"
					rx="10"
					stroke="none"
					fill="url(#slop-dot-grid)"
				/>
				<circle
					cx="142"
					cy="126"
					r="17"
					strokeWidth="4"
					strokeDasharray="14 10"
					className={`stroke-muted-foreground ${spinClass}`}
				/>
			</g>

			<g className="fill-element-card">
				<path d="M198 372V178" fill="none" />
				<path d="M198 196h-84l-16 15 16 15h84z" />
				<text
					x="124"
					y="218"
					fontSize="16"
					stroke="none"
					className="font-title fill-foreground"
				>
					/
				</text>
				<g transform="rotate(58 198 240)">
					<path d="M198 226h62l15 15-15 15h-62z" />
					<text
						x="222"
						y="248"
						fontSize="15"
						stroke="none"
						className="font-title fill-muted-foreground"
					>
						???
					</text>
				</g>
			</g>
		</g>
	);
}

export function RegeneratedTwin() {
	return (
		<g strokeWidth="2.6" transform="translate(614 128) scale(0.56)">
			<ellipse
				cx="86"
				cy="336"
				rx="96"
				ry="12"
				stroke="none"
				className="fill-muted-foreground/25"
			/>
			<g className="fill-surface-recessed">
				<rect x="6" y="292" width="160" height="36" rx="16" />
			</g>
			<g className="fill-element-card">
				<circle cx="44" cy="310" r="10" />
				<circle cx="128" cy="310" r="10" />
				<path d="M18 292c-6-56 0-88 22-100 28-16 82-14 100 4 14 14 18 58 14 96z" />
				<g transform="rotate(20 96 150)">
					<rect x="22" y="92" width="146" height="92" rx="20" />
					<rect
						x="36"
						y="106"
						width="118"
						height="64"
						rx="8"
						className="fill-surface-recessed"
					/>
					<g fill="none" strokeWidth="5">
						<path d="M64 132l16 16M80 132l-16 16M112 132l16 16M128 132l-16 16" />
						<path d="M70 164c12-12 30-12 42 0" />
					</g>
				</g>
			</g>
			<g strokeWidth="6">
				<path d="M158 214c36 6 56 26 48 56" />
				<path d="M162 240c32-4 50 10 50 36" />
				<path d="M164 262c28 2 42 18 40 42" />
				<path d="M14 218c-30 12-40 34-30 60" />
			</g>
		</g>
	);
}

export function Sloppy({
	blinkClass,
	scanClass,
}: {
	blinkClass: string;
	scanClass: string;
}) {
	return (
		<g strokeWidth="3" transform="translate(-24 0)">
			<ellipse
				cx="400"
				cy="388"
				rx="122"
				ry="13"
				stroke="none"
				className="fill-muted-foreground/25"
			/>

			<path d="M340 274c-34 8-56 30-60 58" strokeWidth="7" />
			<g transform="rotate(-24 288 344)">
				<path d="M250 316h76l-11 62h-54z" className="fill-element-card" />
				<path d="M250 316c15 22 61 22 76 0" className="fill-surface-recessed" />
				<path d="M256 310c9-18 62-18 62 0" />
				<text
					x="268"
					y="354"
					fontSize="15"
					stroke="none"
					className="font-title fill-muted-foreground"
				>
					SLOP
				</text>
			</g>

			<rect
				x="322"
				y="342"
				width="156"
				height="38"
				rx="16"
				className="fill-surface-recessed"
			/>
			<g className="fill-element-card">
				<circle cx="358" cy="361" r="10" />
				<circle cx="442" cy="361" r="10" />
				<rect x="336" y="240" width="128" height="106" rx="20" />
			</g>
			<rect
				x="356"
				y="262"
				width="88"
				height="52"
				rx="8"
				className="fill-surface-recessed"
			/>
			<text
				x="366"
				y="284"
				fontSize="13"
				stroke="none"
				className="font-title fill-muted-foreground"
			>
				rendering
			</text>
			<path d="M366 300h68" strokeWidth="7" className="stroke-border" />
			<path d="M366 300h7" strokeWidth="7" className="stroke-accent" />

			<path d="M386 226v20M414 226v20" />

			<rect
				x="316"
				y="130"
				width="168"
				height="102"
				rx="22"
				className="fill-element-card"
			/>
			<rect
				x="332"
				y="144"
				width="136"
				height="74"
				rx="10"
				className="fill-surface-recessed"
			/>
			<circle
				cx="380"
				cy="180"
				r="22"
				strokeWidth="5"
				className="stroke-media-image"
			/>
			<circle
				cx="436"
				cy="170"
				r="11"
				strokeWidth="4"
				className="stroke-media-image"
			/>
			<g stroke="none" className="fill-foreground">
				<circle cx="380" cy="180" r="7" />
				<circle cx="436" cy="170" r="4" />
			</g>
			<path d="M362 204c10 8 24 8 34 0" strokeWidth="4" />
			<path
				d="M332 158h136"
				strokeWidth="3"
				className={`stroke-muted-foreground/50 ${scanClass}`}
			/>

			<path d="M400 130v-30l18-14" />
			<circle cx="420" cy="84" r="8" className={`fill-caution ${blinkClass}`} />

			<path d="M462 266c36-2 62-18 78-44" strokeWidth="7" />
		</g>
	);
}

export function SlopYardForeground() {
	return (
		<g strokeWidth="3">
			<g transform="rotate(-10 566 152)" filter="url(#slop-grain)">
				<rect
					x="498"
					y="100"
					width="130"
					height="98"
					rx="12"
					className="fill-element-card"
				/>
				<rect
					x="510"
					y="112"
					width="106"
					height="56"
					rx="6"
					className="fill-surface-recessed"
				/>
				<path
					d="M522 154l20-22 15 17 13-13 22 28h-70z"
					stroke="none"
					className="fill-muted-foreground/40"
				/>
				<circle cx="527" cy="126" r="5" strokeWidth="3" />
				<path d="M512 182h56" strokeWidth="5" className="stroke-border" />
				<path
					d="M592 174l16 16M608 174l-16 16"
					strokeWidth="4"
					className="stroke-destructive"
				/>
			</g>
			<Hand transform="translate(470 190) rotate(-22) scale(0.76)" />

			<g transform="rotate(-8 172 404)" filter="url(#slop-grain)">
				<rect
					x="118"
					y="358"
					width="108"
					height="90"
					rx="10"
					className="fill-element-card"
				/>
				<rect
					x="128"
					y="368"
					width="88"
					height="46"
					rx="6"
					className="fill-surface-recessed"
				/>
				<Hand transform="translate(140 382) scale(0.52)" />
				<text
					x="128"
					y="436"
					fontSize="13"
					stroke="none"
					className="font-title fill-muted-foreground"
				>
					hands_v7.png
				</text>
			</g>

			<g transform="rotate(9 540 420)" filter="url(#slop-grain)">
				<rect
					x="486"
					y="378"
					width="108"
					height="86"
					rx="10"
					className="fill-element-card"
				/>
				<rect
					x="496"
					y="388"
					width="88"
					height="44"
					rx="6"
					className="fill-surface-recessed"
				/>
				<path
					d="M514 418c6-16 20-20 30-4 6-14 18-12 24 4z"
					stroke="none"
					className="fill-muted-foreground/40"
				/>
				<text
					x="496"
					y="452"
					fontSize="13"
					stroke="none"
					className="font-title fill-muted-foreground"
				>
					cat_v9.mp4
				</text>
			</g>

			<g stroke="none" className="fill-media-animated/20">
				<path d="M246 346c15 6 17 26 21 44 4 20 14 34 30 42l-56 4c-14-28-19-58 5-90z" />
				<path d="M206 480c12-26 56-38 110-32 40 4 76 2 112-8 44-10 104-4 136 24 8 8-2 16-34 16H234c-26 0-34-6-28-16z" />
			</g>
			<g fill="none" className="stroke-media-animated/50">
				<path d="M206 480c12-26 56-38 110-32 40 4 76 2 112-8 44-10 104-4 136 24" />
				<path d="M340 468c9 9 23 9 30-2M462 458c7 7 20 7 27-2" />
			</g>
		</g>
	);
}
