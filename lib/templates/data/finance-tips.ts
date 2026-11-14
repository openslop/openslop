import { dedent } from "@/lib/dedent";
import type { TemplateInput } from "../templates";

export const financeTips = {
	id: "finance-tips",
	length: "5-10m",
	name: "Finance Tips",
	promptPrefix: "Finance tips for",
	color: "#3B82F6",
	style: {
		description:
			"Flat 2D cartoon, bold black outlines, cel-shaded flat colors, oversized rounded heads with prominent chins, small oval eyes, bean-shaped bodies, stubby limbs. Vector-style props with thick outlines. Saturated colors. Explainer-cartoon aesthetic. Plain white background.",
	},
	referenceImages: ["finance-tips-2", "finance-tips-3", "finance-tips-4"],
	characters: {
		Ethan: {
			description: "American male, neutral accent",
			appearance:
				"man with short light brown hair parted to the side, oversized rounded head with prominent chin and double-chin, small oval eyes with tiny black pupils, thin arched eyebrows, long pointed nose, small mouth. Bean-shaped body with stubby limbs. Wearing a blue hoodie and blue pants with white sneakers",
			avatar: "finance-tips-1",
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
		image: "finance-tips-4",
		title: "Finance tips",
		description: "Long-form, stories to teach personal finance lessons",
		examplePrompt:
			"Subscriptions, bank fees, impulse buys, unused gym memberships - the money leaks most people ignore",
	},
	systemPrompt: dedent`
# Important
- This is an Explainer: every visual, including every title card, is a <video>. Nobody speaks inside the videos; the narrator carries every word.
- Every video is a single continuous shot labelled Shot 1, with one camera move or a static frame. Never add a Shot 2.
- The main character is always called Ethan, and Ethan must always be present in the character list of videos where relevant.
- Ethan is already one of the characters: use him like a regular character in the story.
	`,
	exampleText: dedent`
#Music: Tense, minimal electronic pulse with a low sub bass and a slow ticking hi-hat, building unease

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text types itself out letter by letter across the center of frame reading "You're leaking money every month." and the last period lands with a small pulse. Nothing else in frame. Sound: a single water drip echoing in a quiet room.
#Narration: You're leaking money every month.

#Video: Shot 1: Medium shot at eye level, slow push-in toward the tub. A white tiled bathroom in flat late-morning light, a full white bathtub in the center of frame, a shower curtain hanging in the background, a bathmat in the foreground. Ethan stands behind the tub facing the camera, hands gripping its rim, staring down with a stunned face as green dollar bills swirl in the water toward the open drain. He plunges one hand into the water a beat too late, fingers open, and the last bill folds and slips down the drain. Sound: water gurgling down the drain a few feet away, then a splash and a hollow sucking gulp.
#Narration: Right now. Today. And you probably don't even know it's happening.

#Video: Shot 1: Medium shot at eye level, slow push-in on the sign. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, holding a white card sign at chest height with both hands, eyebrows raised expectantly, the sign filling the lower third of frame and reading "$86 / month" in bold black letters. He flips the card over with a snap to reveal "$219 / month" in bold red letters and his eyes go wide as he looks down at it. Nothing in the background. Sound: a soft ruffle as the card lifts, then a sharp card flip and the card rustling as it settles.
#Narration: A big study asked Americans how much they spend on subscriptions every month. They guessed about 86 dollars. The real number? 219 dollars.

#Video: Shot 1: Continuing the push-in on Ethan's wide eyes above the flipped card reading "$219 / month", the camera snaps back to a medium shot at eye level with a hard shake, the plain pale gray studio backdrop behind him under soft even light. Giant red bold text reading "$133 EXTRA / MONTH" slams onto the backdrop behind Ethan, filling the top half of frame, as his jaw drops all the way open and the card droops in his hands. Sound: a heavy metallic slam as the text lands, a rattle as the frame shakes.
#Narration: That's 133 dollars more than people think. Every. Single. Month.

#Video: Shot 1: Medium shot at eye level, slow push-in on the chart. A plain pale gray studio backdrop under soft even light. Ethan stands left of center facing the camera, raising one finger to point right at a large flat pie chart floating beside him at shoulder height, his expression matter-of-fact. The chart is mostly blue with one red slice, and as the camera closes in the red slice labeled "42%" in white pops out from the chart and hangs in front of it. Nothing in the background. Sound: the chart whirring softly as it spins into place, then a soft pop as the slice detaches.
#Narration: And 42 percent of people are paying for stuff they already stopped using.

#Music: Warm, curious lo-fi hip hop beat with a soft electric piano, relaxed and friendly

#Video: Shot 1: Wide shot at eye level, slow push-in toward the table. A small dark kitchen at night, the only light a cold phone glow and a thin strip of streetlight through the window on the right. Ethan sits alone at a round kitchen table in the center, facing the camera, shoulders slumped, staring down at his phone with a worried frown, a cereal box and an unopened envelope on the table, the back of a chair in the foreground and a refrigerator in the background. As the camera closes in, the phone screen tilts toward it showing a banking app balance of "$43.17" with a red arrow pointing down, and a white question mark floats up above Ethan's head. Sound: a refrigerator humming, a wall clock ticking on the far wall, a soft phone tap.
#Narration: Meet Ethan. He's 28. He makes 55 thousand dollars a year. Last week, he checked his bank account and it was almost empty. He had no idea why.

#Video: Shot 1: Medium shot at eye level, slow tilt up. A cozy living room in warm evening lamplight, a gray couch across the center of frame, a floor lamp on the right, a bookshelf in the background, a coffee table with a remote in the foreground. Ethan drops down onto the couch from the left, facing the camera, and slumps back with a long exhale and a defeated look. As the camera tilts up, green dollar bills float out of his jacket pockets one by one, drift past his face and vanish into the plain white ceiling above. Sound: couch cushions creaking and puffing as he lands, paper fluttering softly, a small pop each time a bill disappears.
#Narration: By the end of this video, Ethan is going to find 200 dollars hiding in his own bank statement. And so are you. My name is Nick. Today we're hunting down the five money leaks almost everyone has.

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "Leak 1: The Gym You Don't Go To", with a thin white underline drawing itself beneath. Nothing else in frame. Sound: a treadmill belt squeaking rhythmically, then abrupt silence.
#Narration: Leak number one. The gym you don't go to.

#Video: Shot 1: Wide shot at eye level, static camera. A large empty gym under flat fluorescent light, rows of treadmills receding into the background, a mirrored wall on the left, a rack of dumbbells on the right. Ethan stands in the center of the rubber floor facing the camera in workout gear, arms hanging, looking around with an uneasy expression, while behind him one treadmill runs on its own, its belt spinning with nobody on it. A dry tumbleweed rolls in from the left across the foreground, bumps past his sneakers and tumbles off to the right. Sound: a treadmill motor humming in the background, its belt squeaking, dry twigs scraping across rubber flooring.
#Narration: There are 77 million gym members in America. Half of them quit going in the first six months. But they keep paying.

#Video: Shot 1: Medium shot at eye level, quick punch-in. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, holding up a glossy black gym membership card between two fingers at shoulder height with a small proud smile, the card catching a highlight. As the camera punches in, a red rubber-stamp graphic reading "$69 / MONTH" slams onto the gray backdrop behind his head, tilted slightly, and his smile flattens. Nothing else in frame. Sound: a faint plastic click as the card flicks up, then a heavy stamp thunk.
#Narration: The average gym costs 69 dollars a month.

#Video: Shot 1: Medium shot from outside at eye level, slow push-in. A dark parking lot at night, a glowing purple gym storefront window filling the frame with a "Planet Fitness" sign above it. Ethan stands at the left of the window facing right, hands cupped against the glass, peeking inside with a curious frown, rows of empty treadmills visible through the glass under fluorescent light in the background. Bold white text floats up beside his head on the right reading "60% never visit in 30 days." Sound: crickets chirping in the lot, fluorescent lights buzzing faintly through the glass, a soft whoosh as the text rises.
#Narration: At Planet Fitness, 60 percent of members don't even step inside once in a whole month. The gym only works because most people stay home.

#Video: Shot 1: Medium shot at eye level, static camera. A classroom in warm afternoon light, a large green chalkboard filling the background, a wooden desk edge in the foreground. Ethan stands at the right of the board facing it, chalk in hand, writing "$69 x 12 = $828" in big white letters across its center, then draws a white circle around "$828", drops the chalk into the tray and lets his shoulders sink with a slow sigh. Sound: chalk scratching and tapping on the board, a squeak around the circle, a soft clatter as the chalk hits the tray.
#Narration: If you pay and don't go, that's 828 dollars a year. Gone.

#Video: Shot 1: Medium shot at eye level, pan following right. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, holding up a white envelope stamped in red "CANCELLATION LETTER" at chest height and looking at it doubtfully. The envelope sprouts two tiny cartoon arms and legs, leaps out of his hands and sprints away across the gray floor toward the right edge of frame while Ethan lunges after it with a shocked face and grabbing hands. Nothing in the background. Sound: paper crinkling in his grip, then quick little footsteps pattering away and Ethan's frustrated grunt.
#Narration: And here's the dirty trick. You can sign up online in two minutes. But to cancel? You have to go in person. Or mail them a letter. They make it hard on purpose.

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "Leak 2: Streaming You Don't Watch", with a thin white underline drawing itself beneath. Nothing else in frame. Sound: TV static, then a quick channel-flip click.
#Narration: Leak number two. Streaming.

#Video: Shot 1: Medium shot at eye level, slow orbit from left to right around the couch. A living room at night lit by the blue glow of a TV off-frame, a gray couch center, a floor lamp switched off behind it. Ethan sits center on the couch facing the camera, pointing a remote forward with a blank face, while glowing logos of Netflix, Hulu, Disney+ and Paramount+ circle slowly around his head like planets. A bowl of popcorn sits on the cushion beside him. Sound: the remote clicking, a low electronic hum from the orbiting logos.
#Narration: The average American house pays for four streaming services. That adds up to 69 dollars a month. Over 800 dollars a year.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing the camera, glancing right, as four bold black text blocks drop into the empty space beside him one after the other, "ESPN+: 26%", "Hulu: 26%", "Paramount+: 25%", "Disney+: 23%", each landing with a bounce and stacking into a column, Ethan's eyes following each one down with a small wince. Nothing in the background. Sound: a heavy thud as each block lands, a faint wobble as they settle.
#Narration: But here's the kicker. One in four people pay for these services and didn't watch them once last month. Not a single show.

#Video: Shot 1: Medium shot at eye level, slow push-in. A living room at night lit by a TV off-frame, a gray couch across the center of frame, a bowl of cold popcorn untouched on the cushion to the right. Ethan sits center on the couch facing the camera with glazed eyes, thumb scrolling endlessly down a phone screen showing a grid of movie thumbnails, the scroll slowing as the thumb gets tired and the phone droops in his hand. Sound: repeated soft clicks and swipes on glass, the TV murmuring faintly, a couch spring creaking.
#Narration: Even Netflix, the most popular one. 17 percent of people haven't opened it in a month.

#Video: Shot 1: Medium shot at eye level, slow push-in on Ethan's face. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, hands at his sides, as a large white price tag hanging on a string in front of him at chest height flips from "$15" to "$20" in bold black digits. He winces hard, one eye squeezed shut, then holds perfectly still without moving a muscle. Nothing in the background. Sound: a stiff card flipping over, a tiny creak of his jaw, then silence.
#Narration: When prices go up by just 5 dollars, most people say they'll cancel. But they don't. They just keep paying.

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "Leak 3: The Free Trial Trap", with a thin white underline drawing itself beneath. Nothing else in frame. Sound: a mousetrap snapping shut.
#Narration: Leak number three. The free trial trap.

#Video: Shot 1: Medium shot at eye level, slow push-in on the trap. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing right, leaning forward with an eager face and reaching a blue credit card toward a large glowing wooden mousetrap on a pedestal at the right, its spring arm cocked, a label on it reading "FREE 7-DAY TRIAL". The spring arm snaps down on the card and Ethan jerks his hand back with a yelp, the trap in the foreground and the empty backdrop behind. Sound: a faint electric hum from the trap, then a loud snap of wood on plastic and Ethan's yelp.
#Narration: You sign up for a free trial. You type in your credit card. You forget. Seven days later, you're paying.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, looking down at the phone in his hand, when a red alert bubble bursts up out of the screen and hangs above it at head height reading "65% of Americans got charged". He clutches his chest with his free hand and staggers two steps back toward the backdrop with a horrified face. Nothing in the background. Sound: a harsh notification buzz, shoes scuffing on the floor, a sharp gasp.
#Narration: 65 percent of Americans have been charged because they forgot to cancel a free trial. That's two out of every three people.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing the camera, holding his phone up at chest height with its screen toward camera showing a blue "Download" button, his thumb tapping it. A red rubber stamp reading "DAY 1" slams down over the phone screen, then a white speech-bubble graphic pops up in the empty space to his right with "89%" inside in bold black, Ethan glancing at it. Nothing in the background. Sound: a screen tap, a stamp thunk, a soft pop as the bubble appears.
#Narration: 89 percent of people sign up for the free trial the same day they download the app. Then they never think about it again.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera holding his phone up with its screen toward camera, his thumb tapping "Start Free Trial" and then immediately tapping "Cancel Subscription" just below it. He lowers the phone with a sly grin as a white email pop-up slides in at the right of frame at head height reading "Wait! 50% off to come back!" Nothing in the background. Sound: two quick screen taps, then a cheerful email chime.
#Narration: Here's a trick almost nobody knows. The moment you sign up for any trial, go cancel it right away. The company will keep letting you use it until the trial ends. And when it does, they will often email you a better deal to come back.

#Music: Bright, upbeat synth-pop with a bouncy bassline and a clean clap, energizing

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text scales up from small to full size in the center of frame reading "Halfway check-in", with a small green progress bar beneath it filling to the halfway mark. Nothing else in frame. Sound: a soft synth chime like a level-up sound.
#Narration: Halfway check-in. The next two leaks are the sneakiest of all.

#Video: Shot 1: Medium shot at eye level, slow tilt up from the notepad to Ethan's face. A wooden desk in warm afternoon window light, a yellow notepad in the center of frame, a mug beside it, a window with afternoon light in the background. Ethan sits behind the desk facing the camera, his pen crossing off "Leak 1", "Leak 2" and "Leak 3" on the notepad one by one with check marks, then he looks up from the pad with a growing excited smile and taps the pen twice. Sound: a pen scratching across paper, then the pen tapping the notepad twice.
#Narration: Ethan's been taking notes. He's already found three leaks in his own life. Let's keep going.

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "Leak 4: The Protection Plan", with a thin white underline drawing itself beneath. Nothing else in frame. Sound: a cash register drawer sliding open with a cha-ching.
#Narration: Leak number four. The protection plan.

#Video: Shot 1: Medium shot at eye level, static camera. A bright electronics store checkout under white ceiling lights, a long counter running across the frame, shelves of boxed gadgets in the background, a card reader on the counter in the foreground. Ethan stands at the left of the counter facing right, holding a large flat TV box under one arm with a pleased face, while a cashier stands behind the counter at the right facing him. The cashier leans forward with a wide salesman smile as a white speech bubble pops up above the cashier reading "Want the protection plan?" and Ethan's face freezes mid-smile. Sound: a checkout scanner beeping, the speech bubble popping in, a faint store PA hum.
#Narration: You buy a TV. The cashier asks, "Want to add the protection plan?" The answer is almost always: no.

#Video: Shot 1: Low-angle wide shot, slow tilt up. A hardware store parking lot at dusk under a purple sky, the store roof running across the lower frame. Ethan stands small at the bottom center facing away from camera, head tilted back and mouth hanging open, looking up at two giant glowing white numbers hanging in the sky above the roof, "$1.27 BILLION collected" on the left and "$210 MILLION paid back" much smaller on the right, their glow lighting the back of his head. Sound: a low electric hum from the glowing numbers high above, a distant car passing in the lot.
#Narration: Last year, Lowe's made over a billion dollars selling warranties. They only paid back 210 million.

#Video: Shot 1: Medium shot at eye level, whip pan to the right at the end. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera holding a single green dollar bill stretched between his hands at chest height, and it rips down the middle into a small piece labeled "17¢" and a large piece labeled "83¢". Ethan is left holding the tiny scrap between two fingers with a flat expression while the big piece flies off to the right and out through a store window that appears at the right edge of frame. Sound: paper tearing slowly, a whoosh of paper flying, glass rattling faintly.
#Narration: That means for every dollar you spend on a warranty, the store keeps 83 cents. You get back 17.

#Video: Shot 1: Medium shot at eye level, slow pan from left to right along the row. A plain pale gray studio backdrop under soft even light. A flat-screen TV, a microwave and a dishwasher stand in a row across the frame from left to right, Ethan at the far left facing them with a calm reassuring face. As the camera pans, his pointing hand moves from the TV to the microwave to the dishwasher and a small white percentage label pops up above each one in turn, "5 to 8%", "12%", "13%". Nothing in the background. Sound: a light pop as each label appears, a soft tick as his finger passes each appliance.
#Narration: TVs only break 5 to 8 percent of the time. Microwaves, 12 percent. Dishwashers, 13 percent. The odds are on your side.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing the camera, flashing a confident thumbs up at chest height with a big grin, as bold green text booms into the empty space beside him on the right reading "SKIP THE WARRANTY", scaling up and settling with a bounce. Sound: a deep bass boom as the text lands, a short springy wobble.
#Narration: Skip it. Keep your cash. The only thing worth a warranty? A laptop. About one in three of those break.

#Music: Dark, spooky synth bass with a slow shuffling drum loop and a playful theremin wobble

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "Leak 5: Zombie Spending", the letters cracking slightly as they settle, with a thin white underline beneath. Nothing else in frame. Sound: a low slow zombie moan under a heartbeat thump.
#Narration: Leak number five. Zombie spending.

#Video: Shot 1: Wide shot at eye level, slow push-in. A foggy graveyard at night under a full moon, crooked gray headstones across the frame, a dead tree on the right. Ethan stands at the left facing right, backing away with wide frightened eyes, holding a blue credit card out in front of him. From the soil in the center, glowing app logos on stubby cartoon arms claw their way up out of the ground like zombies and drag themselves toward him, three of them gripping the edges of the card. Sound: dirt crumbling and shifting, the logos groaning and scraping, nails scratching on plastic close by.
#Narration: These are the worst. The subscription is dead to you. But it's still alive on your credit card.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands center facing a white card that floats in front of him at eye level, its text reading "60% forgot a recurring payment" in bold black, while he scratches the top of his head with one hand and squints at it with a puzzled frown. Sound: fingernails scratching on hair, a soft hum from the floating card.
#Narration: 60 percent of people have forgotten about a payment coming out every month. 71 percent say they waste at least 50 dollars a month on stuff they don't want anymore.

#Video: Shot 1: Medium shot at eye level, slow push-in on the calculator. A kitchen table in warm evening light, a gray desk calculator in the center of the table, a mug at the corner. Ethan sits behind the table facing the camera, fingers punching the calculator keys, and its display flashes "$50 x 12 = $600" in green digits. His shoulders drop and his gaze sinks to the display. Sound: calculator keys clicking, a small beep on the result, a long slow exhale, a chair creaking.
#Narration: That's 600 dollars a year. For nothing.

#Video: Shot 1: Medium shot at eye level, static camera. A plain kitchen wall in daylight, a large paper wall calendar hanging in the center of frame. Ethan stands at the right facing the calendar in profile, flipping a page up and over, and the new month is stamped with a giant red X across it. He flips two more pages in a row, each new month stamped with a giant red X as it lands, wincing harder with each flip. Sound: a page flipping and a stamp thunk, three times over, a small pained grunt.
#Narration: And here's the saddest part. When people finally notice, it takes them three to six months to actually cancel. That's half a year of paying for nothing.

#Video: Shot 1: Wide shot at eye level, slow push-in toward Ethan. A dim factory floor under hanging industrial lamps, a huge gray steel machine filling the background with pipes, gauges and a sign across its front reading "BIG COMPANIES", a conveyor belt running from the machine toward the right edge of frame. Ethan stands in the foreground at the left facing the machine, hands in his jacket pockets. A steel mechanical arm swings down from the machine into Ethan's jacket pocket, pulls out a fan of green dollar bills and drops them onto the moving conveyor belt at the right, Ethan looking down at his pocket in alarm. Sound: machinery clanking and whirring, servo motors whining, a hydraulic hiss from the arm, bills slapping onto rubber and rattling away.
#Narration: Here's the big secret. Every company you pay has set up a robot to take your money automatically. Your gym. Netflix. Your phone bill. They all know, if they didn't make it automatic, you'd stop paying.

#Video: Shot 1: Medium shot at eye level, slow pull back to a wide shot. The same dim factory floor under hanging industrial lamps, the huge gray steel machine labeled "BIG COMPANIES" behind, the conveyor belt running right. As the steel mechanical arm pulls back out of Ethan's jacket pocket at the left, Ethan grabs a big red lever on the machine's front with both hands and yanks it down, teeth gritted. The belt reverses and green dollar bills stream back along it into a pink ceramic piggy bank at the belt's end at the right, while Ethan turns to the camera grinning. Sound: a heavy metal clunk as the lever locks, the machinery groaning, the belt rattling in reverse, bills fluttering into the piggy bank with soft thumps.
#Narration: So here's the move. Turn that robot around. Make it pay you instead.

#Music: Clean, confident acoustic guitar strum with a light kick drum, purposeful and forward

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slams into the center of frame reading "The Fix", with a small white wrench icon turning once beside it. Nothing else in frame. Sound: a wrench tightening a bolt with a satisfying clink.
#Narration: Okay. Here's how. It takes 15 minutes. Tonight.

#Video: Shot 1: Extreme close-up from above, static camera. Ethan's phone fills the frame in soft indoor light. His thumb taps the gray "Settings" icon, then taps his name at the top of the settings list, then taps "Subscriptions", and a long list of app names scrolls into view from the bottom of the screen and fills it. Sound: soft screen taps, then the list whooshing up.
#Narration: Step one. The big one. If you have an iPhone, open Settings. Tap your name at the top. Tap Subscriptions. Every single thing you've signed up for will show up in one list.

#Video: Shot 1: Medium shot at eye level, slow push-in. A cozy living room in warm evening lamplight, a gray couch across the center of frame, a floor lamp on the right. Ethan sits center on the couch facing the camera, phone held up in both hands with its screen tilted toward camera showing the subscriptions list, his thumb tapping a red "Cancel" button over and over down the list while a white counter in the top corner of the screen ticks up "1, 2, 3, 4, 5", his smile growing wider with each tap. Sound: rapid screen taps, a small click with each tick, a quiet satisfied chuckle.
#Narration: Tap. Cancel. Tap. Cancel. Most people find 5 to 10 things they totally forgot about. On Android, open the Play Store, then Payments and Subscriptions. Same magic list.

#Video: Shot 1: Medium shot at eye level, slow tilt down from Ethan's face to the statement. A kitchen table in warm evening light, a printed bank statement lying flat in the center, a mug at the corner. Ethan sits behind the table facing the camera, holding a red marker uncapped above the statement, eyes scanning down the page, then his hand circles three repeating charges in red one after another and each circled number glows softly. Sound: paper rustling, the marker cap clicking off, the marker squeaking three times on paper.
#Narration: Step two. Open your bank app. Look at the last three months. Circle every charge that shows up every month. Even the tiny ones. Especially the 4 dollar and 99 cent ones. Those are the hiding spots.

#Video: Shot 1: Wide shot at eye level, static camera. A dim home office at night, Ethan seated center at a desk facing the camera, a laptop open in front of him, its screen showing an email search bar with "subscription, renewal, free trial" typed into it. Dozens of white email envelopes fly out of the laptop screen toward him and pile up in drifts around his chair and on the floor in the foreground, Ethan leaning back with wide eyes. Sound: keyboard keys clacking, then paper whooshing and flapping, envelopes landing in soft heaps.
#Narration: Step three. Search your email for "subscription", "renewal", and "free trial". You'll find stuff you forgot existed.

#Video: Shot 1: Straight-on close-up, static camera, on a solid black ground. White bold sans-serif text slides in from the left and locks in the center of frame reading "The Subscription Freeze", and pale blue frost crystals spread across the letters from the edges. Nothing else in frame. Sound: ice crystals forming with a soft frosty crackle.
#Narration: Now here's the lazy trick. It's called the Subscription Freeze. Cancel everything at once. All of it.

#Video: Shot 1: Medium shot at eye level, slow push-in on Ethan. A cozy living room in warm evening lamplight, a gray couch across the center of frame, a large round wall clock on the wall behind it. Ethan sits center on the couch facing the camera, calmly eating popcorn from a bowl on his lap with a relaxed, content expression, then gives a small easy shrug with both shoulders and raised eyebrows. Sound: a loud clock ticking close by, popcorn crunching, a final crunch.
#Narration: Then wait. See what you actually miss. You can always sign back up with one click. Most people find they don't miss much at all.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing the camera holding his phone up with its screen toward camera, a banking app on it reading "Automatic Transfer" with an amount of "$100". A glowing green arrow labeled "$100 / month" flows out of the phone screen and arcs across the frame into a pink ceramic piggy bank sitting on a small white pedestal at the right. Nothing in the background. Sound: soft screen taps and a confirmation chime, a smooth whoosh along the arrow, a coin clink as it reaches the piggy bank.
#Narration: Now here's the part nobody talks about. Don't just save that money. Send it somewhere automatic. Set up your bank to move 100 dollars a month into a savings or investing account. Same way Netflix takes from you. But now it's working for you.

#Music: Swelling, hopeful orchestral strings with a soft piano melody, warm and triumphant

#Video: Shot 1: Wide shot at eye level, slow tilt up. A sunny green hillside in golden late afternoon light, a giant tree in the center whose leaves are green dollar bills. Ethan, decades older, stands small at the base of the trunk facing the camera with a peaceful smile, hands clasped behind his back, dollar-bill leaves drifting down slowly around him and settling on the grass in the foreground. The tilt rises up the trunk to a glowing "$632,000" hanging in the top branches. Sound: leaves rustling in a light breeze, paper bills fluttering, a bird calling in the distance.
#Narration: 100 dollars a month. Invested for 40 years. Grows into 632 thousand dollars. From the same money you were already losing.

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands at the left facing the camera, pointing right at bold black text that bounces into the empty space beside him reading "Can't do 12%? Start with 1%." on two lines, with an encouraging smile. Below the text a pink ceramic piggy bank sits on a white surface, and a single tiny copper coin drops from above into its slot. Nothing in the background. Sound: a springy bounce as the text lands, then a small bright coin clink.
#Narration: Can't save a hundred bucks? Start with one percent of your paycheck. You won't even feel it. In a year, you'll be saving more than most Americans.

#Music: Sparse, cold piano notes over a low drone, still and heavy

#Video: Shot 1: Wide shot at eye level, static camera. A completely dark ground, nearly black, lit only by a faint spotlight from above. Ethan stands small and hunched in silhouette at the bottom left of frame, facing the camera, head down, hands in pockets. White bold text appears line by line in the empty space to his right at mid-height reading "You pay. You forget. They win." Nothing else in frame. Sound: a low slow heartbeat.
#Narration: You pay. You forget. They win.

#Video: Shot 1: Continuing the same static wide shot at eye level on the dark ground, Ethan's small hunched silhouette at the bottom left beside the white text reading "You pay. You forget. They win." on the right, the camera begins a slow push-in as his silhouette straightens up slowly to stand tall and square-shouldered, chin lifting. The white text on the right dissolves letter by letter and rewrites itself to read "Or you can stop forgetting." Sound: the heartbeat speeding up, a sharp inhale, then the heartbeat cutting out.
#Narration: Or you can stop forgetting.

#Music: Bright, punchy pop-electronic beat with a rising synth line, upbeat call to action

#Video: Shot 1: Medium shot at eye level, static camera. A plain pale gray studio backdrop under soft even light. Ethan stands center facing the camera, thrusting his phone up above his head in one fist with a triumphant grin, the other fist clenched at his side. Bold white text glows into place beside him on the right reading "Audit your bank statement. TONIGHT. 15 minutes." on three lines. Sound: a phone alarm chime, then a satisfying click as the text locks in.
#Narration: 15 minutes. Open your phone. Tap Settings. Tap Subscriptions. The money is already yours. Go get it back.
	`,
} satisfies TemplateInput;
