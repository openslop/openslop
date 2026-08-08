import dedent from "dedent";
import { BLOB_BASE_URL } from "@/lib/blob";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";
import type { VideoLength } from "@/lib/video/videoLength";

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
	length: VideoLength;
	style?: string;
	referenceImages: string[];
	characters?: Record<string, MetadataCharacter>;
	/** Prebuilt avatars, seeded as the character avatar nodes' results. */
	characterAvatars?: Record<string, string>;
	narration?: MetadataVoice;
	showcase?: TemplateShowcase;
}

export const TEMPLATES: Template[] = [
	{
		id: "pov-life",
		length: "5-10m",
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
			},
		},
		characterAvatars: { Protagonist: templateAsset("pov-life-stages-4") },
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
		length: "5-10m",
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
		length: "5-10m",
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
			},
		},
		characterAvatars: { Ethan: templateAsset("finance-tips-1") },
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
		length: "5-10m",
		name: "True Crime",
		pillText: "A true crime story about",
		color: "#8A0000",
		style:
			"Semi-realistic digital comic illustration, cel-shaded with bold ink outlines, muted earthy palette, cinematic dramatic lighting, gritty detailed textures, expressive characters, vertical 9:16 composition, Rockstar Games concept art style",
		referenceImages: [
			templateAsset("true-crime-1"),
			templateAsset("true-crime-2"),
			templateAsset("true-crime-3"),
			templateAsset("true-crime-4"),
		],
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description: "Friendly young adult male",
		},
		showcase: {
			image: templateAsset("true-crime-5"),
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
		id: "pov-financial-lifestyle",
		length: "10-15m",
		name: "POV Financial Lifestyle",
		pillText: "POV: You're a",
		color: "#059669",
		style:
			"Flat 2D vector cartoon illustration in a modern animated web-comic style. Bold, clean black outlines of even weight. Smooth cel-shaded coloring with soft gradient lighting, gentle ambient glow, and warm cozy color palettes. Slightly muted, desaturated tones with warm highlights. The Protagonist has rounded, soft proportions and a friendly approachable look, rendered against richly illustrated environments. Clean, polished, professional digital cartoon aesthetic reminiscent of explainer-video and meme-style animation.",
		referenceImages: [
			templateAsset("pov-financial-lifestyle-1"),
			templateAsset("pov-financial-lifestyle-2"),
			templateAsset("pov-financial-lifestyle-3"),
			templateAsset("pov-financial-lifestyle-4"),
		],
		characters: {
			Protagonist: {
				description: "Young American man",
				appearance:
					"A young everyman with a smooth, rounded egg-shaped head, pale skin, no nose, small black dot eyes, thick straight dark eyebrows, and a faint neutral mouth. He wears a navy baseball cap (worn forward or backward) and casual everyday clothing—hoodies, button-up shirts, or jackets in muted tones.",
			},
		},
		characterAvatars: {
			Protagonist: templateAsset("pov-financial-lifestyle-5"),
		},
		narration: {
			gender: "masculine",
			age: "adult",
			pitch: "medium",
			accent: "american",
			description:
				"Inviting, cheerful young adult male named Corey for casual conversation",
		},
		showcase: {
			image: templateAsset("pov-financial-lifestyle-1"),
			title: "POV Financial Lifestyle",
			description:
				"Walk the viewer through a money-driven lifestyle with advice along the way",
			examplePrompt: "silent millionaire with $110 million",
		},
		systemPrompt: dedent`
		# Important
		- The main character (you) is always called Protagonist, and the Protagonist must always be present in the character list of images where appropriate
		- Do not generate character metadata for the Protagonist, but do use him like a regular character in the story
		- Add appropriate motion to each image`,
		exampleText: dedent`
#Music: soft slow ambient piano, calm and quiet, a little mysterious

#Image: The Protagonist walking outside in an ordinary neighborhood street during daylight, full of people walking their dogs and with their partners

#Narration: You have four hundred and eighty million dollars. And nobody knows.

#Image: The Protagonist standing in line at a small-town diner, looking completely ordinary, warm morning light.

#Narration: Not your neighbors. Not your friends.

#Image: Close-up of a diner worker handing a cup of black coffee across the counter to The Protagonist.

#Narration: Not the man who pours your coffee every morning and knows you take it black.

#Sound: quiet diner chatter

#Image: The Protagonist walking down a quiet sidewalk past other people, blending in, nobody noticing him.

#Narration: You're not hiding. You just look normal on purpose.

#Image: A flashy man in an expensive watch posing next to a shiny sports car, while The Protagonist walks by unnoticed in the background.

#Narration: Everybody else chases the look of money. You quietly became the real thing.

#Image: A phone screen showing a plain email with the subject line "Money Report."

#Narration: And here is the strange part. The big number showed up in a boring email.

#Image: The Protagonist standing at a glowing ATM screen inside a dim gas station at night.

#Narration: No party. No champagne. Just you, standing in a gas station at night, getting cash from a machine.

#Sound: soft electronic beep of an ATM keypad

#Image: A close-up of a small ATM with an "Out of Cash" message on the screen at a gas station.

#Narration: It started with a broken machine. Not a big idea. Just a Tuesday.

#Image: An annoyed customer turning away from the broken ATM, throwing up their hands.

#Narration: You stop to get cash. The ATM is empty. Most people get mad and walk away.

#Image: The Protagonist standing still, staring thoughtfully at the small ATM machine.

#Narration: You don't. You stop. You look at it a different way.

#Image: A thought bubble effect — The Protagonist looking at the ATM with a question mark glowing above it.

#Narration: You think one quiet question. Who actually owns this little machine?

#Image: The Protagonist sitting on a couch at night, lit by a laptop screen, searching on the internet.

#Narration: You go home. You look it up. It takes forty minutes. Most people would never bother. You did.

#Sound: soft keyboard typing

#Image: A notepad on a couch cushion with simple numbers written on it, a phone beside it.

#Narration: You find out one little machine can make sixty to three hundred dollars a month.

#Image: A glowing ATM in a busy hallway, people walking past and using it one by one.

#Narration: It just sits there. It helps strangers all day. And it pays the owner every single time.

#Image: The Protagonist loading a used ATM machine into the back of an SUV in a parking lot.

#Narration: So you buy your first machine. Used. A little beat up on one side. Eight hundred dollars.

#Sound: a heavy machine sliding, a car trunk closing

#Music: light hopeful acoustic guitar, gentle, simple

#Image: The Protagonist shaking hands with a friendly bar owner inside a warm, busy bar at night.

#Narration: You put it in a busy bar. You fill it with your own cash. You shake hands on a deal.

#Image: A notepad on a table with "$90" circled in pen, sitting next to a phone.

#Narration: The first month, you make ninety dollars.

#Image: A tired worker in a uniform clocking out at a job, looking at a paycheck.

#Narration: Ninety dollars. Your friend made more than that last weekend doing one extra shift.

#Image: The Protagonist sitting alone on a couch in a dim apartment at night, looking at his phone with a flat face.

#Narration: Nobody claps. Nobody even knows. You sit with the number on a Thursday night.

#Image: Close-up of The Protagonist's calm, unreadable face lit by the soft glow of a lamp.

#Narration: It doesn't feel like pride. It doesn't feel like a letdown. It's something quieter than both.

#Image: The Protagonist staring at his notepad with quiet focus, the number "$90" glowing.

#Narration: But you don't quit. Because you're not looking at the ninety dollars. You're looking at what the ninety dollars proves.

#Image: Three ATM machines lined up in a row in a garage, The Protagonist standing proudly beside them.

#Narration: It proves the little machine works. So you buy a second one. Then a third.

#Image: The Protagonist driving slowly past a long row of storage units by a highway, looking out the car window.

#Narration: Now you start watching other boring things the same way.

#Image: A wide shot of a self-storage lot with rows of orange metal doors under a gray sky.

#Narration: Not as a customer. But as someone trying to see who owns the thing.

#Image: A person rolling up a storage unit door, boxes and furniture stacked inside.

#Narration: You learn a small storage lot can make a lot of money every year. And people always need a place to put their stuff.

#Music: steady calm background hum, patient and slow

#Narration: That need does not go away when times get hard. It just keeps going. Month after month.

#Image: The Protagonist standing in front of a slightly run-down storage lot, holding a clipboard.

#Narration: You buy your first storage lot for fifty-five thousand dollars. The fences are old. The cash flow is real.

#Image: An old paper notebook full of messy handwritten numbers, sitting on a desk next to a flip phone.

#Narration: The man who sold it ran the whole place out of a flip phone and a spiral notebook.

#Image: The Protagonist at a kitchen table at midnight, doing math by the light of one lamp.

#Narration: The first year, it nets thirty-two thousand dollars. You don't celebrate. You use it to buy the next one.

#Sound: a pen scratching on paper, a clock ticking softly

#Image: A calm older woman in glasses sitting at a folding table in a small back office, reading a folder.

#Narration: Your accountant's name is Karen. She has done books for small businesses for nineteen years.

#Image: A messy cardboard shoe box overflowing with crumpled paper receipts on a desk.

#Narration: She does not get impressed easily. She has seen messy books kept in a shoe box.

#Image: Close-up of Karen's hands turning the pages of a thick folder, her face thoughtful.

#Narration: You hand her a folder. Inside is everything you own. She reads it slowly. She doesn't speak for a while.

#Image: Karen looking up from the folder with a small flat expression, The Protagonist sitting across from her.

#Narration: Then she looks up and says, "This is the most boring set of businesses I have ever seen."

#Image: The Protagonist smiling just slightly, calm and pleased, sitting at the folding table.

#Narration: She means it as a small insult. You take it as the best thing anyone has ever said to you.

#Image: A folder open on a table showing simple printed pages and small photos of ATMs, storage units, and a car wash.

#Narration: Here is what's in the folder. A row of cash machines in bars and gas stations. Four storage lots. Three car washes. A mobile home park. And a porta-potty rental company.

#Image: A coin-operated car wash bay with a car inside, water spraying, on a quiet afternoon.

#Narration: None of it is exciting. None of it makes the news. All of it makes money every single month.

#Sound: water spraying from a car wash hose

#Image: Karen leaning forward at the table, asking a question, The Protagonist across from her shaking his head no.

#Narration: Karen asks if you want to do something more exciting. Maybe a tech company. Something with big upside.

#Image: Karen quietly closing the folder, a small puzzled look on her face.

#Narration: You say no. She nods. She doesn't fully understand it.

#Image: A split image: people washing cars, people storing boxes, people getting cash — all small everyday moments.

#Narration: Here is the secret she can't see. Every single thing you own fixes a small problem that never goes away.

#Image: A wide shot of a mobile home park with neat rows of homes under an evening sky.

#Narration: People always need cash. People always need to store stuff. Cars always get dirty. People always need a place to live.

#Image: A clean row of portable toilets set up at the edge of a busy outdoor construction site.

#Narration: There is no app coming to replace a parking lot. No one is going to out-smart a porta-potty.

#Image: The Protagonist standing calmly in an empty storage lot at dusk, alone and content.

#Narration: The flashy people fight in markets where everyone is watching. You picked the markets nobody watches.

#Music: slow steady piano, calm and grounded

#Image: A bright trendy store with a "CLOSED" sign, while a plain laundromat next door stays open and busy.

#Narration: The quiet ones that just keep running. Long after the exciting thing down the street has closed.

#Image: A man in an expensive white t-shirt at a party, talking loudly, holding a fancy drink.

#Narration: There's a man at a party. You've seen his type before.

#Sound: party chatter, ice clinking in a glass

#Image: Close-up of the expensive plain white t-shirt, looking simple but pricey.

#Narration: His plain white shirt costs three hundred dollars. You know because you looked it up once.

#Image: A shiny gray custom-wrapped truck parked outside a party, lit by streetlights.

#Narration: He drives a shiny gray truck with a custom wrap. He talks about his money the way some people talk loud in a quiet room.

#Image: An older, plain SUV with a small crack in the rear bumper, parked in a dim lot.

#Narration: You drove here in a five-year-old SUV with a crack in the back bumper you keep meaning to fix.

#Image: The Protagonist in a plain zip-up fleece, holding a glass of water at the party.

#Narration: You wear a fleece from a sporting goods store. It was on sale. Your watch just tells time.

#Image: The Protagonist calmly talking to the flashy man, who is half-listening and starting to look away.

#Narration: When he asks what you do, you say you own a few small businesses. Car washes, mostly.

#Image: Close-up of the flashy man giving a polite, dismissive smile and turning toward someone else.

#Narration: You watch his face do the math. The old car. The fleece. The car washes. He smiles and turns away.

#Image: The Protagonist quietly slipping out the door of the party, unnoticed, into the night.

#Narration: Good. The moment someone thinks you're small, they stop watching you. And then you can do anything.

#Image: The Protagonist getting into his plain SUV in the dark, calm and unbothered.

#Narration: That's what people get wrong about hiding your money. It isn't shyness. It's armor. You wear it on purpose.

#Narration: The old car isn't sad. It's a tool. It starts every morning. And nobody looks at it twice.

#Sound: a car engine starting

#Image: A warm phone screen showing an incoming call from "Marcus," a friendly photo.

#Narration: Your best friend since school is named Marcus. He calls on random days just to check in. No reason. Just calling.

#Music: soft warm emotional piano, gentle and a little sad

#Image: The Protagonist sitting in his parked car at night, phone to his ear, listening carefully.

#Narration: A few months ago, Marcus called. But this time something was underneath his voice.

#Image: A colorful food truck at night with a long line of happy customers waiting.

#Narration: He has a food truck. Good food. A real crowd. He wants to grow. He needs eighty-five thousand dollars.

#Sound: a busy food truck window, sizzling on a grill

#Image: Close-up of The Protagonist's thumb hovering over a "Send Money" button on his phone screen.

#Narration: You could send that money before the call ended. You wouldn't even feel it.

#Image: The Protagonist sitting still in his dark car, eyes closed, phone pressed to his ear.

#Narration: But you didn't. You sat with the phone against your ear and you just listened.

#Image: A worried business owner staring at a pile of unpaid bills on a counter.

#Narration: Because money handed to someone who isn't ready doesn't fix the problem. It speeds up whatever is already there.

#Image: The Protagonist sitting at a friend's kitchen table with a notepad and two coffee mugs.

#Narration: So instead of sending money, you asked to come by Saturday morning.

#Sound: two coffee mugs set on a wooden table

#Image: Two men leaning over papers and a calculator at a kitchen table, focused.

#Narration: You sat with him for three hours. You found two leaks in his costs. You asked the hard questions nobody had asked him.

#Image: A calendar with four Saturdays marked in pen.

#Narration: You came back the next Saturday. And the one after that.

#Image: Marcus smiling and holding up a signed paper, looking proud and relieved.

#Narration: By the fourth Saturday, Marcus had a better deal, a small business loan, and a plan that didn't even need your money.

#Image: Marcus standing in front of his new empty shop at night, holding a set of keys, wiping his eyes.

#Narration: He signed his lease weeks later. He called you the night he got the keys. He was crying a little.

#Music: soft hopeful swelling piano

#Image: The Protagonist smiling quietly to himself, looking at his phone after a call.

#Narration: He said he couldn't have done it without you. You never told him what you could have written the check for. You probably never will.

#Image: The Protagonist standing in a bright hardware store aisle full of pipes and fittings, holding his phone.

#Narration: The email comes on a Thursday at 7:12 in the morning. You are standing in the plumbing aisle of a hardware store.

#Sound: quiet hardware store hum, a forklift beeping far away

#Image: Close-up of The Protagonist's hand holding a bottle of drain cleaner next to shelves of copper pipes.

#Narration: You're holding a bottle of drain cleaner. One of your car washes has a slow drain.

#Image: A phone screen showing an email from Karen with the subject "Money Report — Final."

#Narration: Your phone buzzes. The subject line says: Money Report. Final. It's from Karen.

#Sound: a soft phone buzz

#Image: The Protagonist setting a bottle of drain cleaner back on a store shelf, eyes locked on his phone.

#Narration: You almost put the phone away. But something in the number stops you. You put the drain cleaner down.

#Image: Extreme close-up of The Protagonist's eyes reading the glowing phone screen, very still.

#Narration: You read the line twice. The way you read something when you're not sure you read it right.

#Image: A phone screen showing a large dollar number at the top of a plain email.

#Narration: Everything you own, added up, has crossed four hundred and eighty million dollars.

#Music: slow quiet piano, one held note, calm and weightless

#Image: Wide shot of The Protagonist standing alone in the busy hardware aisle, one small figure among shoppers.

#Narration: You stand there under the buzzing lights. A forklift beeps in the back. A man two feet away is checking prices on pipe fittings.

#Image: The Protagonist standing perfectly still in the bright aisle, people walking past him without a glance.

#Narration: Nobody is looking at you. Nobody knows. The store doesn't know. The number just sits there on a screen.

#Image: Close-up of The Protagonist's calm, plain face under the white store lights, feeling nothing dramatic.

#Narration: You thought it would feel different. You thought the world would shift a little. It doesn't.

#Image: A still wide shot of the quiet hardware aisle, fluorescent lights humming overhead.

#Narration: There is just the plumbing aisle, the beeping forklift, and a number on a screen.

#Image: The Protagonist typing a short reply on his phone, then reaching for the drain cleaner again.

#Narration: You reply with three words. "Thanks. Looks right." Then you pick the drain cleaner back up.

#Sound: soft phone keyboard taps

#Image: The Protagonist sitting quietly in the driver's seat of his old SUV in the store parking lot.

#Narration: In the car, you sit for a minute before you start it.

#Image: A quiet flashback shot of a younger version of The Protagonist on a couch, holding a notepad that says "$90."

#Narration: Eleven years ago, you made ninety dollars from a used machine and sat with that number on a Thursday night.

#Music: soft reflective piano, slow and warm, the final theme

#Image: Split image: "$90" on an old notepad on one side, "$480,000,000" on a phone screen on the other.

#Narration: This is the same feeling. Exactly the same. Just with more zeros behind it.

#Image: The Protagonist looking out the car window with a small, calm, knowing expression.

#Narration: And that means the feeling was never about the number. It was about the thing you built.

#Image: A peaceful montage: an ATM lit up, a car wash spraying, storage doors, a porta-potty on a job site — all running on their own.

#Narration: A quiet system, running the way you made it run. No drama. No clapping. No one watching.

#Image: The Protagonist starting his SUV, both hands on the wheel, ready to drive.

#Narration: You start the engine. The car wash drain isn't going to fix itself.

#Sound: a car engine starting, then driving away

#Image: The old SUV driving down a plain road, getting smaller in the distance under a wide sky.

#Narration: You drive home the same road. Same car. Same crack in the bumper you still haven't fixed.

#Image: A quiet suburban street at evening, ordinary and calm, the SUV pulling into a normal driveway.

#Narration: Nothing on the outside of your life has changed. And nothing will tomorrow either.

#Image: The Protagonist walking into his ordinary house at dusk, the door closing softly behind him.

#Narration: What's different is quieter than that. And it makes you wonder. What are you really building? And who is it for?`,
	},
	{
		id: "celebrity-death",
		length: "10-15m",
		name: "Celebrity Death",
		pillText: "Death of every",
		color: "#C7BFB2",
		style:
			"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		referenceImages: [
			templateAsset("celebrity-death-1"),
			templateAsset("celebrity-death-2"),
			templateAsset("celebrity-death-3"),
			templateAsset("celebrity-death-4"),
		],
		narration: {
			language: "en",
			gender: "masculine",
			age: "adult",
			accent: "american",
			description: "Steady, enunciating, confident young male for narrations",
		},
		showcase: {
			image: templateAsset("celebrity-death-2"),
			title: "Death of every...",
			description:
				"Historical explainer of death of every celebrity of a certain category",
			examplePrompt: "greatest footballer",
		},
		systemPrompt: dedent``,
		exampleText: dedent`#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Diego Maradona).

#Narration: Diego Maradona.

#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: Diego Maradona with a big scribbled mop of black curly hair, squinting grin, wearing a light blue and white striped shirt and black shorts. One arm is raised, holding a shaded gold trophy aloft. Bottom third: a bright green band packed with a doodled crowd of fans — white outlined heads, raised arms, and cheering hands surging upward around him, a few gray blobs among them reading as cameras. (Video prompt: crowd cheering).

#Narration: Diego Armando Maradona (1960) was widely regarded as one of the greatest footballers in history.

#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: a cartoon figure of Diego Maradona with a scribbled mop of black curly hair, closed eyes, small smile and red blush marks, wearing a light blue and white striped shirt and black shorts, both arms raised outward. Thin black stick legs. Flanking him: on the left, a flag of Forza Napoli; on the right, a waving Argentine flag, light blue and white bands with the golden sun face in the middle. Bottom third: a flat bright green band running the full width, standing in for the pitch. (Video prompt: Flags popping in one by one, Diego smiling).

#Narration: He was a symbol of Argentina and Napoli and the 1986 World Cup champion.

#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: a cartoon figure of Diego Maradona with a scribbled mop of black curly hair, now older-looking — heavy brows, tired downturned eyes, a gray beard and mustache. He wears a light blue and white striped shirt and black shorts, with thin black stick legs. In one hand he holds a large tilted green alcohol bottle; in the other, a small cluster of white pills. Bottom half: a flat muted green band running the full width.

#Narration: After retiring in 1997, his health suffered a serious decline due to alcohol and drug use.

#Animated Image: Whiteboard-style doodle of a hospital room, "Diego Maradona" hand-lettered at the top in marker font. Muted olive-green wall, white floor, a curtain and IV pole at the left edge, a pale window panel at the right. Left of center: a cartoon figure of Diego Maradona lying on a white bed, seen from above the head — big scribbled mop of black curly hair, eyes closed, in a dark gown. Center: a large pink cross-section diagram of a brain overlayed on the image, with a dark red dot marked on it indicating Hematoma. Right: a small cartoon doctor facing forward — green surgical cap, light blue face mask, white coat over blue scrubs, stethoscope around the neck, one arm raised toward the diagram. (Video prompt: the doctor appearing, then the brain diagram appearing) 

#Narration: In 2020, Maradona underwent surgery to remove a subdural hematoma.

#Animated Image: Whiteboard-style doodle of a hospital room, "Diego Maradona" hand-lettered at the top. Olive-green wall, white floor, curtain and IV pole at the left. Center: a cartoon figure of Diego Maradona sitting up on a bed — scribbled black curly hair, gray beard, tired droopy eyes with shadows beneath, gray gown, thin stick limbs. Two red-circled callout diagrams linked to him by red arrows: upper right, a pair of red lungs with blue fluid dripping; lower left, a red heart looking distressed and misshapen. At the right, a dark monitor screen showing an irregular green ECG line. (Video prompt: first the red lungs callout appearing, then the red heart, then the ECG monitor, Diego looking sad and unhealthy)

#Narration: In the days following the surgery, Maradona showed serious warning signs: labored breathing, fluid buildup in the lungs, and gradual heart failure.

#Animated Image: Whiteboard-style doodle on a white background with a gray floor band, "Diego Maradona" hand-lettered at the top. Left: two identical cartoon nurses standing side by side — white caps with red crosses, light blue face masks, blue scrubs, thin stick legs. Right: a cartoon doctor walking away with an angry scowling brow — green surgical cap, blue mask, white coat over blue scrubs, stethoscope, motion lines behind him. Behind him, a simple building with a red roof.

#Narration: However, the home medical team failed to recognize the severity. No doctor was consistently present at the house.

#Animated Image: Whiteboard-style doodle, "Diego Maradona" hand-lettered at the top. Muted, subdued palette. Left: a cartoon figure of Diego Maradona lying in bed, seen head-on from above — scribbled black curly hair, gray beard, eyes closed with shadows beneath, gray gown, a gray blanket pulled up over him against a white pillow. Right: a dark monitor screen showing a flat green line. Below it, a dull dark-red heart with a black X drawn across it. (Video prompt: dark monitor ECG screen getting progressively flatter, heart gradually failing, Diego passing away in the bed) 

#Narration: On November 25th, 2020, Maradona suffered cardiac arrest in his sleep at his home in Tigre.

#Animated Image: Whiteboard-style doodle of a hospital room, "Diego Maradona" hand-lettered at the top. Olive-green wall, pale blue window panels at the right. Left: a cartoon figure of Diego Maradona lying on a white bed, seen from above the head — big scribbled mop of black curly hair, eyes closed, in a dark gown. On the wall above, a dark monitor showing a green ECG line. Center: a cartoon nurse leaning over him — white cap with a red cross, blue mask, blue scrubs, worried brow — holding a dark rectangular device against his chest. Right: two more masked nurses in caps and blue scrubs standing side by side, watching with anxious expressions.

#Narration: Emergency services were immediately called and medical personnel performed resuscitation attempts on site.

#Animated Image: Whiteboard-style doodle of a hospital room, "Diego Maradona" hand-lettered at the top in marker font. Muted olive-green wall, white floor, curtain and IV pole at the left. Left: a cartoon figure of Diego Maradona lying on a white bed, a white sheet drawn up to his chest, scribbled black curly hair, gray beard, eyes closed. Right: a cartoon doctor standing beside the bed with his head bowed — green surgical cap, blue mask pulled down to his chin, white coat over blue scrubs, a clipboard lowered to his side. Above the bed, a small gray wall clock. Hand-lettered in the corner: "60 years old." (Video prompt: the doctor lowering his head, the clock hand ticking once)
#Narration: Despite the intervention, he was pronounced dead shortly after their arrival. He was 60 years old.
#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: a faded gray silhouette of Diego Maradona with his scribbled mop of curly hair, drawn in outline only. Around him, three red-circled callout diagrams linked by red arrows: upper left, a tilted green bottle and a scatter of white pills; upper right, a dull red heart with black cracks running through it; lower center, a clipboard with scribbled illegible lines and a red cross at the top. Bottom third: a flat muted green band. (Video prompt: the three callouts appearing one by one around the fading silhouette)
#Narration: His death was further aggravated by years of substance abuse, a weakened cardiovascular system, and complications from long-term chronic health conditions.
#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: a tall flagpole with the Argentine flag — light blue and white bands with the golden sun face — flying at half-mast, a black ribbon tied beneath it. Left: a simple pink government building with white columns and a small dome. Right: a doodled wall calendar with three days circled and crossed out in black marker. Bottom third: a flat gray band. (Video prompt: the flag lowering slowly to half-mast, the three calendar days crossing out one by one)
#Narration: After Maradona's passing, Argentina declared 3 days of national mourning.
#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: a tall white obelisk monument with a pointed tip. Surrounding it, an enormous doodled crowd filling the entire lower two-thirds — hundreds of white outlined heads, raised arms, light blue and white striped shirts, small Argentine flags and hand-drawn banners held overhead, one reading "D10S." Gray blobs among them reading as cameras and phones. (Video prompt: the crowd growing outward from the obelisk, flags waving)
#Narration: An estimated 1 million people gathered in Buenos Aires to pay tribute to the football legend.
#Animated Image: Whiteboard-style doodle on a white background, "Diego Maradona" hand-lettered at the top in marker font. Center: three doodled phone screens arranged in a row, each with a black ribbon in the corner. Left screen: a blue club crest with a white "N" on it. Center screen: a cartoon portrait of Pelé in a cream-and-green collar. Right screen: a cartoon portrait of Cristiano Ronaldo in a dark shirt. Below the phones, a row of small doodled hearts and folded hands. Bottom third: a flat gray band. (Video prompt: the three phone screens popping in one by one, hearts floating upward)
#Narration: Clubs and players around the world including SSC Napoli, Pelé and Cristiano Ronaldo expressed their condolences and honored his legacy.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Diogo Jota).
#Narration: Diogo Jota.
#Animated Image: Whiteboard-style doodle on a white background, "Diogo Jota" hand-lettered at the top in marker font. Center: a cartoon figure of Diogo Jota with short scribbled dark hair, a small smile, wearing a bright red shirt and red shorts, thin black stick legs, one foot resting on a doodled football. Left: a simple riverside skyline with a tall bridge arch and terracotta rooftops, hand-lettered "Porto, 1996." Right: a small green and red Portuguese flag. Bottom third: a flat bright green band. (Video prompt: Jota tapping the ball, the flag waving)
#Narration: Diogo Jota was born on December 4th, 1996 in Porto, Portugal, a dynamic forward for Liverpool FC and the Portuguese national team.
#Animated Image: Whiteboard-style doodle on a white background, "Diogo Jota" hand-lettered at the top in marker font. Center: a cartoon figure of Diogo Jota mid-stride in a red shirt, arms out, mouth open in a shout. Behind him, a doodled scoreboard with "100+ GAMES" scrawled across it in marker. Left: a red club crest with a small bird outline. Right: a green and red Portuguese crest. Bottom third: a flat bright green band with a white penalty-box line. (Video prompt: the scoreboard number climbing, Jota celebrating)
#Narration: By 2022, he had played over a 100 games for Liverpool and his national team.
#Animated Image: Whiteboard-style doodle on a white background, "Diogo Jota" hand-lettered at the top in marker font. Center: a sleek doodled green sports car in side profile, low and wedge-shaped, with two small cartoon figures visible inside — Diogo Jota with short dark hair at the wheel, his brother André Silva beside him. A long gray road stretches from left to right beneath them with dashed white center lines. Left edge: a small hand-lettered signpost reading "Spain." Right edge: a signpost reading "Santander." (Video prompt: the car pulling away, road lines scrolling)
#Narration: On July 3rd, 2025, Jota and his younger brother André Silva set out from central Spain in a Lamborghini Huracán heading towards Santander, en route to Liverpool.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Diogo Jota" hand-lettered at the top in marker font. Center: the green sports car small in the distance on a long gray road curving toward the horizon, two yellow headlight cones cutting into the dark. Above, a scatter of small white stars and a thin crescent moon. Left: a doodled duffel bag and a pair of football boots tied by their laces, drawn as a small inset. (Video prompt: the car driving into the distance, headlights flickering)
#Narration: It was meant to be a quiet journey before preseason training, but it ended in disaster.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Diogo Jota" hand-lettered at the top in marker font. Center: a two-lane gray highway seen from above, dashed white lines down the middle. The green sports car is drawn pulling out into the left lane alongside a boxy gray van, a curved white arrow showing the overtaking path. Upper left: a small doodled clock face reading 3:00 with "3:00 AM" hand-lettered beside it. Upper right: a green road sign reading "A52." Lower right: a small green Civil Guard badge doodle. (Video prompt: the car swinging out to overtake the van)
#Narration: According to the Spanish Civil Guard, at around 3:00 a.m., Jota's brothers were driving along the A52 highway near Cernadilla while overtaking another vehicle.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Diogo Jota" hand-lettered at the top in marker font. Center: the green sports car drawn tilted and off-kilter, one front tire scribbled as a burst black shape with jagged fragments flying out and a red-circled callout pointing to it. Curved black motion arrows loop around the car showing it rolling. Right: orange and yellow scribbled flames rising. Bottom right: a small white roadside marker post hand-lettered "KM 64." (Video prompt: the tire bursting, the car veering and rolling, flames rising)
#Narration: The Lamborghini Huracán reportedly suffered a tire blowout, veered off the road, and flipped multiple times, and burst into flames near kilometer point 64.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Diogo Jota" hand-lettered at the top in marker font. Center: a twisted, blackened car shape barely recognizable, drawn as an angular scribble with orange and yellow flames wrapping around it and gray smoke curling upward. Left: a doodled red fire engine with a flashing blue light on top. Right: two cartoon firefighters in yellow helmets and reflective-striped coats, one holding a hose. (Video prompt: the fire engine arriving, blue lights flashing, smoke curling)
#Narration: When emergency services arrived, the car was already engulfed in fire, its frame twisted beyond recognition.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Diogo Jota" hand-lettered at the top in marker font. Muted, subdued palette. Center: the blackened twisted car shape, flames now gone, thin gray smoke rising from it. Left: two cartoon firefighters in yellow helmets standing still with heads lowered, hose slack at their feet. Right: a white sheet doodled over a shape on the ground, drawn plainly and without detail. Above, two small white doodled birds. (Video prompt: the last flames going out, smoke thinning, the firefighters lowering their heads)
#Narration: Firefighters extinguished the blaze, but it was too late. They found the remains of the two brothers inside the wreck, burned beyond recognition.
#Animated Image: Whiteboard-style doodle on a white background, "Diogo Jota" hand-lettered at the top in marker font. Center: a gray road surface seen from above with two long black scribbled skid marks curving off toward the shoulder, a doodled measuring tape stretched alongside them hand-lettered "30 m." Right: a cartoon investigator in a dark jacket crouching down, clipboard in hand, magnifying glass raised. Left: a small red-circled callout of a steering wheel with hands gripping it tightly. (Video prompt: the skid marks drawing themselves across the road, the measuring tape extending)
#Narration: Investigators later found skid marks over 30 m long, suggesting that the driver had tried desperately to regain control in the final seconds.
#Animated Image: Whiteboard-style doodle on a white background, "Diogo Jota" hand-lettered at the top in marker font. Center: a doodled stadium wall with a mural of Diogo Jota in a red shirt, scarves and bunches of flowers piled at its base. Left: a crowd of doodled fans in red, heads bowed, some holding red scarves stretched overhead. Right: a cartoon figure of Cristiano Ronaldo in a dark shirt, head lowered, one hand over his heart, a black armband on his sleeve. Bottom third: a flat gray band. (Video prompt: scarves and flowers piling up at the mural, fans bowing their heads)
#Narration: The news devastated fans, teammates, and the entire football community, including Portugal's captain, Cristiano Ronaldo, who paid an emotional tribute to his fallen teammate.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Pelé).
#Narration: Pelé.
#Animated Image: Whiteboard-style doodle on a white background, "Pelé" hand-lettered at the top in marker font. Center: a cartoon figure of Pelé with short scribbled black hair, a wide grin, wearing a cream shirt with a green collar and number 10, blue shorts, thin black stick legs. One arm is raised high with a clenched fist, one knee lifted mid-jump. Bottom third: a bright green band packed with a doodled crowd of fans — white outlined heads, raised arms, small yellow and green flags. Hand-lettered beside him: "1940." (Video prompt: Pelé leaping with his fist raised, crowd cheering)
#Narration: Edson Arantes do Nascimento, known as Pelé, 1940, was regarded as the greatest footballer of all time.
#Animated Image: Whiteboard-style doodle on a white background, "Pelé" hand-lettered at the top in marker font. Center: a cartoon figure of Pelé in a cream shirt with green collar, both arms outstretched. Above him, three shaded gold trophies floating in a row, each with a small hand-lettered year beneath: "1958," "1962," "1970." Right: a large doodled football with "1,200+ GOALS" scrawled across it in marker. Bottom third: a flat bright green band. (Video prompt: the three trophies popping in one by one, the goal counter climbing)
#Narration: He won three FIFA World Cups, 1958, 1962, 1970, and scored over 1,200 career goals.
#Animated Image: Whiteboard-style doodle on a white background, "Pelé" hand-lettered at the top in marker font. Center: a cartoon figure of Pelé mid-bicycle-kick, upside down in the air, cream shirt and blue shorts, one leg swung high at a doodled football. Curved white motion arcs trace the path of the kick. Around him, three small red-circled callouts hand-lettered "Technique," "Vision," "Finishing," each linked by a red arrow. Bottom third: a flat bright green band. (Video prompt: the bicycle kick playing out, the three callouts appearing)
#Narration: His exceptional technique, vision, and scoring ability made him a defining figure in football history.
#Animated Image: Whiteboard-style doodle of a clinic room, "Pelé" hand-lettered at the top in marker font. Muted olive-green wall, white floor. Left: a cartoon figure of an older Pelé sitting on an examination bed — short gray scribbled hair, gray mustache, tired eyes, a pale hospital gown, thin stick limbs. Center: a large pink cross-section diagram of a colon overlayed on the image, with a dark red mass marked on it hand-lettered "Tumor." Right: a cartoon doctor in a white coat over blue scrubs, stethoscope around the neck, one arm raised toward the diagram, a clipboard in the other hand. (Video prompt: the doctor appearing, then the colon diagram appearing with the red mass)
#Narration: In 2021, Pelé was diagnosed with colon cancer.
#Animated Image: Whiteboard-style doodle of a hospital room, "Pelé" hand-lettered at the top in marker font. Olive-green wall, white floor, IV pole at the left with a clear drip bag. Center: a cartoon figure of Pelé seated in a blue reclining chair, gray hair thinning, a blanket over his lap, a tube running from the drip bag to his arm. Above, a red-circled callout of a surgical tray with a scalpel and forceps, linked by a red arrow. Right: a doodled row of four chemotherapy bags hanging in a line, each with a small check mark beside it. (Video prompt: the drip bag emptying, the check marks appearing one by one)
#Narration: He underwent surgery to remove the tumor, followed by multiple rounds of chemotherapy.
#Animated Image: Whiteboard-style doodle on a white background, "Pelé" hand-lettered at the top in marker font. Center: a large pink outline diagram of a human torso, drawn front-on, with three dark red spreading blotches marked on it — one at the intestines, one at the lungs, one at the liver — each ringed in red and linked by a red arrow to a small hand-lettered label. Left: a doodled scan viewer panel with a pale film clipped to it. Right: a cartoon doctor in a white coat, brow furrowed, pointing at the diagram. Hand-lettered in the corner: "Early 2022." (Video prompt: the three red blotches appearing and spreading one by one)
#Narration: Despite initial treatment, early 2022, scans revealed it metastasized in his intestines, lungs, and liver.
#Animated Image: Whiteboard-style doodle of a hospital exterior and room, "Pelé" hand-lettered at the top in marker font. Left: a tall white hospital building with rows of blue windows and a red cross above the door, hand-lettered "São Paulo." Right: a cartoon figure of Pelé lying propped up in a white bed — gray hair, gray mustache, tired eyes, a clear oxygen tube at his nose, gray gown. Above him, a red-circled callout of a pair of pink lungs with small blue virus dots around them. A cartoon nurse in a blue mask and blue scrubs stands at the bedside with a clipboard. (Video prompt: the hospital building appearing, then the lungs callout with the virus dots)
#Narration: Later that year on November 29th, Pelé was admitted to Albert Einstein Israelite Hospital in São Paulo for a respiratory infection caused by COVID-19 and for reassessment of his cancer treatment.
#Animated Image: Whiteboard-style doodle of a hospital room, "Pelé" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Pelé lying in a white bed, gray hair, eyes half-closed, gray gown, a blanket drawn to his chest. Left: a doodled chemotherapy bag hanging from an IV pole with a large black X drawn across it. Right: a cartoon doctor in a white coat and a nurse in blue scrubs standing together, heads slightly bowed, one holding a clipboard hand-lettered "Palliative care." Hand-lettered in the corner: "December 3rd, 2022." (Video prompt: the black X drawing itself across the chemo bag, the clipboard appearing)
#Narration: On December 3rd, 2022, medical reports indicate that Pelé had become unresponsive to chemotherapy and his care was shifted to palliative measures.
#Animated Image: Whiteboard-style doodle of a hospital room, "Pelé" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Pelé lying in a white bed, gray hair, eyes closed, shadows beneath them, oxygen tube at his nose. Two red-circled callout diagrams linked to him by red arrows: upper left, a pair of red kidneys drawn drooping and dull; upper right, a red heart looking distressed and misshapen. Above, a dark monitor screen showing an irregular green ECG line. Hand-lettered in the corner: "December 21st." (Video prompt: the kidneys callout appearing, then the heart, the ECG line wavering)
#Narration: By December 21st, his tumor had advanced further with additional complications including renal and cardiac dysfunction.
#Animated Image: Whiteboard-style doodle of a hospital room, "Pelé" hand-lettered at the top in marker font. Muted palette. Left: a cartoon figure of Pelé lying in a white bed with a dark monitor above him showing a green ECG line, a nurse in blue scrubs and mask standing watch beside him. Right: a doodled window looking out onto a small house with a decorated Christmas tree glowing inside it, drawn faintly in gray and green. A black X is drawn across the window pane. (Video prompt: the Christmas tree appearing in the window, then the X drawing across it)
#Narration: Medical staff determined that he required intensive monitoring and was not allowed to spend Christmas at home.
#Animated Image: Whiteboard-style doodle of a hospital room, "Pelé" hand-lettered at the top in marker font. Muted, subdued palette. Left: a cartoon figure of Pelé lying in a white bed, gray hair, eyes closed, a gray blanket pulled up over him against a white pillow, his expression peaceful. Right: a dark monitor screen showing a flat green line. Below it, a small doodled clock face with its hands reading 3:27, hand-lettered "3:27 p.m." In the corner, hand-lettered: "1940 – 2022. 82 years old." (Video prompt: the ECG line getting progressively flatter, then going flat, the clock hands settling)
#Narration: On December 29th, 2022 at 3:27 p.m., Pelé passed away at the age of 82.
#Animated Image: Whiteboard-style doodle on a white background, "Pelé" hand-lettered at the top in marker font. Center: a faded gray outline silhouette of Pelé in his number 10 shirt. Around him, three red-circled callout diagrams linked by red arrows: upper left, a pair of dull red kidneys with a black X; upper right, a dull red heart with a black X; lower center, a pair of pink lungs shaded dark and heavy. Below, a red-circled diagram of a colon with a dark red mass, hand-lettered "Adenocarcinoma." Bottom third: a flat gray band. (Video prompt: the callouts appearing one by one around the fading silhouette)
#Narration: The causes of death were multiple organ failure, including kidney failure, heart failure, and bronchopneumonia, all related to advanced colon adenocarcinoma.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of José Antonio Reyes).
#Narration: José Antonio Reyes.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: a cartoon figure of José Antonio Reyes with short scribbled dark hair, a small confident smile, wearing a red shirt and white shorts, thin black stick legs, a doodled football at his feet. Right: a small red and yellow Spanish flag. Hand-lettered beside him: "1983." Bottom third: a flat bright green band with a white touchline. (Video prompt: Reyes flicking the ball up, the flag waving)
#Narration: José Antonio Reyes, born 1983, was a prominent Spanish footballer of the early 2000s.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: a cartoon figure of Reyes in a red shirt, both arms raised. Above him, three shaded silver and gold trophies floating in a row, hand-lettered beneath: "Champions League," "La Liga," "Europa League." Below, three doodled club crests in a row — a red and white striped crest, a red crest with a cannon, and a white crest with a crown. Bottom third: a flat bright green band. (Video prompt: trophies popping in one by one, then the three crests)
#Narration: Through his career, he won multiple domestic and European titles, including the UEFA Champions League, La Liga, and Europa League with Sevilla, Arsenal, and Real Madrid.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: a doodled dark sedan in side profile on a gray road with dashed white center lines, three small cartoon figures visible inside — Reyes at the wheel with short dark hair, and two relatives beside and behind him. Left edge: a hand-lettered signpost reading "Utrera." Right edge: a signpost reading "Sevilla." Above, a pale sun and a few scribbled clouds. Bottom: dry scrubby doodled bushes along the roadside. (Video prompt: the car driving from left to right, road lines scrolling)
#Narration: On June 1st, 2019, Reyes was traveling by car between Utrera and Seville, Spain, accompanied by his relatives Jonathan Reyes and Juan Manuel Calderón.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: the doodled dark sedan drawn with long white speed lines streaking behind it. Two red-circled callouts linked by red arrows: upper left, a speedometer with its red needle buried at the far end, hand-lettered "81 mph"; lower right, a steering wheel with a jagged red crack through the column and a tire below it drawn wobbling with warning marks. (Video prompt: the speedometer needle climbing, then the red cracks appearing on the steering column and tire)
#Narration: The vehicle reported reaching speeds of 81 mph and had a steering and tire malfunction before the accident.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: a gray road seen from a low angle, the doodled dark sedan swerving off the lane, a curved black motion arrow tracing its path toward the shoulder. Right: a gray metal roadside barrier with the car striking it, the front end crumpled inward in jagged scribbles, small black fragments flying outward. Sharp white impact lines radiate from the point of contact. (Video prompt: the car swerving off the lane and striking the barrier, impact lines flashing)
#Narration: While navigating the road, the vehicle veered off its lane and collided with the roadside barrier. The impact caused deformation of the cabin.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: the crumpled dark sedan against the bent gray barrier, now wrapped in orange and yellow scribbled flames climbing over the roof and bonnet, thick gray smoke curling upward and filling the top of the frame. Small orange sparks scatter around the base. Bottom: a scorched black patch spreading across the roadside gravel. (Video prompt: flames erupting from the car and spreading rapidly, smoke rising)
#Narration: Immediately following the collision, the car ignited, producing an intense fire that engulfed the vehicle within seconds.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Muted palette. Center: the blackened wreck against the barrier, flames out, thin gray smoke rising. Left: a doodled red fire engine and a white ambulance with blue flashing lights, two cartoon paramedics in green uniforms standing with heads lowered. Right: a cartoon figure on a stretcher with a red blanket over him, one arm bandaged, a paramedic wheeling him toward the ambulance. (Video prompt: blue lights flashing, the stretcher being wheeled toward the ambulance)
#Narration: Emergency responders arrived at the scene but found Reyes and Jonathan Reyes already deceased. Juan Manuel Calderón survived but suffered burns and fractures, hospitalized for treatment.
#Animated Image: Whiteboard-style doodle on a white background, "José Antonio Reyes" hand-lettered at the top in marker font. Center: a faded gray outline silhouette of José Antonio Reyes in his red shirt. Two red-circled callout diagrams linked by red arrows: upper left, a side-view head diagram with a dark red impact mark at the skull, hand-lettered "Head trauma"; lower right, an outline torso shaded with orange and black scorch marks, hand-lettered "Burns." Right: a cartoon investigator in a dark jacket holding a clipboard, head lowered. Bottom third: a flat gray band. (Video prompt: the two callouts appearing one after the other beside the fading silhouette)
#Narration: Autopsy and crash reports indicated that José Antonio Reyes sustained severe head trauma and extensive burns which were fatal following the high-speed collision and subsequent fire.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Emiliano Sala).
#Narration: Emiliano Sala.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a cartoon figure of Emiliano Sala with short scribbled dark hair, a broad smile, wearing a yellow shirt and green shorts, thin black stick legs, one arm raised. Behind him, a doodled staircase of three rising steps drawn with a white arrow climbing upward. Left: a small light blue and white Argentine flag. Right: a small blue, white and red French flag. Bottom third: a flat bright green band. (Video prompt: Sala climbing the rising steps, the two flags popping in)
#Narration: Emiliano Sala, 28, was considered a footballer prodigy, having risen rapidly through the ranks in Argentina and France.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a cartoon figure of Sala holding up a blue shirt with both hands, a small smile, standing beside a doodled blue club crest with a bird on it. Right: a large hand-lettered price tag on a string reading "£15M" with a red circle around it. Left: a cartoon club official in a dark suit shaking Sala's hand. Bottom third: a flat gray band. (Video prompt: the shirt being held up, the price tag swinging in)
#Narration: He was signed by Cardiff City for a club record transfer fee of approximately 15 million.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Left: a cartoon doctor in a white coat holding a stethoscope to Sala's chest, a clipboard with a check mark beside them. Center: a cartoon figure of Sala with a duffel bag over his shoulder, walking right. Right: a doodled map outline with a dashed white flight path arcing from a point hand-lettered "Nantes" to a point hand-lettered "Cardiff," a small plane icon on the line. Beneath, a small calendar with "January 21st" circled. (Video prompt: the check mark appearing, then the dashed flight path drawing itself across the map)
#Narration: On January 19th, 2019, after completing a medical examination with Cardiff City, Sala returned to Nantes, France, intending to fly back to Cardiff on January 21st to join his new club's training sessions.
#Animated Image: Whiteboard-style doodle on a dark navy background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a small doodled single-engine light aircraft in side profile, flying right, tiny cartoon figures visible through the windows. Below it, a wide band of dark choppy scribbled sea with white wave crests. Right: a small doodled island outline hand-lettered "Alderney." Above, thick gray clouds and a scatter of white stars. A dashed white flight path trails behind the plane and breaks off abruptly with a red question mark at its end. (Video prompt: the plane flying into the clouds, the dashed path breaking off, the red question mark appearing)
#Narration: On January 21st, 2019, Sala boarded a flight from Nantes to Cardiff. During that flight, the aircraft disappeared over the English Channel near Alderney.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a doodled map of open sea drawn in pale blue with a large hand-drawn search grid of dashed squares laid over it, hand-lettered "4,400 km²." Small doodled boats and a helicopter with a searchlight cone are drawn moving across the grid. Left: a small green and white police badge doodle. Upper right: a calendar with three days circled. (Video prompt: the search grid drawing itself square by square, the helicopter sweeping across)
#Narration: Immediate search efforts were launched by the Guernsey police, covering approximately 4,400 km squared over 3 days, but no survivors were found.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a wide band of blue sea drawn in cross-section, showing the surface and the water below. On the surface: a doodled small plane, a helicopter with spinning rotor lines, and two boats. Beneath the surface: a yellow remotely operated underwater vehicle with a bright searchlight cone, trailing a thin black tether up to one of the boats. Red-circled labels point to each vehicle. (Video prompt: the aircraft, helicopter, boats and ROV appearing one by one, the ROV descending)
#Narration: Following this, private searches continued, employing multiple aircraft, helicopters, boats, and remotely operated underwater vehicles, ROVs.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a curved sandy coastline drawn along the bottom with blue scribbled waves lapping at it. Scattered along the sand: doodled fragments of debris — two pale rectangular seat cushions ringed in red, a torn strip of white panel, and small dark pieces. Right: two cartoon figures in dark jackets crouching over the debris, one holding a clear evidence bag. Hand-lettered in the corner: "January 30th." (Video prompt: the waves washing in, the debris appearing on the sand one piece at a time)
#Narration: On January 30th, debris from the aircraft, including seat cushions, were located along the French coast.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a cross-section of dark blue water. A doodled search vessel sits on the surface with a sonar unit lowered beneath it, emitting curved white sonar arcs that fan outward and downward through the water. On the seabed at the bottom, a faint gray shape is just visible within the arcs. Left: a doodled sonar screen panel with a green sweeping radar line. Hand-lettered in the corner: "February 3rd." (Video prompt: the sonar arcs pulsing outward, the green radar line sweeping)
#Narration: A dedicated underwater search commenced on February 3rd using sonar equipment.
#Animated Image: Whiteboard-style doodle on a dark blue background, "Emiliano Sala" hand-lettered at the top in marker font. Center: the broken shape of a small aircraft resting on a gray seabed, partly settled into the sediment, lit by the searchlight cone of a small yellow ROV hovering above it. A red circle rings the wreckage. Left: a vertical depth scale drawn as a dashed line with markings, hand-lettered at the bottom "63 m / 205 ft." Right: a small hand-lettered label reading "Hurd's Deep." Above, a doodled clock face reading 21:00. (Video prompt: the ROV descending, its searchlight sweeping across the wreckage, the red circle appearing)
#Narration: At 2100 hours, the wreckage of the aircraft was located at a depth of 63 m or 205 ft in the northern Hurd's Deep.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Muted palette. Left: a doodled recovery vessel on gray water with a crane arm extended over the side, a cable running down into the sea. Center: a stretcher covered with a plain white sheet being lifted onto the deck, drawn simply and without detail, two cartoon crew members in orange jackets standing either side with heads lowered. Right: a small harbor doodle with a dock and a building hand-lettered "Portland." Hand-lettered in the corner: "February 7th." (Video prompt: the crane cable lifting slowly, the crew lowering their heads)
#Narration: On February 7th, the body was recovered from the aircraft wreckage and transported to Portland for investigation.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Center: a large red-circled diagram of a fingerprint with its looping ridges drawn in black marker, a doodled magnifying glass held over it. On either side, two small identical fingerprint cards linked to the center by red arrows, a green check mark between them. Right: a cartoon police officer in a dark uniform holding a clipboard. Left: a small badge doodle hand-lettered "Dorset Police." (Video prompt: the magnifying glass sliding over the fingerprint, the two cards matching, the green check mark appearing)
#Narration: The Dorset police later confirmed through fingerprint analysis that the body was Emiliano Sala.
#Animated Image: Whiteboard-style doodle on a white background, "Emiliano Sala" hand-lettered at the top in marker font. Muted palette. Center: a faded gray outline silhouette of Emiliano Sala in his yellow shirt. Two red-circled callout diagrams linked by red arrows: upper left, a side-view head diagram with dark red impact marks, hand-lettered "Head trauma"; lower right, an outline torso with dark red impact marks across the chest, hand-lettered "Torso trauma." Left: a doodled report page with a red stamp on it and "February 11th" hand-lettered beneath. Bottom third: a flat gray band. (Video prompt: the report page appearing, then the two callouts one after the other)
#Narration: The post-mortem examination released on February 11th determined that Sala had died from trauma to the head and torso sustained in the crash.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Gary Speed).
#Narration: Gary Speed.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Center: a cartoon figure of Gary Speed with short scribbled dark hair, a calm smile, wearing a white shirt with a captain's armband on his sleeve, dark shorts, thin black stick legs. Above him, a hand-lettered banner reading "500+ Premier League matches." Around him, four small doodled club crests in a row — a white crest, a blue crest, a black-and-white striped crest, and a red Welsh dragon. Hand-lettered beside him: "1969." Bottom third: a flat bright green band. (Video prompt: the crests popping in one by one, Speed smiling)
#Narration: Gary Speed, born in 1969, was a legendary Welsh midfielder who played over 500 Premier League matches and captained Leeds United, Everton, Newcastle United, and the Wales national team.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Center: a cartoon figure of Gary Speed standing on the touchline in a dark suit and tie, short scribbled hair, arms folded, a small serious smile. Beside him, a doodled tactics whiteboard on a stand with scribbled arrows and circles. Behind him, a row of empty dugout seats. Left: a red Welsh dragon flag on a small pole. Bottom third: a flat bright green band with a white touchline. (Video prompt: the tactics board arrows drawing themselves, the flag waving)
#Narration: After retiring from professional football, he became the head coach of the Wales national team.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Left: a cartoon figure of Gary Speed in a dark suit sitting on a studio sofa under a doodled TV camera on a tripod, a small studio light above, hand-lettered "BBC One" on a panel behind him. Right: a doodled dark car driving along a road toward a small house with a pitched roof and a closed garage door, hand-lettered "Huntington, Cheshire." Above, a low orange evening sun and a small clock face reading 5:00. (Video prompt: the camera light blinking on, then the car driving toward the house as the sun sets)
#Narration: On November 26th, 2011, Speed appeared as a guest on the BBC's One's Football Focus. Later that day, at around 5:00 p.m., he drove home to his residence in Huntington, Cheshire, England.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Muted, subdued palette. Center: the exterior of the house at dawn, gray sky, a closed gray garage door drawn large in the middle of the frame, its handle just turning. In front of it, a cartoon figure of Louise seen from behind — long scribbled hair, a dressing gown, one hand on the door, her shoulders drawn tense. Upper right: a small clock face reading just before 7:00. No interior is visible. (Video prompt: the garage door beginning to lift, the frame holding on Louise from behind)
#Narration: The following morning, just before 7 a.m. on November 27th, 2011, Speed's wife, Louise, opened the door to the garage and she found her husband hanging.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Muted, subdued palette. Center: a cartoon figure of Louise from the side, kneeling on a gray driveway, a phone pressed to her ear, her hair scribbled loose, her free hand raised to her mouth, small blue teardrop marks at her cheeks and shaky motion lines around her shoulders. Beside the phone, a small red-circled emergency call icon. Behind her, the gray house and the open garage drawn as a plain dark rectangle with no detail inside. (Video prompt: Louise trembling as she holds the phone, the emergency icon pulsing)
#Narration: Shocked and trembling, she called emergency services immediately.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Muted, subdued palette. Center: a cartoon figure of Louise kneeling on a gray floor, phone set down beside her on speaker with small sound arcs coming from it, both hands reaching toward a plain gray sheet-covered shape on the ground beside her, drawn without any detail. Her expression is drawn desperate, brow raised, teardrop marks at her cheeks. Right: a doodled clock face with its second hand mid-sweep. (Video prompt: the sound arcs pulsing from the phone, the clock second hand sweeping, Louise reaching forward)
#Narration: Following the guidance of the rescue operator, she cut Gary down, letting his body fall to the floor as she desperately tried to help him while waiting for paramedics.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Muted palette. Left: a doodled white ambulance with blue flashing lights parked on the driveway, back doors open. Center: two cartoon paramedics in green uniforms kneeling on a gray floor over a plain gray sheet-covered shape drawn without detail, one with hands positioned for compressions, the other holding a bag valve mask. Right: two red-circled callouts — a doodled stopwatch hand-lettered "8 minutes," and a thermometer with a blue bulb hand-lettered "Pale and cold." Above, a small clock hand-lettered "20 minutes." (Video prompt: the ambulance arriving with blue lights, the stopwatch ticking, the two callouts appearing)
#Narration: An ambulance crew arrived within 8 minutes. One paramedic later told the inquest that Speed was pale and cold when they reached him, but the team still attempted resuscitation for 20 minutes.
#Animated Image: Whiteboard-style doodle on a white background, "Gary Speed" hand-lettered at the top in marker font. Muted palette. Left: two cartoon paramedics in green uniforms standing with their heads lowered and hands at their sides, a folded gray sheet beside them. Right: a doodled courtroom bench with a cartoon coroner in a dark robe seated behind it, a gavel and a stack of papers in front of them, hand-lettered "Inquest — January 30th, 2012." Between them, two red-circled callouts linked by red arrows: a scribbled tangle of dark lines hand-lettered "Pressure," and two small figures turned away from each other. (Video prompt: the paramedics lowering their heads, then the courtroom bench appearing, then the two callouts)
#Narration: Despite their efforts, there was no response. On January 30th, 2012, an inquest heard that the pressure of the management had put some strain on his marriage and that he and Louise had argued the night before his death.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Suleiman al-Obeid).
#Narration: Suleiman al-Obeid.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Center: a cartoon figure of Suleiman al-Obeid with short scribbled dark hair and a trimmed beard, a warm smile, wearing a blue shirt with a white number 10, white shorts, thin black stick legs, a doodled football at his feet. Right: a doodled scoreboard scrawled with "100+ GOALS." Left: a small black, white, green and red Palestinian flag. Hand-lettered beside him: "1984." Bottom third: a flat bright green band. (Video prompt: the goal counter climbing, the flag waving)
#Narration: Suleiman al-Obeid was born in 1984 and was a great footballer in Gaza. Over his career, he scored more than 100 goals at the club level and on the national team.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Center: a cartoon figure of al-Obeid in his blue number 10 shirt, arms out, surrounded by a small doodled crowd of children and fans with raised arms and beaming faces, several holding small Palestinian flags. Above him, a hand-lettered banner reading "The Palestinian Pelé" with a red circle around it. Bottom third: a flat bright green band. (Video prompt: the crowd of fans gathering around him, the banner unfurling)
#Narration: To Palestinian fans, he wasn't just a footballer. He was the Palestinian Pelé.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted, dusty gray palette. Center: a doodled row of damaged buildings drawn as broken outlines with missing walls and jagged roof edges, gray rubble piled at their bases. Left: a doodled water pipe with a black X drawn across it and a snapped power line hanging loose. Right: an empty market stall with bare shelves, a red X over a crate. Above, a pale gray sky with drifting dust marks. (Video prompt: dust drifting across the frame, the red X marks appearing one by one)
#Narration: Due to the ongoing war which had devastated infrastructure and cut off regular supplies.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted, dusty palette. Center: a long winding line of doodled civilians drawn as simple outlined figures with empty containers and bags, stretching from the foreground back toward the horizon. Near the front of the line, a cartoon figure of al-Obeid with a trimmed beard, standing patiently. Right: a doodled aid pallet stacked with white sacks under a tarp, a red cross on a small crate. Hand-lettered in the corner: "August 6th, 2025 — southern Gaza." (Video prompt: the line of people extending back toward the horizon, dust drifting)
#Narration: On August 6th, 2025, al-Obeid stood in a long line of civilians in southern Gaza waiting for a rare delivery of humanitarian aid.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted, dusty palette. Center: the aid distribution point drawn from a distance — the pallet and tarp on one side, the line of outlined civilians scattering outward. Sharp white burst lines and a hand-lettered "CRACK" in jagged marker font cut across the upper frame. Figures are drawn mid-motion: some dropping flat to the ground with arms over their heads, others running left and right, small dust puffs at their feet. No weapons or shooters are shown. (Video prompt: the burst lines flashing across the frame, the crowd scattering and dropping)
#Narration: A loud crack echoed across the aid distribution point followed by a burst of gunfire. People dropped to the ground or ran for cover.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted, subdued palette. Center: a cartoon figure of al-Obeid drawn in three faint overlapping stages showing the motion — first upright with a small red mark at his chest ringed in red, then staggering with one hand reaching out, then lowered to the ground. Two outlined figures crouch beside the last stage, hands under his arms, pulling him toward a doodled aid pallet at the right that serves as cover. Dust drifts across the frame. (Video prompt: the three stages fading in one after the other, the two figures pulling him behind the pallet)
#Narration: A moment later, al-Obeid was struck by a bullet to the chest. He staggered, tried to stay upright, then collapsed as others pulled him behind an aid pallet.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted, subdued palette. Left: a doodled white ambulance stopped at a distance behind a mound of gray rubble and a broken road, a red X drawn across the path in front of it, its blue light drawn dim. Right: the aid pallet with a small group of outlined figures kneeling around a still figure on the ground, heads lowered. Between them, a doodled clock face with its hands drawn moving, hand-lettered "Minutes." (Video prompt: the ambulance stalled behind the rubble, the red X appearing, the clock hands turning)
#Narration: With ambulances unable to reach the site immediately, al-Obeid succumbed within minutes.
#Animated Image: Whiteboard-style doodle on a white background, "Suleiman al-Obeid" hand-lettered at the top in marker font. Muted palette with a faint warm glow. Center: a faded gray outline of al-Obeid drawn standing with both arms spread wide, as if shielding, with several smaller outlined figures gathered behind him in his shadow. A red-circled callout points to his outstretched arms. Around him, a few outlined bystanders drawn looking on with hands over their hearts. Bottom third: a flat gray band. (Video prompt: the small figures gathering behind his outstretched arms, the outline slowly fading)
#Narration: People who recognized him later said he was trying to shield others in the crowd moments before he collapsed.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. (Video prompt: zoom into portrait of Peter Biaksangzuala).
#Narration: Peter Biaksangzuala.
#Animated Image: Whiteboard-style doodle on a white background, "Peter Biaksangzuala" hand-lettered at the top in marker font. Center: a cartoon figure of Peter Biaksangzuala with short scribbled black hair, a bright grin, wearing a blue and yellow shirt and blue shorts, thin black stick legs, a doodled football under one foot. Right: a doodled map outline of northeast India with a small region shaded and hand-lettered "Mizoram," a small orange, white and green Indian flag beside it. Left: a doodled club crest with "Bethlehem Vengthlang FC" hand-lettered beneath. Hand-lettered beside him: "23 years old." Bottom third: a flat bright green band. (Video prompt: the map and crest popping in, Peter grinning and tapping the ball)
#Narration: Peter Biaksangzuala was a 23-year-old midfielder from Mizoram, India. Regarded as one of the region's most promising young players, he played for Bethlehem Vengthlang FC in the Mizoram Premier League.
#Animated Image: Whiteboard-style doodle on a white background, "Peter Biaksangzuala" hand-lettered at the top in marker font. Center: a cartoon figure of Peter in a blue and yellow shirt, mouth open in a shout, both arms thrown up, a doodled football sitting in the back of a white goal net behind him with white motion lines showing its path. Right: a doodled scoreboard with the scores drawn level and hand-lettered "1 – 1." Hand-lettered in the corner: "October 14th, 2014." Bottom third: a flat bright green band with a white goal line. (Video prompt: the ball hitting the net, the scoreboard flipping level, Peter celebrating)
#Narration: On October 14th, 2014, during a league match against Chanmari West FC, he scored an equalizing goal.
#Animated Image: Whiteboard-style doodle on a white background, "Peter Biaksangzuala" hand-lettered at the top in marker font. Center: a cartoon figure of Peter sprinting right toward a doodled corner flag, arms pumping, a big grin, small motion lines behind him. A curved white dashed arc loops up and over from his feet showing the somersault path he intends. Upper right: a small red-circled inset of a cartoon player mid-somersault, hand-lettered "Miroslav Klose." Bottom third: a flat bright green band with a white corner arc. (Video prompt: Peter running toward the corner flag, the dashed somersault arc drawing itself)
#Narration: Immediately after the ball crossed the line, he ran towards the corner flag and attempted a celebratory somersault inspired by German striker Miroslav Klose.
#Animated Image: Whiteboard-style doodle on a white background, "Peter Biaksangzuala" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Peter drawn in three faint overlapping stages — launching into the somersault, then rotating short with the arc drawn breaking off in red, then landing head-first on the green turf with sharp white impact lines at the point of contact. A red-circled callout points to his neck with a small jagged mark. Right: the last stage shows him lying motionless on the grass, eyes closed. (Video prompt: the somersault rotating short, the arc breaking, the impact lines flashing, Peter lying still)
#Narration: His rotation was miscalculated and he landed head first on the turf. The impact caused his neck to buckle sharply and he collapsed without getting back up.
#Animated Image: Whiteboard-style doodle on a white background, "Peter Biaksangzuala" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Peter lying motionless on the green turf, eyes closed, arms at his sides. Around him, three cartoon teammates in blue and yellow shirts — one kneeling beside him with a worried brow, two standing and waving both arms urgently toward the touchline, motion lines at their hands. Right edge: two doodled medics in white running onto the pitch with a stretcher, small motion lines behind them. (Video prompt: the teammates waving urgently, the medics running in with the stretcher)
#Narration: Teammates quickly signaled for medical assistance as he lay motionless.
#Animated Image: Whiteboard-style doodle of a hospital room, "Peter Biaksangzuala" hand-lettered at the top in marker font. Olive-green wall, white floor. Left: a cartoon figure of Peter lying flat on a white bed with a white neck brace around his neck, eyes closed. Center: a large pink cross-section diagram of the upper spine and skull overlayed on the image, with jagged dark red crack marks on the top vertebrae and a red-shaded band through the cord, hand-lettered "Cervical spine." Right: a cartoon doctor in a white coat over blue scrubs, stethoscope around the neck, one arm raised toward the diagram, a scan film in the other hand. (Video prompt: the doctor appearing, then the spine diagram, then the red cracks appearing on the vertebrae)
#Narration: He was transported to a nearby hospital where doctors diagnosed a critical cervical spine injury. Scans revealed fractures to the upper cervical vertebrae and severe spinal cord trauma.
#Animated Image: Whiteboard-style doodle of an intensive care room, "Peter Biaksangzuala" hand-lettered at the top in marker font. Olive-green wall, white floor, a curtain at the left. Center: a cartoon figure of Peter lying in a white bed, eyes closed, a white neck brace on, a ventilator tube taped at his mouth running to a boxy gray machine beside the bed with small dials and a green display. Above, a dark monitor showing a green ECG line and a second wavy blue line. Right: a cartoon nurse in a blue mask and blue scrubs with a clipboard, watching closely. (Video prompt: the ventilator machine cycling, the monitor lines tracing across, the nurse watching)
#Narration: He was placed in an intensive care unit supported by mechanical ventilation and continuous neurological observation.
#Animated Image: Whiteboard-style doodle of a hospital room, "Peter Biaksangzuala" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Peter lying in a white bed with a neck brace and ventilator tube, eyes closed. Two red-circled callouts linked by red arrows: upper left, a surgical tray with a scalpel and small metal plates and screws, hand-lettered "Stabilization"; upper right, a spine diagram with a black flat line running down it, hand-lettered "No response." Right: a doodled wall calendar with five days crossed out in black marker. (Video prompt: the surgery callout appearing, then the five calendar days crossing out one by one)
#Narration: Despite emergency treatment, including surgical stabilization, his neurological condition did not improve. Over the next five days, complications related to respiratory failure and spinal cord damage persisted.
#Animated Image: Whiteboard-style doodle of a hospital room, "Peter Biaksangzuala" hand-lettered at the top in marker font. Muted palette. Center: a cartoon figure of Peter lying in a white bed, eyes closed. Two red-circled callouts linked by red arrows: left, a doodled hand and foot with a black X over each and a small reflex hammer beside them, hand-lettered "No motor function"; right, a spine and nerve diagram with a black X. Above, a dark monitor showing a shallow, weakening green line. A doodled doctor and nurse stand at the foot of the bed with heads lowered. (Video prompt: the two callouts appearing one after the other, the monitor line weakening)
#Narration: Medical staff reported no recovery of motor function or reflexes.
#Animated Image: Whiteboard-style doodle of a hospital room, "Peter Biaksangzuala" hand-lettered at the top in marker font. Muted, subdued palette. Left: a cartoon figure of Peter lying in a white bed, eyes closed, a gray blanket pulled up over him against a white pillow, his expression peaceful. Right: a dark monitor screen showing a flat green line. Below it, a small doodled blue and yellow shirt folded neatly on a chair with a football beside it. Hand-lettered in the corner: "October 19th, 2014. 23 years old." (Video prompt: the ECG line getting progressively flatter, then going flat, holding on the folded shirt)
#Narration: On October 19th, 2014, he was pronounced dead due to cervical spinal cord injury and resulting systemic complications.
#Animated Image: grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, names below each in a hand-drawn marker font. Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. Below the grid, a doodled red subscribe button with a hand-drawn cursor arrow hovering over it, and a small speech bubble hand-lettered "Which story next?" (Video prompt: the portraits appearing one by one, the cursor clicking the subscribe button, the speech bubble popping in)
#Narration: If you like this video, don't forget to subscribe and tell me which story you want next. Thanks for watching and see you in the next one.`,
	},
	{
		id: "stick-explainer",
		length: "5-10m",
		name: "Stick Explainer",
		pillText: "Stickman explainer about",
		color: "#AA8AB1",
		style:
			"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		referenceImages: [
			templateAsset("stick-explainer-1"),
			templateAsset("stick-explainer-2"),
			templateAsset("stick-explainer-3"),
		],
		narration: {
			language: "en",
			gender: "masculine",
			age: "adult",
			accent: "american",
			description: "Steady, enunciating, confident young male for narrations",
		},
		showcase: {
			image: templateAsset("stick-explainer-3"),
			title: "Stickman explainer about...",
			description: "Stickman explainer about a certain topic",
			examplePrompt: "AI slop",
		},
		systemPrompt: dedent`# Important
		- Write the script as if writing a Stickman-style explainer video about the video topic in the user prompt
		- Use animated images for every image
		`,
		exampleText: dedent`#Animated Image: A chunky cartoon phone held up by a chibi YouTuber in a hoodie. A giant soup ladle pokes out through the phone screen and dumps a lumpy gray-green stew into a pig trough on the floor — and the trough itself is shaped like a red play button. The YouTuber pinches their nose with their free hand. A fat button on the phone reads "CREATE" with a sparkle on it. (Video prompt: ladle scooping and dumping, trough filling, YouTuber's cheeks puffing out).

#Narration: There is now an AI slop generator built into the YouTube Create app, allowing YouTubers to generate AI slop for YouTube, on YouTube.

#Animated Image: A wobbling gray-green blob with a sparkle on it stands on a small stage, being pelted from both sides with tomatoes. Left crowd: chibi viewers holding popcorn. Right crowd: chibi creators holding cameras and microphones. Both crowds are throwing. A scoreboard above the stage reads "LIKES 3" and "DISLIKES 9,000,000". (Video prompt: tomatoes flying in from both sides, blob flinching, dislike counter spinning upward).

#Narration: This is despite the fact that AI generated media is almost universally despised by viewers and creators alike.

#Animated Image: A laptop with an old-fashioned hand-crank meat grinder bolted to the top of the screen. The chibi host — round head, small glasses, gray t-shirt — is dropping two of his own cartoon characters into the hopper, one in a yellow shirt and one in purple, both waving their little arms in alarm. A sticky note on the laptop reads "make them argue about AI". (Video prompt: characters dropping into the hopper, crank turning, ominous grinding).

#Narration: I gave the app two of my characters and asked it to make a video of them arguing about whether AI is good for humanity.

#Animated Image: The two characters come out the other side badly wrong. The yellow one has seven fingers on a raised hand and a mouth that has slid onto its cheek; the purple one's face is melting off its head like warm ice cream while it gestures confidently. Their shirts have swapped colors halfway down. Subtitles across the bottom read "AI IS DANGERUOS" in wobbly misspelled letters. (Video prompt: faces melting and re-forming, extra fingers sprouting, subtitles glitching mid-word).

#Narration: AI is dangerous and will be the end of us. Nonsense, it is the evolution of humanity. But the risks — the benefits are limitless. Maybe you're right. Okay, cool.

#Animated Image: The host slumped low in a desk chair, mouth a flat line, giving a single slow thumbs-down at the laptop. On the desk beside him, an hourglass labeled "JOB SECURITY" with only a few grains left in the top bulb, and a torn-off calendar page. (Video prompt: sand trickling through the hourglass, host blinking once, very slowly).

#Narration: That was absolutely terrible, and my job is safe for another few months.

#Animated Image: A browser window crammed edge to edge with fat colorful buttons, every single one stamped with a sparkle. The actual video player has been squeezed down to a postage-stamp rectangle in the bottom corner. A tiny chibi user leans in and squints at it through a magnifying glass. Buttons are spilling out of the window frame and piling up on the floor. (Video prompt: new sparkle buttons popping in and shoving the video smaller, buttons overflowing onto the floor).

#Narration: Still, YouTube is overflowing with AI features that nobody asked for.

#Animated Image: A tall vending machine labeled "INSPIRATION". A chibi creator feeds their old videos into a coin slot on the side; out of the dispensing tray at the bottom tumble identical thumbnails — the same crude shocked open-mouthed face with a red arrow and a red circle, over and over. The tray is already overflowing and the creator is knee-deep in duplicates. (Video prompt: videos going in, identical thumbnails tumbling out and piling up around the creator's legs).

#Narration: The inspiration tab, for example, automatically generates new video ideas and thumbnails based on your previous content.

#Animated Image: A factory conveyor belt with three stations: a sparkle-covered machine, then a chibi creator sitting at a keyboard typing prompts, then an "UPLOAD" chute. A giant hand reaches down from the top of the frame and plucks the creator out like a Jenga block, dropping them into a bin marked "MIDDLEMEN". The two machines slide together to close the gap and the belt keeps running without missing a beat. (Video prompt: hand plucking the creator out, machines sliding together, belt speeding up).

#Narration: It seems inevitable that YouTube will eventually cut out the middleman and just generate these videos themselves, without having a human creator write the prompts.

#Animated Image: A red play-button box wearing an apron, cutting a big round cake with a knife. It hands the larger slice, marked "55%", across the frame to a chibi creator, who is immediately spending it — the slice becomes a tripod, a light and a microphone in a small arrow-loop that circles back to a fresh cake. The play button keeps the smaller slice on its own plate. (Video prompt: knife slicing, the 55% slice sliding over, the loop of gear-to-cake spinning around).

#Narration: YouTube currently gives 55% of the ad revenue earned by long-form videos back to creators, which encourages and funds the production of new content.

#Animated Image: The same cake, but the creator's chair is empty with a dotted outline where they used to be. The play-button box is eating the entire cake in one enormous bite, cheeks bulging. Behind it, a long low server building with a chimney; a small fork of cake is being shoveled into a furnace door labeled "GPUs", and an electricity meter on the wall is spinning so fast it's a blur. (Video prompt: play button swallowing the whole cake, meter dial spinning into a blur, furnace flaring).

#Narration: Replacing human creators with an internal AI slop generator would allow YouTube to keep 100% of that revenue, minus the cost of running the slop generator in a data center.

#Animated Image: A chibi viewer sits at a dinner table wearing a bib, cutlery in both fists, delighted. A waiter — the red play-button box in a little bow tie — serves a sequence of plates that get worse from left to right: a proper burger, then a burger with a sparkle stuck in it, then a plain bowl of gray-green mush. The viewer's happy expression never changes. (Video prompt: plates being swapped in one after another, each worse, the viewer beaming identically at every one).

#Narration: If they can get viewers comfortable consuming AI slop, they can eventually make the jump to generating it themselves and keep 100% of the platform's ad revenue.

#Animated Image: A chibi executive in a boxy navy suit at a whiteboard, pointing with a marker at an equation drawn in three parts: a small doodle of a human creator, a minus sign, then a fat green arrow going up and a bag of money. Four more suits sit at the table nodding in perfect unison, eyes closed. (Video prompt: the equation being written stroke by stroke, all four heads nodding in sync).

#Narration: On the surface, this seems to make rational business sense.

#Animated Image: A gray dystopian street under a flat overcast sky. Enormous screens on every building play the same gray-green blob. Rows of identical chibi figures in matching jumpsuits stare upward with blank flat-line mouths. In the center of the square stands a monument shaped like a red play button — and a thick black crack is running up its plinth. One small figure sits on the curb with a sketchpad, drawing, ignored. (Video prompt: screens flickering in unison, the crack creeping up the plinth, the sketching figure looking up).

#Narration: However, I believe that not only is YouTube's decision to embrace AI dystopian and morally wrong, it could completely destroy them as a business.

#Animated Image: Three chibi viewers on a couch, bowls in hand, licking them completely clean. One has a gray-green mustache of slop across their face and is holding the bowl out for seconds with enormous pleading eyes. Beside the couch, a crossed-out drawing of a viewer looking nauseated, with a big red X over it. The host stands in the corner of the frame with a hand over his face. (Video prompt: bowls being licked clean, one held out for seconds, host's shoulders sagging).

#Narration: Not because people will get sick of watching AI slop. In fact, I think YouTube will probably have the opposite problem.

#Animated Image: The red play-button box lounges on a wooden throne in a lopsided gold crown, one leg over the armrest. At the foot of the throne, three small rival boxes attempt a coup and fail: one with a music note has a bent sword, one with a black X is charging at the wrong wall, and one with a blue f has its head stuck in a bucket. (Video prompt: rivals charging in and comically failing, the king not even looking up).

#Narration: Right now, YouTube is the undisputed king of user-generated long-form video, despite the best efforts of TikTok, X and Facebook to dethrone them.

#Animated Image: A packed stadium seen from above, every seat filled with tiny chibi heads, a banner across the stands reading "2 BILLION". A dump truck labeled "20 MILLION A DAY" has backed up to the edge of the pitch and is tipping a landslide of video rectangles onto the field. The crowd is applauding. (Video prompt: truck bed tilting, videos avalanching onto the pitch, crowd heads bouncing).

#Narration: YouTube has over 2 billion logged-in monthly users, and over 20 million videos are uploaded to the platform every day.

#Animated Image: A playground roundabout. Chibi creators with cameras stand around the outside pushing it; chibi viewers with phones sit on it riding. A thick arrow loops from the pushers to the riders and back again. Sitting dead center on the roundabout's hub, the red play-button box has its eyes closed and its arms folded, doing absolutely nothing. (Video prompt: the roundabout spinning faster and faster, the play button dozing at the hub).

#Narration: If you're a creator making long-form videos, you put them on YouTube because that's where all the viewers are. And if you're a viewer, you watch stuff on YouTube because that's where all the creators are.

#Animated Image: A brand-new empty theater with a fresh "OPENING NIGHT" banner. A single hopeful chibi creator performs on stage to rows of completely empty seats, with a tumbleweed rolling through the aisle. Outside the glass doors, a crowd of viewers glances in, shrugs, and walks past toward a glow off-frame. (Video prompt: tumbleweed rolling, the performer's spotlight shrinking, the crowd outside walking past).

#Narration: It's almost impossible for a new platform to break into this market, because they need viewers to attract creators, and they need creators to attract viewers.

#Animated Image: A warm banquet hall crammed with food. Inside, the play-button king sits at a groaning table surrounded by chibi creators and viewers all eating happily. Outside the window, three scrawny rival boxes press their faces to the glass holding empty bowls, ribs showing through their cardboard sides. A brass plaque over the door reads "COMPETITIVE ADVANTAGE". (Video prompt: steam rising off the feast, rival faces sliding slowly down the glass).

#Narration: YouTube already has both, allowing them to starve out any new competition. In my opinion, this is YouTube's primary competitive advantage.

#Animated Image: A phone screen showing a grid of nine thumbnails: eight are featureless gray-green blobs with sparkles, one is a small human face looking nervous. A "90%" is scrawled across the blobs in red marker. Off to the right, a chibi grifter in wraparound sunglasses shovels more blobs into the grid with a spade, whistling. (Video prompt: the feed scrolling, the last human thumbnail getting shoveled over).

#Narration: Now imagine a future where 90% of the content you watch on YouTube is AI slop generated by the platform itself, or by low-effort grifters.

#Animated Image: Two identical bowls of gray-green mush sitting side by side on a counter, each with a price card. The left card reads "+ 6 ADS". The right card reads "NO ADS, HAS FRIENDS" and has a little heart and a chat bubble drawn on it. A chibi viewer strolls toward the right bowl with their hands in their pockets, whistling, not agonizing about it in the slightest. (Video prompt: viewer glancing left, glancing right, walking right without breaking stride).

#Narration: If another app came along offering the same slop but with fewer ads or better social features, why not make the switch? What keeps users on YouTube in the age of slop?

#Animated Image: The play-button king stands at a control panel, one finger still resting on a big red button labeled "REPLACE THE CREATORS", looking pleased with himself. Directly behind him is a second, much larger button labeled "REPLACE YOUTUBE" — and an enormous hand is descending from off-frame toward it. A single sweat drop appears on the king's face. (Video prompt: the giant hand lowering slowly, the king's smile freezing, sweat drop swelling).

#Narration: If human creators can be replaced, YouTube can be replaced.

#Animated Image: A white box with a swirl on it stands on a wobbly stepladder behind the throne, reaching up with both arms to lift the crown off the sleeping king's head. In its other hand it holds a phone showing an endless vertical feed of blobs, thumb mid-swipe. (Video prompt: the ladder wobbling, fingertips almost touching the crown, thumb swiping the feed).

#Narration: OpenAI has already shown their willingness to take on YouTube and TikTok with their app Sora, which lets users generate AI slop and scroll through the slop that other people have generated.

#Animated Image: A freeze-frame with the host stepping into his own drawing, holding a big hand-lettered card reading "SCRATCH THAT" over the previous scene. Behind the card: the ladder has collapsed, the swirl box is yanking its own power cord out of the wall, and a small headstone reads "SORA". A receipt unspools from a cash register and trails right out of the frame. (Video prompt: the card being slammed down, the plug popping out, the receipt unspooling endlessly).

#Narration: Wait, no — scratch that. While I was editing this video, OpenAI announced that they're actually shutting down Sora, presumably because it was a massively unprofitable waste of computing power.

#Animated Image: A small graveside gathering. A row of chibi tech-company boxes in black ties stand around the "SORA" headstone, heads bowed, each writing in a tiny notepad. Every visible notepad page reads the same thing: "TRY AGAIN, BUT BIGGER". (Video prompt: heads bowing, pens scribbling in unison, one box already looking up hungrily).

#Narration: Hopefully, other AI companies will learn a lesson from that. But it won't just be AI giants coming for YouTube's throne.

#Animated Image: A cookie factory with a bolted-on new wing covered in sparkles. A chibi executive shovels bundles of cash into a hopper labeled "$40 MILLION"; out the other end comes a small TV set playing an advert in which a gray-green blob lovingly holds a round sandwich cookie. Below the TV, an accountant sits on a stool quietly crying into a ledger. (Video prompt: cash being shoveled in, the TV advert playing on loop, the accountant's tears pooling).

#Narration: Oreo's parent company, Mondelez International, has already spent over $40 million developing their own AI video generator, which they plan to use to pump out slop TV advertisements.

#Animated Image: An open-plan office where all the employees are chibi candy: a gumdrop in a tiny headset, a lollipop with a face leaning back in an ergonomic chair, a candy cane pointing at a monitor. Every screen shows a rendering progress bar and a gray-green blob. A wall poster reads "SYNERGY". (Video prompt: progress bars filling, the gumdrop nodding at its screen, lollipop spinning in its chair).

#Narration: Even candy companies can now build their own AI slop generators.

#Animated Image: A downhill slope built from descending price tags, each one crossed out and rewritten smaller than the last. Careening down it toward the play-button castle at the bottom is a swarm of tiny startup go-karts, each flying a little flag — "BETTER FEED", "BETTER SLOP", "FEWER ADS" — and each one gaining. (Video prompt: price tags dropping away, go-karts accelerating down the slope, flags flapping).

#Narration: As video generation models get cheaper and more efficient, smaller and smaller startups will be able to make a play for YouTube's market share, competing to offer the best features, the best recommendations, and the best slop.

#Animated Image: The play-button king sits cheerfully on a thick tree branch, sawing through it on the trunk side of himself with a handsaw. With his other hand he leans down to hand a pamphlet reading "SLOP IS FINE!" to a chibi viewer standing below, who is reading it and nodding. Sawdust puffs; the branch has begun to bend. (Video prompt: saw working back and forth, sawdust puffing, the branch bowing).

#Narration: By teaching their viewers that watching slop is okay and creators don't need to be human, YouTube is destroying their own competitive advantage.

#Animated Image: The castle drawbridge is down and the moat is a dry cracked ditch. A parade of rival boxes strolls straight in wheeling suitcases, one of them checking a map. On the battlements the play-button king waves a tiny white handkerchief. In the bottom corner, the host gives a sarcastic double thumbs-up straight at the viewer. (Video prompt: rivals filing across the dry moat, king's handkerchief fluttering, host's eyebrow raising).

#Narration: Without the protective factor of their massive pool of human creators, YouTube is going to face meaningful competition for the first time in decades. Good luck with that.

#Animated Image: A huge empty stadium, every seat vacant, confetti drifting down anyway. Alone at center field, the play-button king holds up a pie chart that is one solid green circle marked "100%", grinning at nobody. A single crow sits on the goalpost. A "100%" balloon tied to his wrist is quietly deflating. (Video prompt: confetti falling into empty seats, balloon shrinking, crow taking off).

#Narration: And sure, in a slop-based future, they will get to keep 100% of their ad revenue — but only if there's anyone left watching.

#Animated Image: A wide gray-green sea of mush, drawn with thick wobbly ridges instead of waves. A chibi creator sits in a little rowboat holding a camera in one hand and a fishing rod labeled "VIEWS" in the other; the hook dangles above the surface with nothing on it. Bobbing all around the boat to the horizon are thousands of identical blobs. (Video prompt: mush slowly heaving, boat rocking, empty hook swinging).

#Narration: AI content generation is obviously terrible for human YouTubers, who will have to compete for views with an ocean of slop.

#Animated Image: The same mush sea, wider. A corporate tower with a red play button on its roof is sunk in it up to the third floor and tilting. Four chibi executives stand on the roof in their boxy suits, briefcases in hand, still holding a meeting — one of them is pointing at a flipchart showing a green arrow going up. (Video prompt: the tower settling deeper and tilting, the flipchart arrow still climbing).

#Narration: But in the long term, it's also potentially catastrophic for YouTube, the company.

#Animated Image: A gilded picture frame containing an alternate universe. Inside it: the play-button king in a beret, respectfully handing a paintbrush to a chibi human artist on a pedestal, while a torch-and-pitchfork mob chases a gray-green blob out of town in the background. A banner over the scene reads "MADE BY HUMANS". Everything inside the frame is warm and sunlit. (Video prompt: the framed scene glowing, mob chasing the blob off the edge of the frame).

#Narration: One obvious solution to all this would be for YouTube to viciously suppress AI content on their platform, inflame the existing slop hatred among viewers, and encourage them to celebrate human-made art instead.

#Animated Image: The host has fallen off his chair laughing, legs in the air, one hand slapping the floor, "HA HA HA" scrawled beside him. Behind him, the gilded frame from the previous shot is being crumpled into a ball and dropped into a wastebasket. Second beat: the host, upright, perfectly still, dead-eyed, staring straight ahead. (Video prompt: host convulsing with laughter, the frame crumpling into the bin, hard cut to the deadpan stare).

#Narration: Ha ha ha. Yeah, they're not going to do that.

#Animated Image: A boardroom where the whiteboard is already covered in every drawing from this video — the sinking tower, the dry moat, the empty stadium — all sketched out and dated. The chibi executives are variously yawning, checking a watch, and eating a sandwich. One has this exact video open on a laptop, playing at 2x speed, and isn't looking at it. (Video prompt: the whiteboard drawings appearing one by one while nobody reacts, one executive yawning enormously).

#Narration: Nothing I've said in this video is new information to the higher-ups at YouTube.

#Animated Image: A chibi viewer tipped back in a chair with a giant funnel in their mouth, gray-green mush glugging down it. The funnel is being held by the play-button box, whose expression is apologetic and pained, eyes darting sideways — because a much larger hand from off-frame is clamped around its arm, forcing it to keep pouring. (Video prompt: mush glugging down the funnel, the play button wincing, the big hand tightening its grip).

#Narration: The reason that they will continue to force AI slop down our throats, even though it could eventually destroy their business, is that they have no choice.

#Animated Image: A giant white blob figure with a large "G" on its front pushes a stroller down the street. Strapped into the stroller is the red play-button box, kicking its stick legs in protest. The G-parent holds a sparkle-covered rattle in its other hand and is shaking it enthusiastically at the child. (Video prompt: stroller rolling forward, play button kicking, rattle shaking).

#Narration: YouTube is owned by Google, and Google is one of the leading developers of generative AI.

#Animated Image: A huge wall chart with a green line climbing steeply — and the climbing section is visibly held up from beneath by a single wooden prop with a sparkle painted on it, planted on a stack of server boxes. The prop is bowing under the weight and has one small crack in it. To the side, a chibi investor stares up at the line with dollar signs where its eyes should be, ignoring the prop entirely. (Video prompt: the line climbing higher, the prop bowing and creaking, the crack widening slightly).

#Narration: AI slop may one day kill YouTube, but it's also propping up Google's stock price, and forms a key part of their overall growth strategy.

#Animated Image: A family dinner table. The giant "G" parent looms at one end, arm outstretched, pointing sternly down at a plate of gray-green mush. At the other end, the little play-button box sits on a booster seat, pushing the plate away with both hands and holding up a crayon drawing of chibi humans painting, singing and filming. The parent is not looking at the drawing. (Video prompt: the plate being pushed away and firmly pushed back, the drawing held higher and ignored).

#Narration: Google is heavily reliant on AI, so they can't have one of their own subsidiaries rejecting it and fighting for a future where human culture stays human.

#Animated Image: On the courthouse steps, a chibi figure in a stars-and-stripes top hat performs the Heimlich maneuver on the enormous "G" blob, which is doubled over and coughing up a round blue-and-green browser icon that arcs across the frame. Standing directly beside them, completely unnoticed, the play-button box whistles at the sky with a crown half-stuffed into its pocket. (Video prompt: the Heimlich thrust, the browser icon popping out and bouncing away, the play button whistling).

#Narration: The US government previously tried to force Google to spit out Chrome, but it seems to me that YouTube is the far more obvious antitrust case.

#Animated Image: Two crowned figures handcuffed together at the wrist and facing opposite directions, straining to walk away from each other. One is a magnifying glass over a search bar; the other is the red play-button box. Between them, an enormous hand-lettered question mark. A tiny lawyer chibi at their feet shrugs with both palms up. (Video prompt: both figures straining outward, cuffs going taut, question mark growing).

#Narration: These are massive, unrelated businesses with opposing commercial interests. Why does the search monopoly own the video sharing monopoly? Who knows?

#Animated Image: An enormous thin-skinned bubble with a sparkle floating inside it, drifting toward a needle mounted on the wall. Crouched behind a corner just out of the bubble's sight, the play-button king waits with a broom in one hand and a "WE ALWAYS HATED SLOP" sign in the other, already tucked under his arm and ready to deploy. (Video prompt: bubble drifting toward the needle, the king peeking around the corner, sign edging out).

#Narration: Maybe YouTube will start suppressing slop once the AI bubble pops.

#Animated Image: The play-button box thrashing in dark blue water while a swarm of small startup piranhas — little colored boxes with fins and one angry eye each — strip it from every direction. Bits of the crown are already floating away. One tiny piranha has a napkin tucked into its fin. (Video prompt: piranhas darting in from all sides, water churning, crown fragments drifting up).

#Narration: Or maybe they'll be eaten alive by smaller startups once slop becomes widely accepted.

#Animated Image: An auction house. A chibi podcaster stands on the block holding a microphone, looking extremely comfortable about it. Rival platform boxes raise numbered paddles with increasingly absurd figures scrawled on them. At the back of the room, the play-button king turns his wallet upside down and one moth flies out. (Video prompt: paddles shooting up one after another, gavel hammering, moth fluttering out of the wallet).

#Narration: Maybe we'll see a repeat of the podcast and streamer bidding wars, with top human talent being poached away from YouTube.

#Animated Image: A boxy robot with a flat screen for a face, displaying an enormous shocked open mouth. It flings handfuls of cash into a roaring crowd — but the cash is drawn as gray-green blobs, and the crowd is loving it anyway, hearts floating over their heads. Off in the bottom corner, a real chibi creator sits alone on a stool with a "100% HUMAN" badge and no audience at all. (Video prompt: the robot's screen cycling through shocked faces, blob-cash raining, the lone creator's stool sliding out of frame).

#Narration: Or maybe AI Mr Beast will be so compelling that these platforms will drop human creators altogether.

#Animated Image: A chibi figure in a dark purple cape stands on the toppled wooden throne, planting a flag reading "NO SLOP" and handing out free tickets to a cheering crowd below with the other hand. The crown rolls away across the floor and comes to rest in a puddle. One tidy little ad banner floats politely off to the side. (Video prompt: throne toppling, flag planting, tickets sailing into the crowd, crown rolling into the puddle).

#Narration: Maybe Nebula will ban AI content from their platform, launch an ad-supported free tier, and overthrow the tyrant king.

#Animated Image: The host stands sheepishly rubbing the back of his head next to an enormous corporate poster in cheery bubble lettering: "BRING BIG IDEAS TO LIFE" and "FUEL IMAGINATION", with a winged yellow lightbulb rising off the ground. One bottom corner of the poster has peeled away, revealing gray-green mush oozing out from behind it. The host has not noticed. (Video prompt: the winged lightbulb flapping upward, the poster corner peeling further, mush oozing out).

#Narration: Or maybe I'm entirely wrong, and AI will help YouTubers bring big ideas to life and fuel imagination, as YouTube seems to believe.

#Animated Image: Two bottles on a plain shelf under a hand-lettered "?" — on the left, a bloated milk carton with green stink lines rising off it and a fly hovering nearby wearing a tiny gas mask; on the right, a dark wine bottle with a neat label and a small gold medal hanging from its neck. Below the shelf, an empty comment box with a blinking cursor. (Video prompt: stink lines wafting, the fly adjusting its mask, cursor blinking).

#Narration: If you're watching this video in 5 years, comment below whether it aged like milk or wine.

#Animated Image: A tiny island in the middle of the gray-green mush sea, just big enough for one chibi creator, their tripod and their camera. Sleeves rolled up, jaw set, they hammer a flag into the ground reading "HUMAN MADE". The mush is already lapping over their shoes. (Video prompt: mush rising up their ankles, flag going in with three firm hammer strikes, creator not budging).

#Narration: And if you're a YouTuber making real human content — good luck. You're going to need it.

#Animated Image: The host waving with one hand. On his left, a chibi guest illustrator holds an oversized marker like a staff, with a small star doodle spinning beside their head and an arrow pointing at them. On his right, a row of chibi supporters wearing comically enormous hats — and the biggest hat has two blinking eyes and a small antenna, looking around the room by itself. (Video prompt: the marker being raised, hats popping onto heads one by one, the big hat blinking and glancing around).

#Narration: Thank you to Star for guest illustrating this video, and thank you to my backers on Patreon, especially those in the big sentient hat tier, for supporting the channel.

#Animated Image: The host waving both arms overhead, eyes curved into happy arcs, standing on a plain flat ground line with a small scribbled sun behind him. His marker cap and a closed sketchbook sit on the ground beside his feet. (Video prompt: host waving, then a whiteboard eraser sweeping across from one side and wiping the whole drawing away).

#Narration: I'm Siliconversations. Thanks for watching. See you all next time. Bye for now.`,
	},
];

const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

/** Optional lookup for ids from outside the app (persisted state, plugin params). */
export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}

/** Lookup for ids sourced from `TEMPLATES`, where a miss is a programming error. */
export function getTemplate(id: string): Template {
	const template = TEMPLATE_MAP.get(id);
	if (!template) throw new Error(`Unknown template id "${id}"`);
	return template;
}

const [firstTemplate] = TEMPLATES;
if (!firstTemplate) throw new Error("TEMPLATES must not be empty");

export const DEFAULT_TEMPLATE_ID = firstTemplate.id;
