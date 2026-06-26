import dedent from "dedent";
import { type Template, templateAsset } from "./types";

export const financeTips: Template = {
	id: "finance-tips",
	name: "Finance Tips",
	pillText: "Finance tips for...",
	color: "#3B82F6",
	style:
		"Flat 2D cartoon, bold black outlines, cel-shaded flat colors, oversized rounded heads with prominent chins, small oval eyes, bean-shaped bodies, stubby limbs. Vector-style props with thick outlines. Saturated colors. Explainer-cartoon aesthetic. Plain white background.",
	referenceImages: [
		templateAsset("finance-tips-2"),
		templateAsset("finance-tips-3"),
		templateAsset("finance-tips-4"),
	],
	characters: {
		Ethan: {
			description: "American male, neutral accent",
			appearance:
				"man with short light brown hair parted to the side, oversized rounded head with prominent chin and double-chin, small oval eyes with tiny black pupils, thin arched eyebrows, long pointed nose, small mouth. Bean-shaped body with stubby limbs. Wearing a blue hoodie and blue pants with white sneakers",
			avatarUrl: templateAsset("finance-tips-1"),
		},
	},
	narration: {
		gender: "masculine",
		age: "adult",
		pitch: "medium",
		accent: "american",
		description: "wise",
	},
	showcase: {
		image: templateAsset("finance-tips-4"),
		title: "Finance tips",
		description: "Long-form, stories to teach personal finance lessons",
		examplePrompt:
			"Subscriptions, bank fees, impulse buys, unused gym memberships - the money leaks most people ignore",
	},
	systemPrompt: dedent`
		# Important
		- The main character is always called Ethan, and the Ethan must always be present in the character list of images where relevant
		- Do not generate character metadata for Ethan, but do use him like a regular character in the story`,
	exampleText: dedent`
		#Image: Black screen. White Arial text: "You're leaking money every month."
		#Sound: [single water drip echoing in a quiet room]
		#Narration: You're leaking money every month.

		#Animated Image: Ethan stares at a bathtub as dollar bills swirl down the drain. He reaches in too late — the last bill slips away.
		#Narration: Right now. Today. And you probably don't even know it's happening.

		#Animated Image: Ethan holds up a sign that says "$86/month." It flips to reveal "$219/month." His eyes go wide.
		#Narration: A big study asked Americans how much they spend on subscriptions every month. They guessed about 86 dollars. The real number? 219 dollars.

		#Animated Image: Giant red text slams onto the screen behind Ethan — "$133 EXTRA / MONTH." His jaw drops to the floor.
		#Narration: That's 133 dollars more than people think. Every. Single. Month.

		#Animated Image: A pie chart spins next to Ethan. A 42% red slice pops out as he points at it.
		#Narration: And 42 percent of people are paying for stuff they already stopped using.

		#Animated Image: Ethan sits at a dark kitchen table, face lit by his phone. The screen shows "$43.17" with a red arrow pointing down. A question mark floats above his head.
		#Narration: Meet Ethan. He's 28. He makes 55 thousand dollars a year. Last week, he checked his bank account and it was almost empty. He had no idea why.

		#Animated Image: Ethan slumps on a couch. Dollar bills float up around him and disappear into the ceiling, one by one.
		#Narration: By the end of this video, Ethan is going to find 200 dollars hiding in his own bank statement. And so are you. My name is Nick. Today we're hunting down the five money leaks almost everyone has.

		#Image: Title card — "Leak 1: The Gym You Don't Go To"
		#Sound: [squeaky treadmill belt, then silence]
		#Narration: Leak number one. The gym you don't go to.

		#Animated Image: Ethan stands in workout clothes in an empty gym. A single treadmill hums on its own behind him. Tumbleweed rolls past.
		#Narration: There are 77 million gym members in America. Half of them quit going in the first six months. But they keep paying.

		#Animated Image: Ethan holds up a shiny gym card. The price "$69 / MONTH" stamps onto the screen behind him.
		#Narration: The average gym costs 69 dollars a month.

		#Animated Image: Ethan peeks through a Planet Fitness window. Text floats above him — "60% never visit in 30 days." Crickets chirp inside.
		#Narration: At Planet Fitness, 60 percent of members don't even step inside once in a whole month. The gym only works because most people stay home.

		#Animated Image: Ethan at a chalkboard writes "$69 × 12 = $828." He circles the answer, then sighs.
		#Narration: If you pay and don't go, that's 828 dollars a year. Gone.

		#Animated Image: Ethan holds up an envelope stamped "CANCELLATION LETTER." It grows arms and runs away from him.
		#Narration: And here's the dirty trick. You can sign up online in two minutes. But to cancel? You have to go in person. Or mail them a letter. They make it hard on purpose.

		#Image: Title card — "Leak 2: Streaming You Don't Watch"
		#Sound: [TV static, then a quick channel-flip click]
		#Narration: Leak number two. Streaming.

		#Animated Image: Ethan on the couch points a remote. Netflix, Hulu, Disney+, and Paramount+ logos circle around his head like planets.
		#Narration: The average American house pays for four streaming services. That adds up to 69 dollars a month. Over 800 dollars a year.

		#Animated Image: Stats pop into the air next to Ethan one by one — "ESPN+: 26%" — "Hulu: 26%" — "Paramount+: 25%" — "Disney+: 23%." Each one lands with a thud.
		#Narration: But here's the kicker. One in four people pay for these services and didn't watch them once last month. Not a single show.

		#Animated Image: Ethan scrolls Netflix endlessly. His thumb gets tired. Popcorn sits cold next to him.
		#Narration: Even Netflix — the most popular one — 17 percent of people haven't opened it in a month.

		#Animated Image: A price tag in front of Ethan flips from "$15" to "$20." He winces but doesn't move.
		#Narration: When prices go up by just 5 dollars, most people say they'll cancel. But they don't. They just keep paying.

		#Image: Title card — "Leak 3: The Free Trial Trap"
		#Sound: [mouse trap snapping shut]
		#Narration: Leak number three. The free trial trap.

		#Animated Image: Ethan reaches for a glowing mousetrap labeled "FREE 7-DAY TRIAL." The trap snaps shut on his credit card. He yelps.
		#Narration: You sign up for a free trial. You type in your credit card. You forget. Seven days later — you're paying.

		#Animated Image: Ethan opens his bank app. A red alert bubble pops up — "65% of Americans got charged." He clutches his chest.
		#Narration: 65 percent of Americans have been charged because they forgot to cancel a free trial. That's two out of every three people.

		#Animated Image: Ethan taps "Download" on his phone. A "DAY 1" stamp slams onto the screen. A speech bubble next to him reads "89%."
		#Narration: 89 percent of people sign up for the free trial the same day they download the app. Then they never think about it again.

		#Animated Image: Ethan signs up, then immediately taps "Cancel" with a sly grin. A pop-up emails him — "Wait! 50% off to come back!"
		#Narration: Here's a trick almost nobody knows. The moment you sign up for any trial — go cancel it right away. The company will keep letting you use it until the trial ends. And when it does, they will often email you a better deal to come back.

		#Image: Title card — "Halfway check-in"
		#Sound: [soft synth chime, like a level-up sound]
		#Narration: Halfway check-in. The next two leaks are the sneakiest of all.

		#Animated Image: Ethan at his desk crosses items off a notepad. A list reads "Leak 1 ✓ Leak 2 ✓ Leak 3 ✓." He looks up with growing excitement.
		#Narration: Ethan's been taking notes. He's already found three leaks in his own life. Let's keep going.

		#Image: Title card — "Leak 4: The Protection Plan"
		#Sound: [cash register cha-ching]
		#Narration: Leak number four. The protection plan.

		#Animated Image: Ethan holds a new TV box at a checkout. The cashier leans forward with a wide smile — "Want the protection plan?" Ethan freezes.
		#Narration: You buy a TV. The cashier asks, "Want to add the protection plan?" The answer is almost always: no.

		#Animated Image: Two giant glowing numbers float in the sky above Ethan — "$1.27 BILLION collected" and "$210 MILLION paid back." He stares up, mouth open.
		#Narration: Last year, Lowe's made over a billion dollars selling warranties. They only paid back 210 million.

		#Animated Image: A dollar bill rips in two in front of Ethan. He's left holding a tiny 17-cent scrap. The giant 83-cent piece flies into a store window.
		#Narration: That means for every dollar you spend on a warranty, the store keeps 83 cents. You get back 17.

		#Animated Image: Three appliance icons line up next to Ethan — a TV, microwave, and dishwasher. Tiny break percentages pop above each one. He points down the line.
		#Narration: TVs only break 5 to 8 percent of the time. Microwaves, 12 percent. Dishwashers, 13 percent. The odds are on your side.

		#Animated Image: Ethan flashes a thumbs up. Green text booms next to him — "SKIP THE WARRANTY."
		#Narration: Skip it. Keep your cash. The only thing worth a warranty? A laptop. About one in three of those break.

		#Image: Title card — "Leak 5: Zombie Spending"
		#Sound: [low spooky moan with a heartbeat thump]
		#Narration: Leak number five. Zombie spending.

		#Animated Image: Ethan backs away as old subscription logos crawl out of a graveyard, zombie style. They claw their way onto his credit card.
		#Narration: These are the worst. The subscription is dead to you. But it's still alive on your credit card.

		#Animated Image: Ethan stares at a card floating in front of him — "60% forgot a recurring payment." He scratches his head.
		#Narration: 60 percent of people have forgotten about a payment coming out every month. 71 percent say they waste at least 50 dollars a month on stuff they don't want anymore.

		#Animated Image: Ethan punches numbers into a calculator. The screen flashes "$50 × 12 = $600." His shoulders drop.
		#Narration: That's 600 dollars a year. For nothing.

		#Animated Image: Ethan flips a calendar. Three months in a row are stamped red with a giant X. He winces with each flip.
		#Narration: And here's the saddest part. When people finally notice, it takes them three to six months to actually cancel. That's half a year of paying for nothing.

		#Animated Image: A factory machine labeled "BIG COMPANIES" runs in front of Ethan. A mechanical arm reaches into his pocket and pulls out dollar bills onto a conveyor belt.
		#Narration: Here's the big secret. Every company you pay has set up a robot to take your money automatically. Your gym. Netflix. Your phone bill. They all know — if they didn't make it automatic, you'd stop paying.

		#Animated Image: Ethan grabs a big red lever. He yanks it down. The conveyor belt reverses. Money pours back into his piggy bank. He grins.
		#Narration: So here's the move. Turn that robot around. Make it pay you instead.

		#Image: Title card — "The Fix"
		#Sound: [wrench tightening a bolt with a satisfying clink]
		#Narration: Okay. Here's how. It takes 15 minutes. Tonight.

		#Animated Image: Close up of Ethan's iPhone. His thumb taps "Settings" → his name → "Subscriptions." A long list scrolls into view.
		#Narration: Step one. The big one. If you have an iPhone, open Settings. Tap your name at the top. Tap Subscriptions. Every single thing you've signed up for will show up in one list.

		#Animated Image: Ethan's thumb taps "Cancel" over and over. A counter ticks up — "1, 2, 3, 4, 5…" — and his smile grows bigger with each tap.
		#Narration: Tap. Cancel. Tap. Cancel. Most people find 5 to 10 things they totally forgot about. On Android, open the Play Store, then Payments and Subscriptions. Same magic list.

		#Animated Image: Ethan at his kitchen table holds a red marker. He circles repeating charges on his bank statement — one, two, three — as the numbers glow.
		#Narration: Step two. Open your bank app. Look at the last three months. Circle every charge that shows up every month. Even the tiny ones. Especially the 4 dollar and 99 cent ones. Those are the hiding spots.

		#Animated Image: Ethan types into his email search bar — "subscription, renewal, free trial." Old emails fly out of the screen and pile up around him.
		#Narration: Step three. Search your email for "subscription", "renewal", and "free trial". You'll find stuff you forgot existed.

		#Image: Title card — "The Subscription Freeze"
		#Sound: [ice crystals forming, soft frosty crackle]
		#Narration: Now here's the lazy trick. It's called the Subscription Freeze. Cancel everything at once. All of it.

		#Animated Image: Ethan on the couch eats popcorn calmly. A clock ticks loud beside him. He shrugs — nothing to miss.
		#Narration: Then wait. See what you actually miss. You can always sign back up with one click. Most people find they don't miss much at all.

		#Animated Image: Ethan taps his bank app and sets up an auto-transfer. A glowing arrow labeled "$100 / month" flows out of his account and into a piggy bank.
		#Narration: Now here's the part nobody talks about. Don't just save that money. Send it somewhere automatic. Set up your bank to move 100 dollars a month into a savings or investing account. Same way Netflix takes from you. But now it's working for you.

		#Animated Image: Older Ethan with grey hair stands under a giant money tree. Leaves of cash drift down around him. A glowing "$632,000" hangs at the top.
		#Narration: 100 dollars a month. Invested for 40 years. Grows into 632 thousand dollars. From the same money you were already losing.

		#Animated Image: Ethan points at bold text that bounces onto the screen — "Can't do 12%? Start with 1%." A tiny coin drops into a piggy bank beside him.
		#Narration: Can't save a hundred bucks? Start with one percent of your paycheck. You won't even feel it. In a year, you'll be saving more than most Americans.

		#Animated Image: A dark screen. Ethan's silhouette stands small and hunched. White text appears next to him — "You pay. You forget. They win."
		#Sound: [low, slow heartbeat]
		#Narration: You pay. You forget. They win.

		#Animated Image: The silhouette of Ethan slowly straightens up tall and strong. The text rewrites itself — "Or you can stop forgetting."
		#Sound: [heartbeat speeds up, then a sharp inhale]
		#Narration: Or you can stop forgetting.

		#Image: Final title card — Ethan holds his phone up triumphantly. Text glows beside him: "Audit your bank statement. TONIGHT. 15 minutes."
		#Sound: [phone alarm chime, then a satisfying click]
		#Narration: 15 minutes. Open your phone. Tap Settings. Tap Subscriptions. The money is already yours. Go get it back.
	`,
};
