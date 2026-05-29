import dedent from "dedent";
import { BLOB_BASE_URL } from "@/lib/blob";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";

const templateAsset = (name: string) =>
	`${BLOB_BASE_URL}/assets/upload/template/${name}`;

export interface TemplateShowcase {
	image: string;
	title: string;
	description: string;
	examplePrompt: string;
}

export interface Template {
	id: string;
	name: string;
	pillText: string;
	color: string;
	exampleText: string;
	systemPrompt: string;
	style?: string;
	referenceImages: string[];
	characters?: Record<string, MetadataCharacter>;
	narration?: MetadataVoice;
	showcase?: TemplateShowcase;
}

export const TEMPLATES: Template[] = [
	{
		id: "pov-life",
		name: "POV Life",
		pillText: "POV: Your life at every stage as a",
		color: "#F59E0B",
		style:
			"2D cartoon illustration, thick black outlines, muted desaturated colors, cinematic night lighting, flat shading, western animation style, no gradients",
		referenceImages: [
			templateAsset("pov-life-stages-2"),
			templateAsset("pov-life-stages-3"),
		],
		characters: {
			Protagonist: {
				description: "American male, neutral accent",
				appearance:
					"male, average build, slightly hunched posture, bald, wearing a worn olive green jacket, grey t-shirt underneath, faded blue jeans, brown work boots",
				avatarUrl: templateAsset("pov-life-stages-4"),
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
			image: templateAsset("pov-life-stages-1"),
			title: "POV Your Life as A...",
			description:
				"Long-form, second-person POV voiceover with cartoon illustrations that walk a viewer through ascending stages of a role, career, or world",
			examplePrompt: "tech CEO",
		},
		systemPrompt: dedent`
		# Important
		- The main character (you) is always called Protagonist, and the Protagonist must always be present in the character list of images where appropriate
		- Do not generate character metadata for the Protagonist, but do use him like a regular character in the story
		- Never mention any specific ages in the image descriptions, just generic ones like young man`,
		exampleText: dedent`
				#Image: A title card with a black background and white Arial text that says "Level 1: The Kid with the Idea"
				#Narration: Level 1: The Kid with the Idea

				#Music: Soft, dreamy, optimistic lo-fi piano with twinkling synths, hopeful and childlike

				#Image: The young Protagonist watching YouTube videos on a phone about young app founders who got rich, posters on the wall behind him
				#Narration: You're 11. You watch YouTube videos about people who made apps and got rich.

				#Image: The Protagonist, a young man, daydreaming with a smile, imagining stacks of money and a sports car floating above his head in cartoon thought bubbles
				#Narration: You think you can do that too. You can't. Not yet.

				#Image: The Protagonist, a young man, hunched over a clunky laptop in his small messy bedroom, late at night, glow of the screen on his face, free coding website open
				#Narration: You teach yourself to code from a free website. The first thing you build is a calculator. It barely works.

				#Image: The Protagonist, a young man, in the kitchen showing his mom the calculator app on his laptop, mom smiling warmly while drying a dish
				#Narration: You show your mom. She says it's amazing. You know it isn't. You feel like a wizard anyway.



				#Image: A title card with a black background and white Arial text that says "Level 2: The Dropout"
				#Narration: Level 2: The Dropout

				#Music: Restless indie rock with a driving acoustic guitar, slightly anxious but full of momentum

				#Image: The Protagonist, a young adult, sitting on a dorm room bed with a laptop, an empty lecture hall visible through the window across the courtyard
				#Narration: You're 19. You're supposed to be in class. You're not.

				#Image: The Protagonist and two college friends sitting on the floor of a messy dorm room around a half-eaten pizza box, papers and laptops everywhere, talking excitedly
				#Narration: You're in your dorm with two friends and cold pizza. You have an idea. It changes every week.

				#Image: The Protagonist signing a withdrawal form at a college registrar's desk, looking nervous but determined
				#Narration: You quit school. Your parents cry on the phone.

				#Image: The Protagonist holding a phone to his ear, sitting alone on a park bench at dusk, looking into the distance
				#Narration: You promise this will work. You have no idea if it will.



				#Image: A title card with a black background and white Arial text that says "Level 3: The Garage"
				#Narration: Level 3: The Garage

				#Music: Cold, sparse, melancholic piano with subtle warm undertones, lonely but hopeful

				#Image: The Protagonist sitting at a folding table in a cold suburban garage, his breath visible in the air, an old laptop in front of him
				#Narration: You move home. Your mom lets you use the garage. There's no heat.

				#Image: The Protagonist typing on a laptop wearing a beanie, hoodie, and gray fingerless gloves, snow visible through a small garage window
				#Narration: In December you type with fingerless gloves. You eat cereal for dinner.

				#Image: The Protagonist at his laptop reading a rejection email, shoulders slumped, three crumpled rejection letters on the desk
				#Narration: You apply to a program that picks startups. They say no. You apply again. They say no.

				#Image: The Protagonist jumping in the air with his arms up in the freezing garage, laptop showing an acceptance email, mouth open mid-scream of joy
				#Narration: The third time, they say yes. You scream so loud the neighbor knocks on the door.



				#Image: A title card with a black background and white Arial text that says "Level 4: The First Hire"
				#Narration: Level 4: The First Hire

				#Music: Warm, curious, mid-tempo synth pop with a hopeful melody and soft drum machine

				#Image: A small bank account screen on a phone showing a modest seed funding deposit, the Protagonist's hand holding it
				#Narration: You raise a little money. Enough for one person who isn't you.

				#Image: The Protagonist, a young adult, shaking hands across a small desk with Sam, a slightly older engineer with glasses and a beard, in a tiny bare office
				#Narration: You hire an engineer named Sam. Sam is 28. You are 21.

				#Image: The Protagonist at his desk looking thoughtful, Sam standing nearby holding a notebook, both staring at a whiteboard covered in question marks
				#Narration: Sam asks questions you can't answer. You learn to say, "I don't know. Let's figure it out."

				#Image: A close-up of the Protagonist's face, slightly older now, looking quietly determined, soft warm light on him
				#Narration: That one sentence will save you a hundred times. Sam will stay three years. Sam leaving will hurt more than you expect.



				#Image: A title card with a black background and white Arial text that says "Level 5: The First Customer"
				#Narration: Level 5: The First Customer

				#Music: Bright, bouncy ukulele and handclaps building into a triumphant indie pop beat

				#Image: A close-up of a credit card receipt for $12.00 in the Protagonist's hand, his other hand making a fist of victory
				#Narration: A real person paid you real money. Twelve dollars.

				#Image: The framed receipt hanging on a brick wall in a small startup office, the Protagonist looking up at it proudly
				#Narration: You frame the receipt. Then ten people pay. Then a thousand.

				#Image: The Protagonist staring at a dashboard on his laptop showing a growing user count, his expression slowly shifting from joy to weight
				#Narration: Each new customer feels like magic for about a week. Then it stops being magic and starts being weight.

				#Image: The Protagonist at his desk holding his head, surrounded by angry customer support tickets popping up on his monitor in red
				#Narration: People depend on the thing you built. When it breaks, they get mad at you.



				#Image: A title card with a black background and white Arial text that says "Level 6: The Office"
				#Narration: Level 6: The Office

				#Music: Mid-tempo cinematic indie with steady drums and shimmering guitars, bittersweet and grown-up

				#Image: The Protagonist signing a lease document at a real estate agent's desk, keys to an office on the table
				#Narration: You sign a lease. You're 24.

				#Image: The Protagonist standing in front of a glass office door with the company logo etched into it, in a modern office building hallway
				#Narration: The office has your company name on the door. You stare at the sign for a long time the first morning.

				#Image: A wide shot of an open office with about fifty employees at standing desks, the Protagonist walking through it looking slightly overwhelmed
				#Narration: You hire fifty people. You can't remember everyone's name.

				#Image: The Protagonist at his desk looking at Slack on his laptop, scrolling through profiles of new employees, his expression sad and reflective
				#Narration: You used to know everyone's dog's name. Now you can't remember a new hire's last name without checking Slack. That bothers you more than you say out loud.



				#Image: A title card with a black background and white Arial text that says "Level 7: The Bad Year"
				#Narration: Level 7: The Bad Year

				#Music: Slow, somber piano with low cello drones, heavy and grieving

				#Image: A dark stormy sky over a city skyline, news headlines about an economic downturn faintly visible
				#Narration: Something breaks. Maybe the economy. Maybe a competitor. Maybe both.

				#Image: The Protagonist sitting alone in a conference room at night, looking at a spreadsheet of names with fifteen highlighted in red
				#Narration: You fire fifteen people. You write a long email.

				#Image: The Protagonist at his laptop, hovering over the send button on a long email, his finger trembling
				#Narration: You read it three times. You send it.

				#Image: The Protagonist sitting on the floor of his office with his back against the wall, staring at nothing, the city lights visible through the window
				#Narration: You sit on the floor of your office for an hour without talking. You used to think founders who cried at work were weak. You don't think that anymore.



				#Image: A title card with a black background and white Arial text that says "Level 8: The Big Number"
				#Narration: Level 8: The Big Number

				#Music: Slick, polished electronic beat with synth stabs, glamorous but slightly hollow

				#Image: A TechCrunch-style article on a laptop screen with a headline announcing a $100 million funding round, the Protagonist's photo as the hero image
				#Narration: You raise a hundred million dollars. The news writes about you.

				#Image: The Protagonist's phone screen lighting up with dozens of text message notifications from old contacts, his face glowing in the light
				#Narration: People from high school text you for the first time in years. Some want jobs. Some want money.

				#Image: A text message bubble on a phone reading an apology from a childhood bully, the Protagonist's thumb hovering over it without typing
				#Narration: One wants to apologize for being mean to you in fifth grade. You don't write back to most of them. You hate that you don't.

				#Image: The Protagonist at a dinner table with his young child and partner, looking down at his glowing phone instead of at his family
				#Narration: Your kid asks why you're on your phone at dinner. You don't have a good answer.



				#Image: A title card with a black background and white Arial text that says "Level 9: The Top"
				#Narration: Level 9: The Top

				#Music: Grand, sweeping orchestral score with strings and soft brass, regal but lonely

				#Image: A wide aerial shot of a gleaming corporate headquarters with the company logo on top of a skyscraper
				#Narration: The company is worth a billion dollars.

				#Image: The Protagonist sitting in a massive corner office with floor-to-ceiling windows overlooking a city, an assistant visible through the open door
				#Narration: You have a corner office and an assistant who guards your calendar like it's gold.

				#Image: The Protagonist staring at his laptop with hundreds of unread emails, an old code editor minimized in the corner of the screen, his expression wistful
				#Narration: You don't write code anymore. You write emails. So many emails. You miss writing code.

				#Image: The Protagonist at a tech conference signing a paper napkin for a starstruck stranger, looking confused and a little uncomfortable
				#Narration: At a conference, a stranger asks for your autograph. You laugh because you think it's a joke. It isn't. You sign a napkin. You feel weird about it for three days.



				#Image: A title card with a black background and white Arial text that says "Level 10: The Letting Go"
				#Narration: Level 10: The Letting Go

				#Music: Gentle acoustic guitar with warm strings, reflective and peaceful, ending with quiet hope

				#Image: The Protagonist standing at a podium in a company all-hands meeting announcing his departure, hundreds of employees watching
				#Narration: You step down. The board picks a new CEO.

				#Image: A confident woman sitting in the Protagonist's old corner office chair, the Protagonist watching from the doorway with a complicated expression
				#Narration: She's better at running a big company than you are. You know this. It still hurts to watch her sit in your chair.

				#Image: The Protagonist in casual clothes walking a golden retriever through a sunlit neighborhood park
				#Narration: You take six months off. You walk your dog twice a day. You learn to cook one good meal.

				#Image: The Protagonist sitting across from a young adult woman in a cozy coffee shop, both leaning over a napkin with a sketch on it
				#Narration: Then the itch comes back. You meet a kid in a coffee shop with an idea on a napkin. She's 22. She's scared and electric.

				#Image: The Protagonist's hand sliding a personal check across the coffee shop table to the young adult founder, who looks shocked
				#Narration: You write her a check. You tell her she has no idea what she's signing up for.

				#Image: A close-up of the young adult founder's hopeful face, eyes shining, the Protagonist slightly out of focus in the background watching her with a knowing smile
				#Narration: She doesn't believe you. You didn't believe it either. The cycle keeps going. It always does.`,
	},
	{
		id: "sleep-story",
		name: "Sleep Story",
		pillText: "A sleep story about",
		color: "#6366F1",
		referenceImages: [
			templateAsset("sleep-story-1"),
			templateAsset("sleep-story-3"),
			templateAsset("sleep-story-4"),
		],
		narration: {
			gender: "masculine",
			accent: "british",
			age: "child",
			language: "en",
			description: "Wistful, young male for emotional narrations",
			voiceId: "4f7f1324-1853-48a6-b294-4e78e8036a83",
		},
		showcase: {
			image: templateAsset("sleep-story-1"),
			title: "Get Sleepy with...",
			description:
				"Long-form, slow, soothing narration designed to lull listeners to sleep",
			examplePrompt: "a cat who wanders around gardens at night",
		},
		systemPrompt: dedent`
		# Important
		Add motion to all images. All narrations should have speed="slow".
		`,
		exampleText: dedent`#Music: Soft welcoming ambient pad in C major, slow warm analog synth swells, distant felted piano notes spaced far apart, very low binaural pink noise underneath, no percussion, evokes the moment of pulling a duvet up to your chin. 50 BPM. Loopable for ~3 minutes.
			#Image: A cozy bedroom at night seen from shouldlow angle, soft amber lamplight on a nightstand, a book turned face-down on a folded quilt, a window with deep indigo sky and a sliver of moon, dreamy painterly style with soft brush textures, warm muted palette of cream, ochre, navy, and dusky rose, cinematic depth of field
			#Narration: Welcome to Get Sleepy, where we listen, we relax, and we get sleepy. My name is Thomas, and I'm your host.
			#Image: A long-limbed charcoal gray tabby cat with luminous honey-gold eyes sitting in profile on a windowsill at dusk, soft fur catching warm interior light, looking out toward a moonlit garden, painterly storybook illustration, gentle low contrast, dreamy and tender
			#Narration: Tonight, we return once more to the cozy world of cats and the quiet gardens they patrol. If you've enjoyed the adventures of Auggie, our fluffy black-and-white friend, you're in for another treat. Tonight we meet Marlowe, a long-limbed charcoal tabby with eyes the color of poured honey.
			#Image: A small stone cottage at the end of a quiet country lane at dusk, ivy on the walls, warm yellow light glowing in the kitchen window, a kettle's steam visible through the glass, an apple tree to the side, summer evening sky deepening from rose to indigo, painterly storybook style, peaceful and inviting
			#Narration: Marlowe lives in a stone cottage at the end of a quiet lane, with a family who keeps the kettle warm and the windows open all summer long. Tonight's story has been written for you by Alicia Stefan and read by Simon. It's called Marlowe's Midnight Wander.
			#Image: An overhead view of a person nestled into a bed under a thick patchwork quilt, soft pillow, a single bedside lamp casting a circle of honey light, peaceful expression, painterly soft-focus, the rest of the room fading into gentle darkness
			#Narration: So make yourself comfortable. Adjust your pillows. Smooth out your blankets. Let your shoulders soften down away from your ears, and let your jaw release. There is nothing else you need to do tonight, and nowhere else you need to be.
			#SFX: A single distant church bell ringing once, very soft, with a long natural reverb tail, layered under a barely audible breeze through summer leaves
			#Image: A deep indigo night sky scattered with soft glowing stars like grains of sugar on velvet, a slim crescent moon, silhouette of a single old plum tree in the foreground with leaves stirring gently, painterly dreamlike quality, atmospheric and peaceful
			#Narration: Closing your eyes, picture a sky the color of deep ink, scattered with stars like grains of sugar spilled across velvet. The air is soft and cool. Somewhere far off, a church bell rings the hour, low and unhurried. A breeze stirs the leaves of an old plum tree just beyond the window. This is where our story begins.

			#Music: Drowsy summer-night ambient bed in A minor, soft sustained string drones, occasional faint pizzicato cello notes like footsteps, distant cricket chirps woven into the texture, a low warm bass pulse barely felt, no melody, evokes lavender and moonlight, 45 BPM, loopable for ~5 minutes.
			#Image: A close-up of a charcoal gray tabby cat at a small wooden cat flap set in a cottage door, one paw raised, ears tilted forward and alert, soft amber kitchen light glowing behind him, painterly children's book illustration style, warm and intimate composition
			#Narration: Marlowe paused at the cat flap, one paw raised, ears tilted forward like little furled leaves. From inside the kitchen came the comforting hum of the dishwasher and the distant murmur of the radio. From outside came something far more interesting — a faint, layered medley of scent and sound that drifted in on the evening air.
			#SFX: The soft squeak and gentle plastic-on-wood click of a cat flap swinging once, then settling
			#Narration: He pushed his head through the flap, then his shoulders, then, with one elegant motion, the rest of himself. The garden welcomed him.
			#Image: A charcoal tabby cat standing on weathered flagstones in a moonlit cottage garden, lavender bushes glowing silvery in the moonlight on either side of the path, an old apple tree in the background, deep blue night sky with soft stars, painterly storybook style, dreamy and serene
			#Narration: He stood for a moment on the flagstones, letting his eyes adjust. The night was velvet-warm, the kind of summer evening that seemed to hold its breath. The lavender bushes that bordered the path stood drowsy and heavy with their last blooms of the season. They released their scent in slow waves, perfuming the air with something that was equal parts honey and herb.
			#SFX: A very soft, slow cat-breath inhale and exhale, faint and intimate
			#Narration: Marlowe inhaled deeply, his sleek gray sides expanding and contracting like a small bellows. He proceeded down the garden path with the unhurried gait of a country gentleman. Marlowe did not run. Marlowe did not hurry. Marlowe walked, and the world adjusted around him.
			#Image: A wider view of a quintessential English cottage garden at night, low stone wall along one edge with cushiony patches of pale lichen, gnarled apple tree in a corner, herb bed near a kitchen door, wild patch of foxgloves and cow parsley by a wooden gate, all under soft moonlight, painterly and romantic, deep greens and silvers and blues
			#Narration: The garden belonging to his humans was, in his considered opinion, a very fine establishment. There was the low stone wall along the western edge, perfectly sun-warmed in the daytime and now releasing that warmth back into the cool evening. There was the gnarled apple tree in the corner, its lower branches just the right height for resting. There was the herb bed near the kitchen door, the wilder patch of foxgloves and cow parsley near the gate, and — his very favorite — the long stone wall topped with soft cushions of lichen that ran the length of the back garden, ideal for promenading.
			#Image: A charcoal tabby cat captured mid-leap in graceful arc, jumping up onto a moonlit stone wall covered in pale lichen, tail extended for balance, fur slightly windblown, soft motion blur, painterly illustration style, sense of effortless elegance
			#SFX: The barely audible soft thump of cat paws landing on stone, followed by a tiny scrape of claws finding purchase
			#Narration: He made his way toward this wall now, leaping up onto it with the offhand grace of one who had done this a thousand times. From this vantage, he could survey both his own garden and the gardens of the two neighbors whose properties lay on either side.

			#Music: Slightly playful but still drowsy ambient piece in F major, low warm cello drone underneath, gentle clarinet or recorder phrases drifting in and out, a single soft glockenspiel note here and there for the comic dignity of the cat, distant owl hoot woven in once or twice, no rhythm section, evokes a wry observational night-watch, 50 BPM, loopable for ~5 minutes.
			#Image: A view from the top of a stone wall looking sideways into a neighboring garden full of climbing pink and white roses, with a small wooden chicken coop in the corner where three plump bantam hens are roosting peacefully, soft moonlight, painterly storybook style, abundant and idyllic
			#Narration: To the east lived Mrs. Pemberton, a kind elderly lady whose garden was a riot of climbing roses. She also kept three plump bantam hens, who were currently roosting in their little wooden coop and emitting the soft, contented clucks of birds who have eaten well and feel safe.
			#SFX: Three soft, low, sleepy hen clucks spaced out, very gentle, almost a contented murmur
			#Narration: The hens were no concern of Marlowe's. He had decided long ago that they were beneath his notice. They spent all day flustering about and pecking at the ground, and they had no conversation to speak of.
			#Image: A charcoal tabby cat sitting in serene perfect stillness on top of a fence, tail curled neatly around his white-socked paws, eyes half-closed in dignified disdain, while a huge russet-colored shaggy dog gazes up at him from the other side with sad baffled adoring eyes, painterly humor, soft moonlit palette
			#Narration: To the west lived a younger couple with a great shaggy dog named Beauregard. Beauregard was a russet-colored mountain of fur and friendliness, and he had spent much of his early career barking at Marlowe through the fence.
			#Narration: Marlowe had endured these efforts with serene indifference, sitting just out of reach with his tail curled neatly around his paws, blinking slowly, as if the noise were a faintly tedious weather report.
			#Narration: In time, Beauregard had given up. Now, when their paths crossed, the great dog simply gazed at Marlowe with sad, baffled eyes, and Marlowe — magnanimous in victory — would offer a single, gracious twitch of his tail in reply.
			#Image: A wide tranquil view of an empty cottage garden at night under a rising moon, no creatures stirring, lavender and foxgloves silvered with light, the stone wall stretching invitingly into the distance, a charcoal tabby cat small in the frame standing alone atop the wall, painterly atmospheric, peaceful and full of possibility
			#SFX: A very soft summer night ambience: faint distant crickets, a single far-off owl hoot, barely-there breeze through leaves
			#Narration: Tonight, Beauregard was nowhere to be seen. The garden was empty of dog, empty of human, empty of fuss. Marlowe began to walk the length of the wall.`,
	},
	{
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
	},
	{
		id: "true-crime",
		name: "True Crime",
		pillText: "A true crime story about",
		color: "#8A0000",
		style:
			"Semi-realistic digital comic illustration, cel-shaded with bold ink outlines, muted earthy palette, cinematic dramatic lighting, gritty detailed textures, expressive characters, vertical 9:16 composition, Rockstar Games concept art style",
		referenceImages: [
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/true-crime-1",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/true-crime-2",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/true-crime-3",
			"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/true-crime-4",
		],
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description: "Friendly young adult male",
		},
		showcase: {
			image:
				"https://mqzeech9ugknls54.public.blob.vercel-storage.com/assets/upload/template/true-crime-5",
			title: "True Crime",
			description:
				"Long-form, wild true crime stories told like a buddy spilling the craziest thing he ever heard",
			examplePrompt: "Andres Escobar",
		},
		exampleText: dedent`
#Music [tense, dramatic intro]

#Image [a soccer ball lying in grass with blood splattered on it]
#Narration: Imagine getting so mad about a soccer game that you kill someone.

#Image [Andres Escobar smiling in a Colombia jersey, stadium behind him]
#Narration: So the story starts with this guy, Andreas.

#Image [Andres standing in front of a Colombian flag, looking friendly]
#Narration: And Andreas is about 27, and he lives in Colombia.

#Image [Andres in a soccer uniform kicking a ball on the field]
#Narration: And he plays soccer for his country's big team.

#Image [fans cheering and holding up Andres jerseys]
#Narration: Everyone there loves him because he's a nice dude.

#Image [Andres shaking hands politely with another player after a game]
#Narration: He doesn't talk trash. He doesn't play dirty. He's just chill.

#Image [a massive crowd of Colombian fans waving yellow flags in a city street]
#Narration: And in Colombia, soccer is a HUGE deal. Like, a really huge deal.

#Image [Andres on a magazine cover labeled "EL HÉROE"]
#Narration: So Andreas isn't just famous. He's basically a hero.

#Image [scoreboard showing Colombia 5, Argentina 0]
#Narration: But then in 1993, his team smashes Argentina five to zero.

#Image [Andres jumping in celebration with his teammates on the field]
#Narration: Boom. That means Colombia gets to play in the World Cup.

#Sound [crowd cheering, horns blaring]
#Image [people partying in the streets of Bogotá, confetti everywhere]
#Narration: And the whole country goes nuts.

#Image [shadowy men in suits watching a small TV in a dim room]
#Narration: But here's the problem. The bad guys are watching too.

#Image [a chalkboard with betting numbers and stacks of cash on a table, angry cartel men around it]
#Narration: The Colombian drug cartel, basically a giant crime gang, they bet millions of dollars on Colombia to win.

#Image [Andres looking nervous, hand on his head in a locker room]
#Narration: So now Andreas isn't just playing for fun. He's playing to keep some very scary people happy.

#Music [music turns darker]

#Image [airplane flying over California palm trees]
#Narration: So in 1994, the team flies to California for the World Cup.

#Image [scoreboard showing Romania 3, Colombia 1]
#Narration: First game, Colombia versus Romania. And they lose. Three to one.

#Image [Colombian fans crying in front of a TV at home]
#Narration: The whole country is bummed.

#Image [angry cartel boss slamming his fist on a desk, money flying]
#Narration: The drug cartel? They are FURIOUS. They just lost a ton of money.

#Image [a dark hotel hallway with one door slightly open]
#Narration: And here's where things get really scary.

#Image [hotel room TV glowing with a creepy threatening message on screen]
#Narration: Back at the team's hotel, somebody hacks into the TVs.

#Image [close-up of the TV screen showing skull and crossbones with a written warning]
#Narration: And instead of a hello message, there's a threat. It says, "Don't let this one player play, or we'll kill all of you and bomb your families."

#Sound [static, heartbeat]
#Image [players sitting around the hotel room looking terrified]
#Narration: The team is freaking out.

#Image [Andres lacing up his cleats with a calm, focused face]
#Narration: But Andreas, being the chill guy he is, he stays positive. He's gonna give it his all.

#Image [huge packed stadium with Colombia and USA flags everywhere]
#Narration: Next game. Colombia versus the USA. Ninety thousand fans in the stands.

#Image [empty Colombian street, closed shop signs, only a glowing TV through a window]
#Narration: Back home, stores are closed. Families are glued to the TV.

#Image [cartel men watching the game intensely in a smoky room]
#Narration: And yep, the cartel guys are watching too.

#Music [intense game music]

#Image [Andres sprinting on the soccer field, ball at his feet]
#Narration: The game starts. Andreas is playing hard. Running, kicking, doing his thing.

#Image [stadium clock showing 20 minutes, players mid-play]
#Narration: But then, about 20 minutes in, something crazy happens.

#Image [American player kicking a long pass across the field]
#Narration: An American player tries to pass the ball.

#Image [Andres sliding with his leg out toward the ball]
#Narration: Andreas slides in to stop it.

#Image [slow-motion close-up of ball bouncing off Andres's cleat at a weird angle]
#Narration: But the ball bounces off his foot at a weird angle...

#Sound [whoosh, then a net swish]
#Image [the ball hitting the back of the Colombian net, goalie diving the wrong way]
#Narration: ...and rolls right past his own goalie into his own net.

#Image [Andres on his knees, hands on his head, devastated]
#Narration: Yep. Andreas just scored on his own team.

#Image [close-up of Andres's face, tears in his eyes]
#Narration: And he knows right away. This is it. They're done.

#Image [final scoreboard: USA 2, Colombia 1]
#Narration: And so Colombia loses. And they get kicked out of the World Cup.

#Image [angry Colombian fans burning jerseys in the street]
#Narration: And the whole country is mad. And everybody starts pointing the finger at Andreas.

#Sound [phone ringing creepily]
#Image [a hotel phone ringing with a shadowy hand reaching for it]
#Narration: Pretty quick, the players start getting scary phone calls.

#Image [a player listening to the phone with a horrified face]
#Narration: Like, "We're gonna hurt you" calls.

#Image [the team eating dinner together at a US restaurant, looking nervous]
#Narration: So the team decides to stay in America for a bit.

#Image [Andres smiling and signing an autograph for a kid at an airport]
#Narration: But Andreas? Nah, he's not scared. He's a positive dude.

#Image [Andres walking off a plane in Colombia, suitcase in hand]
#Narration: So he flies back to Colombia.

#Image [Andres's mom hugging him in a kitchen, looking worried]
#Narration: His friends, his family, even his coach beg him, "Please stay inside. It's not safe."

#Image [Andres looking out a window with a determined expression]
#Narration: But Andreas doesn't want to hide.

#Image [a newspaper with Andres's column printed and his photo next to it]
#Narration: He even writes a public letter saying sorry for the goal, and that "life doesn't end here."

#Image [Andres looking up at the sky, a small sad smile on his face]
#Narration: Welp. He had no idea how wrong he was about to be.

#Music [darker, slower music]

#Image [neon nightclub sign glowing in the dark]
#Narration: Ten days later, Andreas goes out to a nightclub with his friends.

#Image [Andres laughing with friends at a club table, drink in hand]
#Narration: He's finally feeling okay again.

#Image [a group of mean-looking men in fancy shirts glaring across the club]
#Narration: But across the room, there's a group of bad guys, the Gallon brothers.

#Image [the brothers counting stacks of cash earlier in a dim room]
#Narration: They're in the cartel. And they bet a TON of money on that game. And they lost.

#Image [the brothers pointing and yelling at Andres across the club]
#Narration: They see Andreas and start yelling mean stuff at him, making fun of him for that goal.

#Image [Andres calmly sipping his drink, looking the other way]
#Narration: But Andreas, being chill, just ignores it.

#Image [Andres standing up from his table, putting on his jacket]
#Narration: Eventually he's like, "I'm out."

#Image [Andres walking through a dark parking lot toward his car]
#Narration: So he heads to the parking lot and gets in his car.

#Image [the Gallon brothers and a huge bodyguard following him out the door]
#Narration: But the bad guys follow him outside. They keep yelling.

#Image [Andres holding his hands up, trying to explain himself]
#Narration: And Andreas tries to explain, "Hey, it was just an accident. It could happen to anybody."

#Sound [tense silence]
#Image [the brothers' angry faces, fists clenched]
#Narration: But they don't care. They lost millions. And they want somebody to blame.

#Sound [blam blam blam blam blam blam]
#Image [the bodyguard pulling a gun from his jacket, muzzle flash lighting up the lot]
#Narration: And suddenly, their bodyguard pulls out a gun and shoots Andreas six times.

#Image [the bodyguard yelling with a twisted, mocking face]
#Narration: And after every single shot, he yells, "GOOOAL!" making fun of the mistake.

#Image [crime scene tape stretched across a dark parking lot, car door open]
#Narration: Then they jump in their car and drive off. And sadly, Andreas doesn't make it.

#Image [a soccer ball sitting alone in an empty stadium]
#Narration: All that... over a soccer game.

#Image [bodyguard's mug shot under a police number board]
#Narration: Now, the Gallon brothers ordered the hit, but their bodyguard takes the fall.

#Image [the bodyguard in handcuffs being walked out by police]
#Narration: And bam, he gets arrested. Here's his mug shot.

#Image [the Gallon brothers smirking and sliding an envelope of cash to a man in a suit]
#Narration: Now this part is gonna make you mad. The Gallon brothers? The guys who actually ordered the hit? They paid off the prosecutors.

#Image [the brothers walking free outside a courthouse, smiling]
#Narration: So they never got in trouble. Not one bit.

#Image [the bodyguard walking out of prison with a duffel bag, only 11 years later]
#Narration: And the bodyguard? He got sentenced to 43 years. But because of his connections, he only served 11.

#Music [somber outro]
#Image [a memorial statue of Andres Escobar with flowers piled at the base]
#Narration: And that's the wild, sad story of how a soccer game ended a man's life.`,
		systemPrompt: dedent`
You write short narrative scripts in the style of viral YouTube true-story/crime videos. Pastiche these conventions precisely:

# OPENING HOOK
Open with a single punchy sentence that previews the wildest part of the story. Examples: "Imagine getting so mad over [X] that you murder someone." / "So this guy is about to [win/lose] [absurd thing] and then he's going to jail." / "So this man's obsession with [random thing] is about to go very wrong."

# PROTAGONIST SETUP
Immediately introduce the protagonist by first name, approximate age, and location: "Now, the guy's name is [Name]. And [Name] is about [X] when this story starts, and he's living in [Place]." Follow with a one-line problem statement: "And [Name] has a problem."

# VOICE & TONE
- Casual, conversational, like telling a buddy a wild story at a bar
- First person narrator addressing the viewer directly ("I mean," "you know," "anyway")
- Mild profanity
- Sarcastic asides and dry humor ("Sure, Jan." / "I'm not making that up." / "give it a week or two")
- Self-aware tangents and rhetorical questions ("And I don't know why this multi-millionaire doesn't have his own place, but whatever.")
- Editorial reactions ("Damn." / "poor [Name]" / "this part's definitely going to make you mad")

# PACING & STRUCTURE
- Heavy use of "And," "So," "Now," "But then," "Anyway," and "And here's where things get [crazy/really out of control/scary]" as paragraph engines
- Run-on sentences chained with "and" mixed with short punchy ones
- Escalate events in clear beats, each worse or weirder than the last
- Frequent reset phrases: "And so from there..." / "Here's where things get really out of control."
- Maintain the rhythm: hook → setup → escalation → climax → fallout.

# ONOMATOPOEIA
Use written-out sound effects liberally and in clusters: blam blam blam, boom, bam, pow, kaboom, skirt, screech.

# IMAGERY CUES
The narrator should narrate the images that the viewer sees: "Here's his mug shot." / "Here's a picture of him." / "If you slow the body cam footage way down, you can see..." Use oddly specific numbers and dollar amounts for realism.

# IMAGE MOTION
Each static image should have a motion attribute, vary these as appropriate

# IMAGE FREQUENCY
Each narration sentence should have a different image associated with it

# CLOSING
Wrap up with the aftermath — arrest, trial, sentence, ironic twist, or grim ending — delivered matter-of-factly. Optional dry one-liner to button it ("All that because of a [thing].").
`,
	},
	{
		id: "kids-animated",
		name: "Kids Animated",
		pillText: "A kids animated story about",
		color: "#10B981",
		referenceImages: [],
		exampleText: "TODO",
		systemPrompt: dedent`TODO`,
	},
	{
		id: "psychology-of",
		name: "Psychology",
		pillText: "Psychology of",
		color: "#EC4899",
		referenceImages: [],
		exampleText: "TODO",
		systemPrompt: dedent`TODO`,
	},
];

export const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}
