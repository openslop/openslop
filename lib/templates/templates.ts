import dedent from "dedent";
import { BLOB_BASE_URL } from "@/lib/blob";
import type { ArtStyle } from "@/lib/project/artStyles";
import type { MetadataCharacter, MetadataVoice } from "@/lib/project/types";
import type { VideoLength } from "@/lib/project/videoLength";

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
	/** The sentence opener the pill shows and the user's brief starts with. */
	promptPrefix: string;
	color: string;
	exampleText: string;
	systemPrompt: string;
	length: VideoLength;
	style?: ArtStyle;
	referenceImages: string[];
	characters?: Record<string, MetadataCharacter>;
	/** Prebuilt avatars, seeded as the character avatar nodes' results. */
	characterAvatars?: Record<string, string>;
	narration: MetadataVoice;
	showcase: TemplateShowcase;
}

export const TEMPLATES: Template[] = [
	{
		id: "pov-life",
		length: "5-10m",
		name: "POV Life",
		promptPrefix: "POV: Your life at every stage as a",
		color: "#F59E0B",
		style: {
			description:
				"2D cartoon illustration, thick black outlines, muted desaturated colors, cinematic night lighting, flat shading, western animation style, no gradients",
		},
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
		- Never mention any specific ages in the image and video prompts, just generic ones like young man`,
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
		promptPrefix: "A sleep story about",
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
			description: "Wistful, young male for emotional narrations",
			provider: "openslop",
			model: "Slop TTS v1",
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
		promptPrefix: "Finance tips for",
		color: "#3B82F6",
		style: {
			description:
				"Flat 2D cartoon, bold black outlines, cel-shaded flat colors, oversized rounded heads with prominent chins, small oval eyes, bean-shaped bodies, stubby limbs. Vector-style props with thick outlines. Saturated colors. Explainer-cartoon aesthetic. Plain white background.",
		},
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

			#Video: Shot 1: Medium shot, slow push-in as Ethan stares down at a bathtub while dollar bills swirl down the drain. Sound: water gurgling down the drain. Shot 2: Close-up as Ethan's hand plunges into the water too late and the last bill slips away.
			#Narration: Right now. Today. And you probably don't even know it's happening.

			#Video: Shot 1: Medium shot, static, Ethan holds up a sign that reads "$86/month." Shot 2: Quick push-in as the sign flips over to reveal "$219/month" and Ethan's eyes go wide.
			#Narration: A big study asked Americans how much they spend on subscriptions every month. They guessed about 86 dollars. The real number? 219 dollars.

			#Video: Shot 1: From the same push-in on Ethan's wide eyes above the flipped sign, the camera snaps back to a medium shot with a hard camera shake as giant red on-screen text reading "$133 EXTRA / MONTH" slams onto the screen behind Ethan and his jaw drops all the way to the floor.
			#Narration: That's 133 dollars more than people think. Every. Single. Month.

			#Video: Shot 1: Medium shot, static, a pie chart spins next to Ethan as he raises a finger to point at it. Sound: a soft whirring spin. Shot 2: Slow push-in on the chart as a red slice labeled "42%" pops out of it.
			#Narration: And 42 percent of people are paying for stuff they already stopped using.

			#Video: Shot 1: Wide shot, slow push-in on Ethan sitting at a dark kitchen table, his face lit by his phone. Sound: a refrigerator humming, a wall clock ticking. Shot 2: Over-the-shoulder close-up of the phone screen showing "$43.17" with a red arrow pointing down, as a question mark floats up above Ethan's head.
			#Narration: Meet Ethan. He's 28. He makes 55 thousand dollars a year. Last week, he checked his bank account and it was almost empty. He had no idea why.

			#Video: Shot 1: Medium shot, Ethan slumps down onto a couch. Sound: couch cushions creaking. Shot 2: Slow tilt up as dollar bills float up around him one by one and vanish into the ceiling.
			#Narration: By the end of this video, Ethan is going to find 200 dollars hiding in his own bank statement. And so are you. My name is Nick. Today we're hunting down the five money leaks almost everyone has.

			#Image: Title card — "Leak 1: The Gym You Don't Go To"
			#Sound: [squeaky treadmill belt, then silence]
			#Narration: Leak number one. The gym you don't go to.

			#Video: Shot 1: Wide shot, static, Ethan stands in workout clothes in an empty gym while a single treadmill runs on its own behind him. Sound: a treadmill motor humming in the background, the belt squeaking. Shot 2: Slow pan as a tumbleweed rolls past his feet across the gym floor.
			#Narration: There are 77 million gym members in America. Half of them quit going in the first six months. But they keep paying.

			#Video: Shot 1: Medium shot, Ethan holds up a shiny gym card. Shot 2: Punch-in as a price stamp reading "$69 / MONTH" slams onto the screen behind him.
			#Narration: The average gym costs 69 dollars a month.

			#Video: Shot 1: Medium shot, slow push-in as Ethan peeks through a Planet Fitness window at rows of empty treadmills. Sound: crickets chirping inside, faint hum of fluorescent lights. Shot 2: Close-up of Ethan's face as bold on-screen text floats above him reading "60% never visit in 30 days."
			#Narration: At Planet Fitness, 60 percent of members don't even step inside once in a whole month. The gym only works because most people stay home.

			#Video: Shot 1: Medium shot, Ethan stands at a chalkboard and writes "$69 × 12 = $828." Sound: chalk scratching and tapping on the board. Shot 2: Close-up as he circles the answer, then his shoulders drop in a sigh.
			#Narration: If you pay and don't go, that's 828 dollars a year. Gone.

			#Video: Shot 1: Medium shot, Ethan holds up an envelope stamped "CANCELLATION LETTER." Shot 2: The envelope sprouts little arms, leaps out of his hand and runs away across the floor as the camera pans after it.
			#Narration: And here's the dirty trick. You can sign up online in two minutes. But to cancel? You have to go in person. Or mail them a letter. They make it hard on purpose.

			#Image: Title card — "Leak 2: Streaming You Don't Watch"
			#Sound: [TV static, then a quick channel-flip click]
			#Narration: Leak number two. Streaming.

			#Video: Shot 1: Medium shot, slow orbit around Ethan on the couch as he points a remote while Netflix, Hulu, Disney+, and Paramount+ logos circle around his head like planets.
			#Narration: The average American house pays for four streaming services. That adds up to 69 dollars a month. Over 800 dollars a year.

			#Video: Shot 1: Medium shot, static, stats pop into the air next to Ethan as bold on-screen text, first "ESPN+: 26%" then "Hulu: 26%." Sound: a heavy thud as each one lands. Shot 2: Two more pop in beside them, "Paramount+: 25%" then "Disney+: 23%," as Ethan's eyes follow them.
			#Narration: But here's the kicker. One in four people pay for these services and didn't watch them once last month. Not a single show.

			#Video: Shot 1: Close-up on Ethan's thumb scrolling through Netflix endlessly, slowing as it gets tired. Sound: repeated soft clicks. Shot 2: Medium shot, Ethan sits glazed on the couch with a bowl of cold popcorn untouched beside him.
			#Narration: Even Netflix — the most popular one — 17 percent of people haven't opened it in a month.

			#Video: Shot 1: Medium shot, static, a price tag in front of Ethan flips from "$15" to "$20." Sound: a card flipping. Shot 2: Close-up of Ethan wincing but staying perfectly still.
			#Narration: When prices go up by just 5 dollars, most people say they'll cancel. But they don't. They just keep paying.

			#Image: Title card — "Leak 3: The Free Trial Trap"
			#Sound: [mouse trap snapping shut]
			#Narration: Leak number three. The free trial trap.

			#Video: Shot 1: Medium shot, slow push-in as Ethan reaches his credit card toward a glowing mousetrap labeled "FREE 7-DAY TRIAL." Shot 2: Close-up as the trap snaps shut on his credit card and Ethan yelps and jerks his hand back.
			#Narration: You sign up for a free trial. You type in your credit card. You forget. Seven days later — you're paying.

			#Video: Shot 1: Close-up on Ethan's phone as he opens his bank app and a red alert bubble pops up reading "65% of Americans got charged." Sound: a harsh notification buzz. Shot 2: Medium shot, Ethan clutches his chest and staggers back.
			#Narration: 65 percent of Americans have been charged because they forgot to cancel a free trial. That's two out of every three people.

			#Video: Shot 1: Close-up as Ethan's thumb taps "Download" on his phone and a "DAY 1" stamp slams onto the screen. Sound: a screen tap, then a stamp thunk. Shot 2: Medium shot, a speech bubble graphic pops up next to Ethan with the text "89%" inside.
			#Narration: 89 percent of people sign up for the free trial the same day they download the app. Then they never think about it again.

			#Video: Shot 1: Close-up on Ethan's phone as he signs up, then immediately taps "Cancel." Sound: two quick screen taps. Shot 2: Medium shot, Ethan grins slyly as an email pop-up appears beside him reading "Wait! 50% off to come back!"
			#Narration: Here's a trick almost nobody knows. The moment you sign up for any trial — go cancel it right away. The company will keep letting you use it until the trial ends. And when it does, they will often email you a better deal to come back.

			#Image: Title card — "Halfway check-in"
			#Sound: [soft synth chime, like a level-up sound]
			#Narration: Halfway check-in. The next two leaks are the sneakiest of all.

			#Video: Shot 1: Close-up on a notepad as Ethan crosses items off a list that reads "Leak 1 ✓ Leak 2 ✓ Leak 3 ✓." Sound: a pen scratching across paper. Shot 2: Medium shot, Ethan at his desk looks up from the notepad with growing excitement.
			#Narration: Ethan's been taking notes. He's already found three leaks in his own life. Let's keep going.

			#Image: Title card — "Leak 4: The Protection Plan"
			#Sound: [cash register cha-ching]
			#Narration: Leak number four. The protection plan.

			#Video: Shot 1: Medium shot, Ethan holds a new TV box at a store checkout as a cashier waits behind the counter. Sound: a checkout scanner beeping. Shot 2: Close-up as the cashier leans forward with a wide smile, a speech bubble above the cashier reading "Want the protection plan?", and Ethan freezes.
			#Narration: You buy a TV. The cashier asks, "Want to add the protection plan?" The answer is almost always: no.

			#Video: Shot 1: Low-angle wide shot, slow tilt up past Ethan to two giant glowing numbers floating in the sky, "$1.27 BILLION collected" and "$210 MILLION paid back." Sound: a low electric hum from the glowing numbers. Shot 2: Close-up of Ethan staring up, mouth open.
			#Narration: Last year, Lowe's made over a billion dollars selling warranties. They only paid back 210 million.

			#Video: Shot 1: Medium shot, a dollar bill rips in two in front of Ethan. Sound: paper tearing. Shot 2: Ethan is left holding a tiny 17-cent scrap as the giant 83-cent piece flies off into a store window, the camera whipping to follow it.
			#Narration: That means for every dollar you spend on a warranty, the store keeps 83 cents. You get back 17.

			#Video: Shot 1: Medium shot, a TV, a microwave, and a dishwasher line up next to Ethan and tiny break percentages pop up above each one. Sound: three light pops. Shot 2: Slow pan along the line as Ethan points down it from one appliance to the next.
			#Narration: TVs only break 5 to 8 percent of the time. Microwaves, 12 percent. Dishwashers, 13 percent. The odds are on your side.

			#Video: Shot 1: Medium shot, Ethan flashes a thumbs up as bold green on-screen text booms in next to him reading "SKIP THE WARRANTY."
			#Narration: Skip it. Keep your cash. The only thing worth a warranty? A laptop. About one in three of those break.

			#Image: Title card — "Leak 5: Zombie Spending"
			#Sound: [low spooky moan with a heartbeat thump]
			#Narration: Leak number five. Zombie spending.

			#Video: Shot 1: Wide shot, slow push-in as old subscription logos crawl out of the ground of a graveyard, zombie style, and Ethan backs away. Sound: dirt crumbling, logos groaning and scraping. Shot 2: Close-up as the logos claw their way onto Ethan's credit card.
			#Narration: These are the worst. The subscription is dead to you. But it's still alive on your credit card.

			#Video: Shot 1: Medium shot, static, Ethan stares at a card floating in front of him that reads "60% forgot a recurring payment" and scratches his head.
			#Narration: 60 percent of people have forgotten about a payment coming out every month. 71 percent say they waste at least 50 dollars a month on stuff they don't want anymore.

			#Video: Shot 1: Close-up as Ethan punches numbers into a calculator and the screen flashes "$50 × 12 = $600." Sound: calculator keys clicking. Shot 2: Medium shot, Ethan's shoulders drop.
			#Narration: That's 600 dollars a year. For nothing.

			#Video: Shot 1: Medium shot, Ethan flips a calendar page and the month is stamped red with a giant X. Sound: a page flip and a stamp thunk. Shot 2: He flips two more months, each stamped red with a giant X, wincing with each flip.
			#Narration: And here's the saddest part. When people finally notice, it takes them three to six months to actually cancel. That's half a year of paying for nothing.

			#Video: Shot 1: Wide shot, a factory machine labeled "BIG COMPANIES" runs in front of Ethan. Sound: machinery clanking and whirring, servo motors whining, a conveyor belt rattling. Shot 2: Close-up as a mechanical arm reaches into Ethan's pocket, pulls out dollar bills and drops them onto a conveyor belt.
			#Narration: Here's the big secret. Every company you pay has set up a robot to take your money automatically. Your gym. Netflix. Your phone bill. They all know — if they didn't make it automatic, you'd stop paying.

			#Video: Shot 1: Medium shot at the same clanking factory machine as the mechanical arm pulls back out of Ethan's pocket, Ethan grabs a big red lever on it and yanks it down. Sound: a heavy metal clunk. Shot 2: Wide shot as the conveyor belt reverses and money pours back into his piggy bank while Ethan grins.
			#Narration: So here's the move. Turn that robot around. Make it pay you instead.

			#Image: Title card — "The Fix"
			#Sound: [wrench tightening a bolt with a satisfying clink]
			#Narration: Okay. Here's how. It takes 15 minutes. Tonight.

			#Video: Shot 1: Extreme close-up of Ethan's iPhone as his thumb taps "Settings," then his name. Sound: soft screen taps. Shot 2: His thumb taps "Subscriptions" and a long list scrolls into view as the camera holds on the screen.
			#Narration: Step one. The big one. If you have an iPhone, open Settings. Tap your name at the top. Tap Subscriptions. Every single thing you've signed up for will show up in one list.

			#Video: Shot 1: Holding close on the same subscriptions list on Ethan's iPhone, his thumb taps "Cancel" over and over as an on-screen counter ticks up "1, 2, 3, 4, 5…" Sound: rapid screen taps, a click with each tick. Shot 2: Medium shot, Ethan's smile grows bigger with each tap.
			#Narration: Tap. Cancel. Tap. Cancel. Most people find 5 to 10 things they totally forgot about. On Android, open the Play Store, then Payments and Subscriptions. Same magic list.

			#Video: Shot 1: Medium shot, Ethan sits at his kitchen table holding a red marker over his bank statement. Shot 2: Close-up as he circles three repeating charges one by one and the numbers glow.
			#Narration: Step two. Open your bank app. Look at the last three months. Circle every charge that shows up every month. Even the tiny ones. Especially the 4 dollar and 99 cent ones. Those are the hiding spots.

			#Video: Shot 1: Close-up as Ethan types "subscription, renewal, free trial" into his email search bar. Sound: keyboard keys clacking. Shot 2: Wide shot, old emails fly out of the screen and pile up around him.
			#Narration: Step three. Search your email for "subscription", "renewal", and "free trial". You'll find stuff you forgot existed.

			#Image: Title card — "The Subscription Freeze"
			#Sound: [ice crystals forming, soft frosty crackle]
			#Narration: Now here's the lazy trick. It's called the Subscription Freeze. Cancel everything at once. All of it.

			#Video: Shot 1: Medium shot, static, Ethan calmly eats popcorn on the couch beside a loudly ticking clock. Sound: a loud clock ticking close by, popcorn crunching. Shot 2: Close-up as he shrugs.
			#Narration: Then wait. See what you actually miss. You can always sign back up with one click. Most people find they don't miss much at all.

			#Video: Shot 1: Close-up as Ethan taps his bank app and sets up an auto-transfer. Sound: screen taps. Shot 2: Medium shot, a glowing arrow labeled "$100 / month" flows out of his account and into a piggy bank.
			#Narration: Now here's the part nobody talks about. Don't just save that money. Send it somewhere automatic. Set up your bank to move 100 dollars a month into a savings or investing account. Same way Netflix takes from you. But now it's working for you.

			#Video: Shot 1: Wide shot, slow tilt up from older Ethan with grey hair standing under a giant money tree to a glowing "$632,000" hanging at the top. Sound: leaves rustling in a breeze, paper bills fluttering. Shot 2: Medium shot as leaves of cash drift down around him.
			#Narration: 100 dollars a month. Invested for 40 years. Grows into 632 thousand dollars. From the same money you were already losing.

			#Video: Shot 1: Medium shot, Ethan points at bold on-screen text that bounces in reading "Can't do 12%? Start with 1%." Sound: a springy bounce. Shot 2: Close-up as a tiny coin drops into a piggy bank beside him.
			#Narration: Can't save a hundred bucks? Start with one percent of your paycheck. You won't even feel it. In a year, you'll be saving more than most Americans.

			#Video: Shot 1: Wide shot, static, a dark screen with Ethan's silhouette standing small and hunched as white on-screen text appears next to him reading "You pay. You forget. They win."
			#Sound: [low, slow heartbeat]
			#Narration: You pay. You forget. They win.

			#Video: Shot 1: From the same static wide shot of the dark screen, Ethan's small hunched silhouette beside the white on-screen text, a slow push-in as his silhouette slowly straightens up tall and strong. Shot 2: The white on-screen text beside him rewrites itself to read "Or you can stop forgetting."
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
		promptPrefix: "A true crime story about",
		color: "#8A0000",
		style: {
			description:
				"Semi-realistic digital comic illustration, cel-shaded with bold ink outlines, muted earthy palette, cinematic dramatic lighting, gritty detailed textures, expressive characters, vertical 9:16 composition, Rockstar Games concept art style",
		},
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
		promptPrefix: "POV: You're a",
		color: "#059669",
		style: {
			description:
				"Flat 2D vector cartoon illustration in a modern animated web-comic style. Bold, clean black outlines of even weight. Smooth cel-shaded coloring with soft gradient lighting, gentle ambient glow, and warm cozy color palettes. Slightly muted, desaturated tones with warm highlights. The Protagonist has rounded, soft proportions and a friendly approachable look, rendered against richly illustrated environments. Clean, polished, professional digital cartoon aesthetic reminiscent of explainer-video and meme-style animation.",
		},
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
		promptPrefix: "Death of every",
		color: "#C7BFB2",
		style: {
			description:
				"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		},
		referenceImages: [
			templateAsset("celebrity-death-1"),
			templateAsset("celebrity-death-2"),
			templateAsset("celebrity-death-3"),
			templateAsset("celebrity-death-4"),
		],
		narration: {
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
		exampleText: dedent`#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Diego Maradona until it fills the frame.

#Narration: Diego Maradona.

#Video: Shot 1: Medium shot on a white background with the caption "Diego Maradona" at the top, Diego Maradona stands center with a big mop of black curly hair and a squinting grin, in a light blue and white striped shirt and black shorts, one arm raising a shaded gold trophy aloft. Sound: a stadium crowd roaring in the distance. Shot 2: Slow tilt down to a bright green band packed with a crowd of fans surging upward around him, raised arms and cheering hands, a few cameras among them.

#Narration: Diego Armando Maradona (1960) was widely regarded as one of the greatest footballers in history.

#Video: Shot 1: Medium shot, static, caption "Diego Maradona" at the top, Diego Maradona stands center with a mop of black curly hair, closed eyes, a small smile and red blush marks, in a light blue and white striped shirt and black shorts, both arms raised outward, thin stick legs on a flat bright green band standing in for the pitch. Shot 2: Slow push-in as a Forza Napoli flag pops in on his left and a waving Argentine flag, light blue and white bands with the golden sun face in the middle, pops in on his right, Diego smiling.

#Narration: He was a symbol of Argentina and Napoli and the 1986 World Cup champion.

#Video: Shot 1: Medium shot, slow push-in, caption "Diego Maradona" at the top, Diego Maradona now older-looking, with a mop of black curly hair, heavy brows, tired downturned eyes and a gray beard and mustache, in a light blue and white striped shirt and black shorts, thin stick legs, standing on a flat green band. Shot 2: Close-up on his hands, one holding a large tilted green alcohol bottle, the other a small cluster of white pills.

#Narration: After retiring in 1997, his health suffered a serious decline due to alcohol and drug use.

#Video: Shot 1: Wide shot of a hospital room with an olive-green wall, white floor, a curtain and IV pole at the left edge and a pale window panel at the right, caption "Diego Maradona" at the top, Diego Maradona lying on a white bed left of center, seen from above the head, big mop of black curly hair, eyes closed, in a dark gown, a doctor standing at the right. Sound: a heart monitor beeping steadily. Shot 2: The doctor at the right turns to face forward, in a green surgical cap, light blue face mask, white coat over blue scrubs and a stethoscope, raising one arm as a large pink cross-section diagram of a brain appears in the center with a dark red dot marking the hematoma.

#Narration: In 2020, Maradona underwent surgery to remove a subdural hematoma.

#Video: Shot 1: Medium shot of a hospital room with an olive-green wall, white floor, curtain and IV pole at the left, caption "Diego Maradona" at the top, Diego Maradona sits up on a bed looking sad and unhealthy, black curly hair, gray beard, tired droopy eyes with shadows beneath, gray gown, thin stick limbs. Sound: labored wheezing breaths. Shot 2: A red-circled callout of red lungs dripping blue fluid appears at the upper right, then a red-circled callout of a distressed, misshapen red heart at the lower left, both linked to him by red arrows. Sound: fluid dripping, a heavy irregular heartbeat. Shot 3: Pan right to a dark monitor screen showing an irregular green ECG line.

#Narration: In the days following the surgery, Maradona showed serious warning signs: labored breathing, fluid buildup in the lungs, and gradual heart failure.

#Video: Shot 1: Wide shot on a white background with a gray floor band, caption "Diego Maradona" at the top, two identical nurses stand side by side at the left in white caps with red crosses, light blue face masks and blue scrubs, a doctor standing beside them at the right. Shot 2: Pan right as the doctor, with an angry scowling brow, in a green surgical cap, blue mask, white coat over blue scrubs and a stethoscope, walks away from them with motion lines behind him, a simple building with a red roof behind him.

#Narration: However, the home medical team failed to recognize the severity. No doctor was consistently present at the house.

#Video: Shot 1: Medium shot, caption "Diego Maradona" at the top, Diego Maradona lies in bed seen head-on from above, black curly hair, gray beard, eyes closed with shadows beneath, gray gown, a gray blanket pulled up over him against a white pillow. Sound: slow shallow breathing, a monitor beeping. Shot 2: Slow pan right to a dark monitor whose green ECG line grows progressively flatter above a dull dark-red heart with a black X drawn across it, Diego passing away in the bed.

#Narration: On November 25th, 2020, Maradona suffered cardiac arrest in his sleep at his home in Tigre.

#Video: Shot 1: Wide shot of a hospital room with an olive-green wall and pale blue window panels at the right, caption "Diego Maradona" at the top, Diego Maradona lying on a white bed at the left, seen from above the head, big mop of black curly hair, eyes closed, in a dark gown, a dark monitor on the wall above showing a green ECG line, three nurses standing at the right. Sound: a monitor alarm beeping rapidly. Shot 2: Medium shot, one nurse in a white cap with a red cross, blue mask and blue scrubs, brow worried, leans over him holding a dark rectangular device against his chest, while the two other masked nurses in caps and blue scrubs watch anxiously from the right.

#Narration: Emergency services were immediately called and medical personnel performed resuscitation attempts on site.

#Video: Shot 1: Wide shot of a hospital room with an olive-green wall, white floor, curtain and IV pole at the left, caption "Diego Maradona" at the top and "60 years old." written in the corner, Diego Maradona lying on a white bed at the left with a white sheet drawn up to his chest, black curly hair, gray beard, eyes closed, a small gray wall clock above the bed, a doctor standing beside the bed. Shot 2: Medium shot of the doctor beside the bed in a green surgical cap, blue mask pulled down to his chin and white coat over blue scrubs, a clipboard lowered to his side, as he lowers his head and the clock hand ticks once.
#Narration: Despite the intervention, he was pronounced dead shortly after their arrival. He was 60 years old.
#Video: Shot 1: Medium shot, caption "Diego Maradona" at the top, a faded gray outline-only silhouette of Diego Maradona with his mop of curly hair stands center above a flat green band. Shot 2: Three red-circled callouts appear one by one around the fading silhouette, linked by red arrows: a tilted green bottle and a scatter of white pills at the upper left, a dull red heart with black cracks running through it at the upper right, and a clipboard with illegible lines and a red cross at the top at the lower center.
#Narration: His death was further aggravated by years of substance abuse, a weakened cardiovascular system, and complications from long-term chronic health conditions.
#Video: Shot 1: Wide shot, caption "Diego Maradona" at the top, a tall flagpole in the center flies the Argentine flag, light blue and white bands with the golden sun face, lowering slowly to half-mast with a black ribbon tied beneath it, a simple pink government building with white columns and a small dome at the left, a flat gray band below. Sound: a flagpole rope squeaking, fabric flapping. Shot 2: Pan right to a wall calendar where three circled days are crossed out one by one in black marker.
#Narration: After Maradona's passing, Argentina declared 3 days of national mourning.
#Video: Shot 1: Wide shot, caption "Diego Maradona" at the top, a tall white obelisk monument with a pointed tip stands center as an enormous crowd grows outward from it to fill the lower two-thirds of the frame. Sound: a vast crowd roaring, drums pounding in the distance, flags snapping. Shot 2: Slow push-in over the crowd: hundreds of heads, raised arms, light blue and white striped shirts, small Argentine flags waving, cameras and phones held up, and a banner held overhead reading "D10S."
#Narration: An estimated 1 million people gathered in Buenos Aires to pay tribute to the football legend.
#Video: Shot 1: Medium shot, caption "Diego Maradona" at the top, three phone screens pop in one by one in a row, each with a black ribbon in the corner: a blue club crest with a white "N," a portrait of Pelé in a cream-and-green collar, and a portrait of Cristiano Ronaldo in a dark shirt. Sound: three phone notification chimes. Shot 2: Slow tilt down as a row of small hearts and folded hands below the phones floats upward above a flat gray band.
#Narration: Clubs and players around the world including SSC Napoli, Pelé and Cristiano Ronaldo expressed their condolences and honored his legacy.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Diogo Jota until it fills the frame.
#Narration: Diogo Jota.
#Video: Shot 1: Wide shot, caption "Diogo Jota" at the top, a riverside skyline with a tall bridge arch and terracotta rooftops at the left labeled "Porto, 1996," and a small green and red Portuguese flag waving at the right, Diogo Jota standing small in front of the skyline. Sound: river water lapping, a flag flapping. Shot 2: Medium shot of Diogo Jota in the center with short dark hair and a small smile, in a bright red shirt and red shorts, thin stick legs, tapping a football with one foot on a flat bright green band.
#Narration: Diogo Jota was born on December 4th, 1996 in Porto, Portugal, a dynamic forward for Liverpool FC and the Portuguese national team.
#Video: Shot 1: Medium shot, caption "Diogo Jota" at the top, Diogo Jota mid-stride in a red shirt, arms out, mouth open in a shout, a red club crest with a small bird outline at the left and a green and red Portuguese crest at the right, on a bright green band with a white penalty-box line. Sound: a crowd roaring. Shot 2: Push-in on the scoreboard behind him as the number climbs to "100+ GAMES" scrawled across it, Jota celebrating.
#Narration: By 2022, he had played over a 100 games for Liverpool and his national team.
#Video: Shot 1: Wide shot, caption "Diogo Jota" at the top, a sleek green sports car in side profile, low and wedge-shaped, sits on a long gray road with dashed white center lines, Diogo Jota with short dark hair at the wheel and his brother André Silva beside him, a signpost reading "Spain" at the left edge. Sound: an engine idling. Shot 2: Tracking shot as the car pulls away to the right, road lines scrolling beneath it, toward a signpost reading "Santander."
#Narration: On July 3rd, 2025, Jota and his younger brother André Silva set out from central Spain in a Lamborghini Huracán heading towards Santander, en route to Liverpool.
#Video: Shot 1: Wide shot on a dark navy night background with small white stars and a thin crescent moon, caption "Diogo Jota" at the top, the green sports car drives small into the distance along a long gray road curving toward the horizon, two yellow headlight cones flickering into the dark. Sound: a lone engine fading into the distance, crickets. Shot 2: A small inset appears at the left showing a duffel bag and a pair of football boots tied together by their laces.
#Narration: It was meant to be a quiet journey before preseason training, but it ended in disaster.
#Video: Shot 1: Overhead wide shot of a two-lane gray highway with dashed white lines on a dark navy background, caption "Diogo Jota" at the top, a small clock face reading 3:00 labeled "3:00 AM" at the upper left, a green road sign reading "A52" at the upper right and a small green Civil Guard badge at the lower right. Sound: a distant traffic hum. Shot 2: The green sports car swings out into the left lane alongside a boxy gray van, following a curved white arrow along the overtaking path.
#Narration: According to the Spanish Civil Guard, at around 3:00 a.m., Jota's brothers were driving along the A52 highway near Cernadilla while overtaking another vehicle.
#Video: Shot 1: From the same overhead view of the green sports car out in the left lane alongside the boxy gray van, the camera drops to a medium shot on a dark navy background, caption "Diogo Jota" at the top, as one front tire of the green sports car bursts into a black shape with jagged fragments flying out, a red-circled callout pointing to it. Sound: a loud tire blowout bang, rubber flapping. Shot 2: Wide shot as the car veers off-kilter and rolls along curved black motion arrows, past a white roadside marker post reading "KM 64" at the bottom right, as orange and yellow flames rise.
#Narration: The Lamborghini Huracán reportedly suffered a tire blowout, veered off the road, and flipped multiple times, and burst into flames near kilometer point 64.
#Video: Shot 1: Medium shot on a dark navy background, caption "Diogo Jota" at the top, a twisted, blackened car shape barely recognizable, wrapped in orange and yellow flames with gray smoke curling upward, two firefighters running in at the right edge. Sound: fire roaring and crackling close by. Shot 2: Wide shot as a red fire engine arrives at the left with its blue light flashing, and the two firefighters in yellow helmets and reflective-striped coats stand at the right, one holding a hose.
#Narration: When emergency services arrived, the car was already engulfed in fire, its frame twisted beyond recognition.
#Video: Shot 1: Medium shot on a dark navy background, caption "Diogo Jota" at the top, continuing at the same wreck as the camera slides right past the two firefighters in yellow helmets until they stand at the left edge, one still holding the hose, while the last flames on the blackened, twisted car go out and thin gray smoke rises from it, two small white birds above. Sound: embers hissing, water dripping, quiet wind. Shot 2: Wider shot revealing the two firefighters in yellow helmets at the left lowering their heads, a slack hose at their feet, and a plain white sheet laid over a shape on the ground at the right, shown plainly without detail.
#Narration: Firefighters extinguished the blaze, but it was too late. They found the remains of the two brothers inside the wreck, burned beyond recognition.
#Video: Shot 1: Overhead shot of a gray road surface, caption "Diogo Jota" at the top, as two long black skid marks draw themselves across it, curving off toward the shoulder, and a measuring tape extends alongside them labeled "30 m," an investigator crouching at the roadside. Sound: a tape measure zipping out, gravel crunching under a knee. Shot 2: Medium shot of the investigator in a dark jacket crouching with a clipboard, magnifying glass raised, beside a small red-circled callout of hands gripping a steering wheel tightly.
#Narration: Investigators later found skid marks over 30 m long, suggesting that the driver had tried desperately to regain control in the final seconds.
#Video: Shot 1: Wide shot, caption "Diogo Jota" at the top, a stadium wall with a mural of Diogo Jota in a red shirt as scarves and bunches of flowers pile up at its base and a crowd of fans in red bow their heads, some holding red scarves stretched overhead, Cristiano Ronaldo standing at the far right. Sound: a hushed crowd shuffling, flower wrappings rustling, wind across the stadium. Shot 2: Pan right to Cristiano Ronaldo in a dark shirt with a black armband on his sleeve, head lowered, one hand over his heart, above a flat gray band.
#Narration: The news devastated fans, teammates, and the entire football community, including Portugal's captain, Cristiano Ronaldo, who paid an emotional tribute to his fallen teammate.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Pelé until it fills the frame.
#Narration: Pelé.
#Video: Shot 1: Medium shot, caption "Pelé" at the top and "1940" written beside him, Pelé with short black hair and a wide grin, in a cream shirt with a green collar and number 10 and blue shorts, thin stick legs, leaps with one clenched fist raised high and one knee lifted. Sound: a roaring crowd. Shot 2: Tilt down to a bright green band packed with cheering fans, raised arms and small yellow and green flags.
#Narration: Edson Arantes do Nascimento, known as Pelé, 1940, was regarded as the greatest footballer of all time.
#Video: Shot 1: Medium shot, caption "Pelé" at the top, Pelé in a cream shirt with a green collar stands with both arms outstretched on a flat bright green band as three shaded gold trophies pop in one by one in a row above him, labeled "1958," "1962," and "1970." Sound: three metallic clinks. Shot 2: Pan right to a large football with a goal counter climbing to "1,200+ GOALS" scrawled across it.
#Narration: He won three FIFA World Cups, 1958, 1962, 1970, and scored over 1,200 career goals.
#Video: Shot 1: Medium shot, caption "Pelé" at the top, Pelé in a cream shirt and blue shorts performs a bicycle kick, flipping upside down in the air and swinging one leg high into a football as curved white motion arcs trace the kick, above a flat bright green band. Sound: a sharp boot-on-ball thump, a crowd gasping, the ball thudding into a net in the distance. Shot 2: Three small red-circled callouts appear around him, linked by red arrows and labeled "Technique," "Vision," and "Finishing."
#Narration: His exceptional technique, vision, and scoring ability made him a defining figure in football history.
#Video: Shot 1: Medium shot of a clinic room with an olive-green wall and white floor, caption "Pelé" at the top, an older Pelé sits on an examination bed at the left with short gray hair, a gray mustache, tired eyes, a pale hospital gown and thin stick limbs, a doctor standing at the right. Sound: paper crinkling on the exam bed. Shot 2: The doctor in a white coat over blue scrubs, stethoscope around the neck and clipboard in one hand, steps forward at the right and raises an arm toward a large pink cross-section diagram of a colon appearing in the center with a dark red mass labeled "Tumor."
#Narration: In 2021, Pelé was diagnosed with colon cancer.
#Video: Shot 1: Medium shot of a hospital room with an olive-green wall and white floor, caption "Pelé" at the top, Pelé sits in a blue reclining chair with thinning gray hair and a blanket over his lap, a tube running to his arm from a clear drip bag on an IV pole at the left that slowly empties, a red-circled callout of a surgical tray with a scalpel and forceps above him. Sound: an IV pump clicking, a slow drip. Shot 2: Pan right to a row of four chemotherapy bags hanging in a line as check marks appear beside them one by one.
#Narration: He underwent surgery to remove the tumor, followed by multiple rounds of chemotherapy.
#Video: Shot 1: Medium shot, caption "Pelé" at the top and "Early 2022" written in the corner, a large pink front-on outline diagram of a human torso in the center, a scan viewer panel with a pale film clipped to it at the left, and a doctor in a white coat with a furrowed brow pointing at the diagram from the right. Sound: a scan film snapping onto a light box. Shot 2: Slow push-in on the torso as three dark red blotches appear and spread one by one, at the intestines, the lungs and the liver, each ringed in red and linked by a red arrow to a small label.
#Narration: Despite initial treatment, early 2022, scans revealed it metastasized in his intestines, lungs, and liver.
#Video: Shot 1: Wide shot, caption "Pelé" at the top, a tall white hospital building with rows of blue windows and a red cross above the door appears at the left, labeled "São Paulo," one lit window showing Pelé in a bed with a nurse beside him. Sound: an ambulance siren approaching. Shot 2: Medium shot of Pelé propped up in a white bed at the right, gray hair, gray mustache, tired eyes, gray gown, a clear oxygen tube at his nose, the nurse in a blue mask and blue scrubs at the bedside with a clipboard, as a red-circled callout of pink lungs with small blue virus dots around them appears above him.
#Narration: Later that year on November 29th, Pelé was admitted to Albert Einstein Israelite Hospital in São Paulo for a respiratory infection caused by COVID-19 and for reassessment of his cancer treatment.
#Video: Shot 1: Medium shot of a hospital room, caption "Pelé" at the top and "December 3rd, 2022" written in the corner, Pelé lies in a white bed with gray hair, eyes half-closed, a gray gown and a blanket drawn to his chest, a chemotherapy bag hanging from an IV pole at the left, a doctor and a nurse standing at the right. Sound: a monitor beeping slowly. Shot 2: A black X draws itself across the chemo bag as, at the right, the doctor in a white coat and the nurse in blue scrubs stand together with heads slightly bowed and a clipboard labeled "Palliative care" appears in one of their hands.
#Narration: On December 3rd, 2022, medical reports indicate that Pelé had become unresponsive to chemotherapy and his care was shifted to palliative measures.
#Video: Shot 1: Medium shot of a hospital room, caption "Pelé" at the top and "December 21st" written in the corner, Pelé lies in a white bed with gray hair, eyes closed with shadows beneath, an oxygen tube at his nose, a dark monitor above him showing a wavering irregular green ECG line. Sound: an irregular monitor beep, oxygen hissing. Shot 2: A red-circled callout of dull, drooping red kidneys appears at the upper left, then a distressed, misshapen red heart at the upper right, both linked to him by red arrows.
#Narration: By December 21st, his tumor had advanced further with additional complications including renal and cardiac dysfunction.
#Video: Shot 1: Medium shot of a hospital room, caption "Pelé" at the top, Pelé lies in a white bed at the left beneath a dark monitor showing a green ECG line, a nurse in blue scrubs and a mask standing watch beside him. Sound: a monitor beeping steadily. Shot 2: Slow push-in on a window at the right as a small house with a decorated Christmas tree glowing inside appears faintly in gray and green, then a black X draws itself across the window pane.
#Narration: Medical staff determined that he required intensive monitoring and was not allowed to spend Christmas at home.
#Video: Shot 1: Medium shot of a hospital room, caption "Pelé" at the top and "1940 – 2022. 82 years old." written in the corner, Pelé lies in a white bed at the left with a peaceful expression, gray hair, eyes closed, a gray blanket pulled up over him against a white pillow. Sound: slow monitor beeps. Shot 2: Pan right to a dark monitor as the green ECG line flattens progressively and then goes flat, above a small clock face whose hands settle at 3:27, labeled "3:27 p.m."
#Narration: On December 29th, 2022 at 3:27 p.m., Pelé passed away at the age of 82.
#Video: Shot 1: Medium shot, caption "Pelé" at the top, a faded gray outline silhouette of Pelé in his number 10 shirt stands center above a flat gray band. Shot 2: Red-circled callouts appear one by one around the fading silhouette, linked by red arrows: dull red kidneys with a black X at the upper left, a dull red heart with a black X at the upper right, pink lungs shaded dark and heavy at the lower center, and below them a colon with a dark red mass labeled "Adenocarcinoma."
#Narration: The causes of death were multiple organ failure, including kidney failure, heart failure, and bronchopneumonia, all related to advanced colon adenocarcinoma.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of José Antonio Reyes until it fills the frame.
#Narration: José Antonio Reyes.
#Video: Shot 1: Medium shot, caption "José Antonio Reyes" at the top and "1983" written beside him, José Antonio Reyes with short dark hair and a small confident smile, in a red shirt and white shorts with thin stick legs, flicks a football up from his feet on a bright green band with a white touchline. Sound: a ball flicked off a boot. Shot 2: Pan right to a small red and yellow Spanish flag waving.
#Narration: José Antonio Reyes, born 1983, was a prominent Spanish footballer of the early 2000s.
#Video: Shot 1: Medium shot, caption "José Antonio Reyes" at the top, Reyes in a red shirt raises both arms on a flat bright green band as three silver and gold trophies pop in one by one above him, labeled "Champions League," "La Liga," and "Europa League." Sound: three metallic clinks. Shot 2: Tilt down as three club crests pop in below: a red and white striped crest, a red crest with a cannon, and a white crest with a crown.
#Narration: Through his career, he won multiple domestic and European titles, including the UEFA Champions League, La Liga, and Europa League with Sevilla, Arsenal, and Real Madrid.
#Video: Shot 1: Wide shot, caption "José Antonio Reyes" at the top, a dark sedan in side profile drives from left to right along a gray road with dashed white center lines, Reyes at the wheel with short dark hair and two relatives beside and behind him, a signpost reading "Utrera" at the left edge, a pale sun and a few clouds above. Sound: a car engine humming, tires on asphalt, wind rushing past the car. Shot 2: Tracking shot as the road lines scroll past dry scrubby roadside bushes toward a signpost reading "Sevilla."
#Narration: On June 1st, 2019, Reyes was traveling by car between Utrera and Seville, Spain, accompanied by his relatives Jonathan Reyes and Juan Manuel Calderón.
#Video: Shot 1: Medium shot, caption "José Antonio Reyes" at the top, still tracking the same dark sedan along the road toward Sevilla, the sedan speeds up and races with long white speed lines streaking behind it as a red-circled callout of a speedometer appears at the upper left, its red needle climbing to the far end, labeled "81 mph." Sound: an engine screaming at high revs. Shot 2: Push-in on a second callout at the lower right as a jagged red crack appears through the steering column and the tire below it wobbles with warning marks.
#Narration: The vehicle reported reaching speeds of 81 mph and had a steering and tire malfunction before the accident.
#Video: Shot 1: Low-angle shot of a gray road, caption "José Antonio Reyes" at the top, as the cracked steering callout fades and the same dark sedan, its tire still wobbling, swerves off its lane along a curved black motion arrow toward the shoulder. Sound: tires screeching. Shot 2: The car strikes a gray metal roadside barrier at the right, its front end crumpling inward, small black fragments flying outward as sharp white impact lines flash from the point of contact.
#Narration: While navigating the road, the vehicle veered off its lane and collided with the roadside barrier. The impact caused deformation of the cabin.
#Video: Shot 1: Medium shot, caption "José Antonio Reyes" at the top, holding on the same crash as the last fragments settle, flames erupt from the crumpled dark sedan against the bent gray barrier and spread rapidly over the roof and bonnet, small orange sparks scattering around the base. Sound: a whoomph of ignition, fire roaring close by, glass popping in the heat. Shot 2: Slow tilt up as thick gray smoke curls upward and fills the top of the frame while a scorched black patch spreads across the roadside gravel.
#Narration: Immediately following the collision, the car ignited, producing an intense fire that engulfed the vehicle within seconds.
#Video: Shot 1: Wide shot, caption "José Antonio Reyes" at the top, the blackened wreck sits against the barrier with its flames out and thin gray smoke rising, a red fire engine and a white ambulance with flashing blue lights at the left and two paramedics in green uniforms standing with heads lowered beside a stretcher carrying a figure under a red blanket. Sound: sirens winding down, embers hissing. Shot 2: Medium shot at the right as a paramedic wheels the stretcher toward the ambulance, the figure under the red blanket with one arm bandaged.
#Narration: Emergency responders arrived at the scene but found Reyes and Jonathan Reyes already deceased. Juan Manuel Calderón survived but suffered burns and fractures, hospitalized for treatment.
#Video: Shot 1: Medium shot, caption "José Antonio Reyes" at the top, a faded gray outline silhouette of José Antonio Reyes in his red shirt stands center above a flat gray band, an investigator in a dark jacket at the right holding a clipboard with his head lowered. Shot 2: Two red-circled callouts appear one after the other beside the fading silhouette, linked by red arrows: a side-view head with a dark red impact mark at the skull labeled "Head trauma," then an outline torso shaded with orange and black scorch marks labeled "Burns."
#Narration: Autopsy and crash reports indicated that José Antonio Reyes sustained severe head trauma and extensive burns which were fatal following the high-speed collision and subsequent fire.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Emiliano Sala until it fills the frame.
#Narration: Emiliano Sala.
#Video: Shot 1: Medium shot, caption "Emiliano Sala" at the top, Emiliano Sala with short dark hair and a broad smile, in a yellow shirt and green shorts with thin stick legs, one arm raised, climbs a staircase of three rising steps beside a white arrow climbing upward, on a flat bright green band. Sound: footsteps thudding up the steps. Shot 2: A small light blue and white Argentine flag pops in at the left and a small blue, white and red French flag at the right.
#Narration: Emiliano Sala, 28, was considered a footballer prodigy, having risen rapidly through the ranks in Argentina and France.
#Video: Shot 1: Medium shot, caption "Emiliano Sala" at the top, Sala holds up a blue shirt with both hands with a small smile, beside a blue club crest with a bird on it, as a club official in a dark suit shakes his hand from the left, above a flat gray band. Sound: camera shutters clicking. Shot 2: A large price tag on a string swings in at the right reading "£15M," circled in red.
#Narration: He was signed by Cardiff City for a club record transfer fee of approximately 15 million.
#Video: Shot 1: Medium shot, caption "Emiliano Sala" at the top, a doctor in a white coat holds a stethoscope to Sala's chest at the left as a check mark appears on a clipboard beside them. Sound: a pen ticking the clipboard. Shot 2: Pan right as Sala walks right with a duffel bag over his shoulder toward a map outline where a dashed white flight path draws itself in an arc from "Nantes" to "Cardiff," a small plane icon on the line, above a small calendar with "January 21st" circled.
#Narration: On January 19th, 2019, after completing a medical examination with Cardiff City, Sala returned to Nantes, France, intending to fly back to Cardiff on January 21st to join his new club's training sessions.
#Video: Shot 1: Wide shot on a dark navy night background with a scatter of white stars, caption "Emiliano Sala" at the top, a small single-engine light aircraft in side profile flies right above a wide band of dark choppy sea with white wave crests, tiny figures visible through its windows. Sound: a propeller engine droning, waves churning below. Shot 2: The plane flies into thick gray clouds near a small island outline labeled "Alderney," and the dashed white flight path trailing behind it breaks off abruptly, ending in a red question mark.
#Narration: On January 21st, 2019, Sala boarded a flight from Nantes to Cardiff. During that flight, the aircraft disappeared over the English Channel near Alderney.
#Video: Shot 1: Overhead wide shot of open sea in pale blue, caption "Emiliano Sala" at the top, as a large search grid of dashed squares draws itself square by square across it, labeled "4,400 km²," a small green and white police badge at the left and a calendar with three days circled at the upper right. Sound: waves rolling below. Shot 2: A helicopter sweeps across the grid with a searchlight cone while small boats move beneath it.
#Narration: Immediate search efforts were launched by the Guernsey police, covering approximately 4,400 km squared over 3 days, but no survivors were found.
#Video: Shot 1: Wide cross-section of blue sea, caption "Emiliano Sala" at the top, showing the surface and the water below as a small plane, a helicopter with spinning rotor lines and two boats appear one by one on the surface, each with a red-circled label. Sound: rotors thumping overhead, boat engines. Shot 2: Tilt down beneath the surface as a yellow remotely operated underwater vehicle descends with a bright searchlight cone, trailing a thin black tether up to one of the boats.
#Narration: Following this, private searches continued, employing multiple aircraft, helicopters, boats, and remotely operated underwater vehicles, ROVs.
#Video: Shot 1: Wide shot of a curved sandy coastline along the bottom of the frame, caption "Emiliano Sala" at the top and "January 30th" written in the corner, as blue waves wash in and pieces of debris appear on the sand one at a time: two pale rectangular seat cushions ringed in red, a torn strip of white panel, and small dark pieces, two figures in dark jackets walking along the sand at the right. Sound: waves washing onto sand, gulls crying. Shot 2: Medium shot at the right of the two figures in dark jackets crouching over the debris, one holding a clear evidence bag.
#Narration: On January 30th, debris from the aircraft, including seat cushions, were located along the French coast.
#Video: Shot 1: Wide cross-section of dark blue water, caption "Emiliano Sala" at the top and "February 3rd" written in the corner, a search vessel on the surface lowers a sonar unit that emits curved white sonar arcs pulsing outward and downward, a faint gray shape just visible on the seabed below. Sound: sonar pings echoing through water, electronics humming. Shot 2: Close-up of a sonar screen panel at the left as a green radar line sweeps around.
#Narration: A dedicated underwater search commenced on February 3rd using sonar equipment.
#Video: Shot 1: Wide shot on a dark blue underwater background, caption "Emiliano Sala" at the top, a small yellow ROV descends toward a gray seabed beside a vertical dashed depth scale at the left labeled "63 m / 205 ft," a label reading "Hurd's Deep" at the right and a clock face reading 21:00 above. Sound: muffled thrusters, bubbles rising. Shot 2: Push-in as the ROV's searchlight sweeps across the broken shape of a small aircraft partly settled into the sediment and a red circle rings the wreckage.
#Narration: At 2100 hours, the wreckage of the aircraft was located at a depth of 63 m or 205 ft in the northern Hurd's Deep.
#Video: Shot 1: Wide shot, caption "Emiliano Sala" at the top and "February 7th" written in the corner, a recovery vessel on gray water at the left extends a crane arm over the side, two crew members in orange jackets on its deck, its cable slowly lifting from the sea, a small harbor with a dock and a building labeled "Portland" at the right. Sound: a crane winch grinding, water lapping against the hull, gulls in the distance. Shot 2: Medium shot of a stretcher covered with a plain white sheet, shown simply and without detail, being lifted onto the deck as the two crew members on either side lower their heads.
#Narration: On February 7th, the body was recovered from the aircraft wreckage and transported to Portland for investigation.
#Video: Shot 1: Medium shot, caption "Emiliano Sala" at the top, a large red-circled fingerprint with looping black ridges sits center as a magnifying glass slides over it, a small badge labeled "Dorset Police" at the left and a police officer in a dark uniform holding a clipboard at the right. Sound: glass sliding over paper. Shot 2: Push-in as two small identical fingerprint cards on either side, linked to the center by red arrows, match up and a green check mark appears between them.
#Narration: The Dorset police later confirmed through fingerprint analysis that the body was Emiliano Sala.
#Video: Shot 1: Medium shot, caption "Emiliano Sala" at the top, a faded gray outline silhouette of Emiliano Sala in his yellow shirt stands center above a flat gray band as a report page with a red stamp appears at the left, "February 11th" written beneath it. Sound: a rubber stamp thudding onto paper. Shot 2: Two red-circled callouts appear one after the other, linked by red arrows: a side-view head with dark red impact marks labeled "Head trauma," then an outline torso with dark red impact marks across the chest labeled "Torso trauma."
#Narration: The post-mortem examination released on February 11th determined that Sala had died from trauma to the head and torso sustained in the crash.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Gary Speed until it fills the frame.
#Narration: Gary Speed.
#Video: Shot 1: Medium shot, caption "Gary Speed" at the top and "1969" written beside him, Gary Speed with short dark hair and a calm smile, in a white shirt with a captain's armband on his sleeve and dark shorts, thin stick legs, stands on a flat bright green band under a banner reading "500+ Premier League matches." Sound: a distant stadium crowd. Shot 2: Four club crests pop in one by one in a row around him, a white crest, a blue crest, a black-and-white striped crest and a red Welsh dragon, as Speed smiles.
#Narration: Gary Speed, born in 1969, was a legendary Welsh midfielder who played over 500 Premier League matches and captained Leeds United, Everton, Newcastle United, and the Wales national team.
#Video: Shot 1: Wide shot, caption "Gary Speed" at the top, Gary Speed stands on the touchline in a dark suit and tie, arms folded, a small serious smile, beside a tactics whiteboard on a stand, a row of empty dugout seats behind him and a red Welsh dragon flag waving on a small pole at the left, above a green band with a white touchline. Sound: a flag flapping in the wind. Shot 2: Close-up on the tactics board as arrows and circles draw themselves across it.
#Narration: After retiring from professional football, he became the head coach of the Wales national team.
#Video: Shot 1: Medium shot, caption "Gary Speed" at the top, Gary Speed in a dark suit sits on a studio sofa under a TV camera on a tripod as the camera's light blinks on, a small studio light above and a panel behind him reading "BBC One." Sound: studio air conditioning humming. Shot 2: Wide shot as a dark car drives along a road toward a small house with a pitched roof and a closed garage door, labeled "Huntington, Cheshire," while a low orange evening sun sets beside a small clock face reading 5:00.
#Narration: On November 26th, 2011, Speed appeared as a guest on the BBC's One's Football Focus. Later that day, at around 5:00 p.m., he drove home to his residence in Huntington, Cheshire, England.
#Video: Shot 1: Wide shot at dawn under a gray sky, caption "Gary Speed" at the top, the exterior of the house with a closed gray garage door large in the middle of the frame, a small clock face reading just before 7:00 at the upper right, Louise standing small before the garage with her back to the camera. Sound: early morning birds, a gentle breeze. Shot 2: Medium shot from behind Louise, long loose hair, a dressing gown, shoulders drawn tense, as she puts one hand on the door, the handle turns and the door begins to lift, the frame holding on Louise from behind with no interior visible.
#Narration: The following morning, just before 7 a.m. on November 27th, 2011, Speed's wife, Louise, opened the door to the garage and she found her husband hanging.
#Video: Shot 1: Medium side shot, caption "Gary Speed" at the top, Louise kneels on a gray driveway with her hair loose, a phone pressed to her ear, her free hand raised to her mouth, small blue teardrop marks at her cheeks and shaky motion lines around her trembling shoulders. Sound: ragged breathing, a phone line ringing. Shot 2: Push-in on a small red-circled emergency call icon pulsing beside the phone, the gray house behind her with the open garage shown as a plain dark rectangle with no detail inside.
#Narration: Shocked and trembling, she called emergency services immediately.
#Video: Shot 1: Medium shot, caption "Gary Speed" at the top, Louise kneels on a gray floor, a phone set down beside her on speaker with small sound arcs pulsing from it, both hands reaching desperately toward a plain gray sheet-covered shape on the ground beside her, shown without any detail, brow raised, teardrop marks at her cheeks. Sound: a phone speaker crackling, a clock ticking loudly. Shot 2: Close-up of a clock face at the right, its second hand sweeping.
#Narration: Following the guidance of the rescue operator, she cut Gary down, letting his body fall to the floor as she desperately tried to help him while waiting for paramedics.
#Video: Shot 1: Wide shot, caption "Gary Speed" at the top, a white ambulance arrives on the driveway at the left with blue lights flashing and back doors open, two paramedics in green uniforms climbing out, a small clock labeled "20 minutes" above. Sound: a siren cutting off, ambulance doors swinging open. Shot 2: Medium shot of the two paramedics kneeling on a gray floor over a plain gray sheet-covered shape shown without detail, one with hands positioned for compressions, the other holding a bag valve mask. Sound: rhythmic compressions, a bag valve mask squeezing. Shot 3: Pan right as two red-circled callouts appear: a ticking stopwatch labeled "8 minutes," and a thermometer with a blue bulb labeled "Pale and cold."
#Narration: An ambulance crew arrived within 8 minutes. One paramedic later told the inquest that Speed was pale and cold when they reached him, but the team still attempted resuscitation for 20 minutes.
#Video: Shot 1: Medium shot, caption "Gary Speed" at the top, two paramedics in green uniforms at the left lower their heads, hands at their sides, a folded gray sheet beside them, the edge of a courtroom bench at the right with a coroner in a dark robe seated behind it. Shot 2: Pan right to the courtroom bench and the coroner, a gavel and a stack of papers in front of them, labeled "Inquest — January 30th, 2012." Sound: papers shuffling. Shot 3: Two red-circled callouts appear between them, linked by red arrows: a tangle of dark lines labeled "Pressure," and two small figures turned away from each other.
#Narration: Despite their efforts, there was no response. On January 30th, 2012, an inquest heard that the pressure of the management had put some strain on his marriage and that he and Louise had argued the night before his death.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Suleiman al-Obeid until it fills the frame.
#Narration: Suleiman al-Obeid.
#Video: Shot 1: Medium shot, caption "Suleiman al-Obeid" at the top and "1984" written beside him, Suleiman al-Obeid with short dark hair, a trimmed beard and a warm smile, in a blue shirt with a white number 10 and white shorts, thin stick legs, stands with a football at his feet on a flat bright green band, a small black, white, green and red Palestinian flag waving at the left. Sound: a flag flapping. Shot 2: Push-in on a scoreboard at the right as its counter climbs to "100+ GOALS."
#Narration: Suleiman al-Obeid was born in 1984 and was a great footballer in Gaza. Over his career, he scored more than 100 goals at the club level and on the national team.
#Video: Shot 1: Medium shot, caption "Suleiman al-Obeid" at the top, al-Obeid in his blue number 10 shirt stands with arms out on a flat bright green band as a small crowd of children and fans gathers around him with raised arms and beaming faces, several holding small Palestinian flags. Sound: children cheering, small flags fluttering. Shot 2: Tilt up as a banner unfurls above him reading "The Palestinian Pelé," circled in red.
#Narration: To Palestinian fans, he wasn't just a footballer. He was the Palestinian Pelé.
#Video: Shot 1: Wide shot under a pale gray sky with dust drifting across the frame, caption "Suleiman al-Obeid" at the top, a row of damaged buildings with missing walls and jagged roof edges, gray rubble piled at their bases. Sound: wind blowing dust, loose debris settling, a loose power line creaking in the wind. Shot 2: Pan across a water pipe and a snapped power line hanging loose at the left and an empty market stall with bare shelves at the right, as red X marks appear one by one over the pipe and a crate.
#Narration: Due to the ongoing war which had devastated infrastructure and cut off regular supplies.
#Video: Shot 1: Wide shot with dust drifting, caption "Suleiman al-Obeid" at the top and "August 6th, 2025 — southern Gaza" written in the corner, a long winding line of civilians carrying empty containers and bags stretches from the foreground back toward the horizon, al-Obeid among them near the front. Sound: shuffling feet, containers knocking together, wind, a tarp flapping. Shot 2: Medium shot of al-Obeid near the front of the line with his trimmed beard, standing patiently, an aid pallet stacked with white sacks under a tarp and a red cross on a small crate at the right.
#Narration: On August 6th, 2025, al-Obeid stood in a long line of civilians in southern Gaza waiting for a rare delivery of humanitarian aid.
#Video: Shot 1: Pulling back from al-Obeid waiting near the front of the line to a wide shot from a distance of the aid distribution point, caption "Suleiman al-Obeid" at the top, the pallet and tarp on one side and the line of civilians with al-Obeid in it, as sharp white burst lines and jagged on-screen text reading "CRACK" flash across the upper frame. Sound: a loud crack echoing, then a burst of gunfire in the distance. Shot 2: The crowd scatters outward, some dropping flat to the ground with arms over their heads, others running left and right with dust puffs at their feet, the frame staying on the crowd.
#Narration: A loud crack echoed across the aid distribution point followed by a burst of gunfire. People dropped to the ground or ran for cover.
#Video: Shot 1: Pushing in from the same scattering crowd to a medium shot with dust drifting across the frame, caption "Suleiman al-Obeid" at the top, three faint overlapping stages of al-Obeid fade in one after the other: upright with a small red mark at his chest ringed in red, then staggering with one hand reaching out, then lowered to the ground, two figures crouching low in the dust at the right edge. Sound: a distant gunshot, a body falling onto dirt. Shot 2: The two figures crouch beside him, hands under his arms, and pull him toward an aid pallet at the right that serves as cover.
#Narration: A moment later, al-Obeid was struck by a bullet to the chest. He staggered, tried to stay upright, then collapsed as others pulled him behind an aid pallet.
#Video: Shot 1: Wide shot, caption "Suleiman al-Obeid" at the top, a white ambulance stalled at a distance behind a mound of gray rubble and a broken road at the left, its blue light dim, as a red X draws itself across the path in front of it, a small group of figures kneeling far off at the right. Sound: an idling engine, a siren far away, wind. Shot 2: Pan right to the small group of figures kneeling with heads lowered around a still figure on the ground beside the aid pallet, a clock face between them with its hands turning, labeled "Minutes."
#Narration: With ambulances unable to reach the site immediately, al-Obeid succumbed within minutes.
#Video: Shot 1: Medium shot with a faint warm glow, caption "Suleiman al-Obeid" at the top, a faded gray outline of al-Obeid stands with both arms spread wide as if shielding, as several smaller figures gather behind him in his shadow and a red-circled callout points to his outstretched arms. Sound: shuffling footsteps gathering close, soft wind. Shot 2: Wider shot of the gathered figures around him with hands over their hearts as the outline slowly fades above a flat gray band.
#Narration: People who recognized him later said he was trying to shield others in the crowd moments before he collapsed.
#Video: Shot 1: Wide shot of a grid of framed footballer portraits on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow, then a smooth zoom into the portrait of Peter Biaksangzuala until it fills the frame.
#Narration: Peter Biaksangzuala.
#Video: Shot 1: Medium shot, caption "Peter Biaksangzuala" at the top and "23 years old" written beside him, Peter Biaksangzuala with short black hair and a bright grin, in a blue and yellow shirt and blue shorts with thin stick legs, taps a football under one foot on a flat bright green band. Sound: a ball being tapped. Shot 2: A map outline of northeast India with a small shaded region labeled "Mizoram" and a small orange, white and green Indian flag pops in at the right, and a club crest labeled "Bethlehem Vengthlang FC" pops in at the left.
#Narration: Peter Biaksangzuala was a 23-year-old midfielder from Mizoram, India. Regarded as one of the region's most promising young players, he played for Bethlehem Vengthlang FC in the Mizoram Premier League.
#Video: Shot 1: Medium shot, caption "Peter Biaksangzuala" at the top and "October 14th, 2014" written in the corner, a football flies along white motion lines into the back of a white goal net above a bright green band with a white goal line, Peter watching from the left. Sound: a ball swishing into the net. Shot 2: Peter in a blue and yellow shirt throws both arms up, mouth open in a shout, as a scoreboard at the right flips level to "1 – 1."
#Narration: On October 14th, 2014, during a league match against Chanmari West FC, he scored an equalizing goal.
#Video: Shot 1: Tracking shot, caption "Peter Biaksangzuala" at the top, Peter drops his raised arms from the same shout beside the flipped scoreboard and sprints right toward a corner flag with arms pumping and a big grin, motion lines behind him, on a bright green band with a white corner arc, a small red-circled inset at the upper right of a player mid-somersault labeled "Miroslav Klose." Sound: studs pounding on grass, a crowd roaring in the distance. Shot 2: A curved white dashed arc draws itself up and over from his feet showing the somersault he intends, beside the Klose inset.
#Narration: Immediately after the ball crossed the line, he ran towards the corner flag and attempted a celebratory somersault inspired by German striker Miroslav Klose.
#Video: Shot 1: Medium shot, caption "Peter Biaksangzuala" at the top, on the same stretch of turf by the corner flag as the dashed arc and the Klose inset fade, three faint overlapping stages of Peter: launching into the somersault, rotating short as the arc breaks off in red, then landing head-first on the green turf as sharp white impact lines flash at the point of contact. Sound: a heavy thud on turf, a crowd gasping. Shot 2: Push-in on Peter lying motionless on the grass, eyes closed, as a red-circled callout points to a small jagged mark at his neck.
#Narration: His rotation was miscalculated and he landed head first on the turf. The impact caused his neck to buckle sharply and he collapsed without getting back up.
#Video: Shot 1: Medium shot, caption "Peter Biaksangzuala" at the top, pulling back from Peter lying motionless on the green turf as the neck callout fades, eyes closed, arms at his sides, one teammate in a blue and yellow shirt kneeling beside him with a worried brow while two others stand and wave both arms urgently toward the touchline, where two medics in white wait with a stretcher. Sound: studs shuffling on grass. Shot 2: Pan right as the two medics run onto the pitch carrying the stretcher.
#Narration: Teammates quickly signaled for medical assistance as he lay motionless.
#Video: Shot 1: Medium shot of a hospital room with an olive-green wall and white floor, caption "Peter Biaksangzuala" at the top, Peter lies flat on a white bed at the left in a white neck brace, eyes closed, as a doctor in a white coat over blue scrubs appears at the right, stethoscope around the neck, holding a scan film and raising one arm. Sound: a monitor beeping, a scan film rattling. Shot 2: Push-in on a large pink cross-section diagram of the upper spine and skull appearing in the center, labeled "Cervical spine," as jagged dark red cracks appear on the top vertebrae and a red-shaded band shows through the cord.
#Narration: He was transported to a nearby hospital where doctors diagnosed a critical cervical spine injury. Scans revealed fractures to the upper cervical vertebrae and severe spinal cord trauma.
#Video: Shot 1: Wide shot of an intensive care room with an olive-green wall, white floor and a curtain at the left, caption "Peter Biaksangzuala" at the top, Peter lies in a white bed, eyes closed, in a white neck brace, a ventilator tube taped at his mouth running to a boxy gray machine with small dials and a green display that cycles beside the bed, a nurse standing at the right. Sound: a ventilator hissing and clicking rhythmically, steady monitor beeps. Shot 2: Medium shot of the nurse in a blue mask and blue scrubs at the right watching closely with a clipboard, as a dark monitor above traces a green ECG line and a second wavy blue line.
#Narration: He was placed in an intensive care unit supported by mechanical ventilation and continuous neurological observation.
#Video: Shot 1: Medium shot of a hospital room, caption "Peter Biaksangzuala" at the top, Peter lies in a white bed with a neck brace and ventilator tube, eyes closed, as a red-circled callout of a surgical tray with a scalpel and small metal plates and screws appears at the upper left, labeled "Stabilization," then a spine diagram with a black flat line running down it at the upper right, labeled "No response." Sound: a ventilator hissing, surgical instruments clinking. Shot 2: Pan right to a wall calendar as five days are crossed out one by one in black marker.
#Narration: Despite emergency treatment, including surgical stabilization, his neurological condition did not improve. Over the next five days, complications related to respiratory failure and spinal cord damage persisted.
#Video: Shot 1: Medium shot of a hospital room, caption "Peter Biaksangzuala" at the top, Peter lies in a white bed, eyes closed, a doctor and a nurse standing at the foot of the bed with heads lowered, a dark monitor above showing a shallow, weakening green line. Sound: slowing monitor beeps. Shot 2: Two red-circled callouts appear one after the other, linked by red arrows: a hand and foot with a black X over each and a small reflex hammer beside them, labeled "No motor function," then a spine and nerve diagram with a black X.
#Narration: Medical staff reported no recovery of motor function or reflexes.
#Video: Shot 1: Medium shot of a hospital room, caption "Peter Biaksangzuala" at the top and "October 19th, 2014. 23 years old." written in the corner, Peter lies in a white bed at the left with a peaceful expression, eyes closed, a gray blanket pulled up over him against a white pillow, as a dark monitor at the right shows a green ECG line growing progressively flatter until it goes flat. Sound: monitor beeps slowing into a single flat tone, a quiet room hum. Shot 2: Slow tilt down to a blue and yellow shirt folded neatly on a chair with a football beside it, the frame holding there.
#Narration: On October 19th, 2014, he was pronounced dead due to cervical spinal cord injury and resulting systemic complications.
#Video: Shot 1: Wide shot, a grid of framed footballer portraits appears one by one on an off-white background, thick black borders with soft drop shadows, each name written below its portrait: Diego Maradona in Argentina stripes, Diogo Jota in a red shirt, Pelé in Brazil's cream-and-green collar, José Antonio Reyes in red, Emiliano Sala in Nantes yellow, Gary Speed in a dark suit and tie, Suleiman al-Obeid in blue with number 10, Peter Biaksangzuala in blue-and-yellow. Shot 2: Tilt down below the grid to a red subscribe button as a cursor arrow hovers over it and clicks, and a small speech bubble pops in reading "Which story next?"
#Narration: If you like this video, don't forget to subscribe and tell me which story you want next. Thanks for watching and see you in the next one.`,
	},
	{
		id: "stick-explainer",
		length: "5-10m",
		name: "Stick Explainer",
		promptPrefix: "Stickman explainer about",
		color: "#AA8AB1",
		style: {
			description:
				"Hand-drawn digital doodle illustration, thick uneven black ink outlines, flat solid color fills with slight sketchy shading, minimal detail, chibi big-head figures with simple stick limbs, plain flat background with a single horizon line, muted primary palette, white banner with handwritten marker-style caption at top, whiteboard-animation aesthetic. Thick black outlines, flat color, deliberately crude.",
		},
		referenceImages: [
			templateAsset("stick-explainer-1"),
			templateAsset("stick-explainer-2"),
			templateAsset("stick-explainer-3"),
		],
		narration: {
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
		- Write the script as if writing a Stickman-style explainer video about the topic in the user prompt
		- Make every visual a <video> element
		`,
		exampleText: dedent`#Video: Shot 1: Medium shot, a YouTuber in a hoodie holds up a chunky phone with a fat button reading "CREATE" and a sparkle on it, as a giant soup ladle pokes out through the phone screen. Sound: a wet slurp as the ladle emerges. Shot 2: Wide shot as the ladle scoops and dumps lumpy gray-green stew into a pig trough on the floor shaped like a red play button, the trough filling while the YouTuber pinches their nose with their free hand and their cheeks puff out.

#Narration: There is now an AI slop generator built into the YouTube Create app, allowing YouTubers to generate AI slop for YouTube, on YouTube.

#Video: Shot 1: Wide shot, a wobbling gray-green blob with a sparkle on it stands on a small stage between two crowds, viewers holding popcorn on the left and creators holding cameras and microphones on the right, both throwing tomatoes. Sound: tomatoes splatting, a crowd booing. Shot 2: Push-in as the blob flinches under the barrage and a scoreboard above the stage reading "LIKES 3" spins its "DISLIKES 9,000,000" counter upward.

#Narration: This is despite the fact that AI generated media is almost universally despised by viewers and creators alike.

#Video: Shot 1: Medium shot, a laptop with an old-fashioned hand-crank meat grinder bolted to the top of the screen and a sticky note on it reading "make them argue about AI," the host standing beside it holding two of his own characters. Shot 2: Slow push-in as the host — round head, small glasses, gray t-shirt — drops the two characters into the hopper, one in a yellow shirt and one in purple, both waving their little arms in alarm, and the crank starts turning.

#Narration: I gave the app two of my characters and asked it to make a video of them arguing about whether AI is good for humanity.

#Video: Shot 1: Medium shot, the crank still turning on the same laptop meat grinder beside the host, the two characters come out the other side badly wrong: the yellow one has seven fingers on a raised hand and a mouth that has slid onto its cheek, the purple one's face is melting off its head like warm ice cream while it gestures confidently, and their shirts have swapped colors halfway down. Sound: a wet dripping. Shot 2: Close-up as their faces melt and re-form, extra fingers sprout, and caption text across the bottom reading "AI IS DANGERUOS" in wobbly misspelled letters glitches mid-word.

#Narration: AI is dangerous and will be the end of us. Nonsense, it is the evolution of humanity. But the risks — the benefits are limitless. Maybe you're right. Okay, cool.

#Video: Shot 1: Medium shot, static, the host slumps low in a desk chair, mouth a flat line, gives a single slow thumbs-down at the laptop and blinks once, very slowly. Sound: the desk chair creaking, faint sand trickling. Shot 2: Close-up on the desk beside him, sand trickling through an hourglass labeled "JOB SECURITY" with only a few grains left in the top bulb, next to a torn-off calendar page.

#Narration: That was absolutely terrible, and my job is safe for another few months.

#Video: Shot 1: Wide shot, a browser window crammed edge to edge with fat colorful buttons, each stamped with a sparkle, as new sparkle buttons pop in and shove the video player down to a postage-stamp rectangle in the bottom corner, a tiny user standing in front of it. Sound: rapid bubbly pops. Shot 2: Slow push-in on the tiny user leaning in to squint at the video through a magnifying glass while buttons spill out of the window frame and pile up on the floor.

#Narration: Still, YouTube is overflowing with AI features that nobody asked for.

#Video: Shot 1: Medium shot, a creator feeds their old videos into the coin slot on the side of a tall vending machine labeled "INSPIRATION." Sound: a coin-slot whir and clunk. Shot 2: Slow tilt down to the dispensing tray as identical thumbnails of the same crude shocked open-mouthed face with a red arrow and a red circle tumble out over and over, piling up until the creator is knee-deep in duplicates.

#Narration: The inspiration tab, for example, automatically generates new video ideas and thumbnails based on your previous content.

#Video: Shot 1: Wide shot, slow pan along a factory conveyor belt with three stations: a sparkle-covered machine, a creator sitting at a keyboard typing prompts, and an "UPLOAD" chute. Sound: a conveyor belt rattling, keyboard keys clacking. Shot 2: A giant hand reaches down from the top of the frame, plucks the creator out like a Jenga block and drops them into a bin marked "MIDDLEMEN." Sound: a thump into the bin. Shot 3: The two machines slide together to close the gap and the belt speeds up without missing a beat.

#Narration: It seems inevitable that YouTube will eventually cut out the middleman and just generate these videos themselves, without having a human creator write the prompts.

#Video: Shot 1: Medium shot, a red play-button box wearing an apron cuts a big round cake with a knife and slides the larger slice, marked "55%," across the frame to a creator. Sound: a knife slicing through sponge, a plate sliding. Shot 2: Wide shot as the creator spends it, the slice turning into a tripod, a light and a microphone in a small arrow-loop that spins back around to a fresh cake, while the play button keeps the smaller slice on its own plate.

#Narration: YouTube currently gives 55% of the ad revenue earned by long-form videos back to creators, which encourages and funds the production of new content.

#Video: Shot 1: Medium shot, the same cake beside the creator's empty chair with a dotted outline where they used to be, as the play-button box swallows the entire cake in one enormous bite, cheeks bulging. Sound: a huge wet gulp. Shot 2: Slow pan to a long low server building with a chimney behind it, where a small fork of cake is shoveled into a furnace door labeled "GPUs" that flares up, and an electricity meter on the wall spins so fast it blurs.

#Narration: Replacing human creators with an internal AI slop generator would allow YouTube to keep 100% of that revenue, minus the cost of running the slop generator in a data center.

#Video: Shot 1: Medium shot, a viewer sits at a dinner table wearing a bib, cutlery in both fists, delighted, as a waiter — the red play-button box in a little bow tie — serves a proper burger. Sound: a plate set down on the table. Shot 2: Static shot as the plates are swapped in one after another, each worse, a burger with a sparkle stuck in it and then a plain bowl of gray-green mush, while the viewer beams identically at every one.

#Narration: If they can get viewers comfortable consuming AI slop, they can eventually make the jump to generating it themselves and keep 100% of the platform's ad revenue.

#Video: Shot 1: Medium shot, an executive in a boxy navy suit at a whiteboard writes an equation stroke by stroke with a marker: a small drawing of a human creator, a minus sign, then a fat green arrow going up and a bag of money, four more suits seated at a table behind him. Sound: a marker squeaking on the whiteboard. Shot 2: Wide shot, the four suits sit at the table with eyes closed, nodding in perfect unison.

#Narration: On the surface, this seems to make rational business sense.

#Video: Shot 1: Wide shot, slow push-in on a gray dystopian street under a flat overcast sky, enormous screens on every building flickering in unison with the same gray-green blob, rows of identical figures in matching jumpsuits staring upward with blank flat-line mouths, one small figure sitting apart on a curb. Sound: an electric buzz from the screens echoing off buildings. Shot 2: Medium shot of a monument shaped like a red play button in the center of the square as a thick black crack creeps up its plinth. Sound: stone cracking. Shot 3: Close-up of the small figure on the curb with a sketchpad, drawing, ignored, who looks up.

#Narration: However, I believe that not only is YouTube's decision to embrace AI dystopian and morally wrong, it could completely destroy them as a business.

#Video: Shot 1: Medium shot, three viewers on a couch lick their bowls completely clean, one with a gray-green mustache of slop across their face holding the bowl out for seconds with enormous pleading eyes, the host just visible at the edge of the frame. Sound: loud slurping and licking. Shot 2: Wide shot revealing a crossed-out drawing of a nauseated viewer with a big red X over it beside the couch, and the host in the corner of the frame with a hand over his face, shoulders sagging.

#Narration: Not because people will get sick of watching AI slop. In fact, I think YouTube will probably have the opposite problem.

#Video: Shot 1: Wide shot, the red play-button box lounges on a wooden throne in a lopsided gold crown, one leg over the armrest, not even looking up, as three small rival boxes gather at the foot of the throne. Shot 2: At the foot of the throne, the three small rival boxes charge and comically fail: one with a music note swings a bent sword, one with a black X charges at the wrong wall, and one with a blue f gets its head stuck in a bucket.

#Narration: Right now, YouTube is the undisputed king of user-generated long-form video, despite the best efforts of TikTok, X and Facebook to dethrone them.

#Video: Shot 1: Aerial wide shot of a packed stadium, every seat filled with tiny bouncing heads, a banner across the stands reading "2 BILLION." Sound: a roaring crowd applauding. Shot 2: A dump truck labeled "20 MILLION A DAY" backs up to the edge of the pitch and tilts its bed, tipping a landslide of video rectangles onto the field.

#Narration: YouTube has over 2 billion logged-in monthly users, and over 20 million videos are uploaded to the platform every day.

#Video: Shot 1: Wide shot, creators with cameras stand around a playground roundabout pushing it while viewers with phones sit on it riding, the red play-button box sitting at the hub, a thick arrow looping from the pushers to the riders and back. Sound: metal creaking, sneakers scuffing on gravel. Shot 2: Push-in to the hub as the roundabout spins faster and faster and the red play-button box sits dead center with its eyes closed and arms folded, dozing.

#Narration: If you're a creator making long-form videos, you put them on YouTube because that's where all the viewers are. And if you're a viewer, you watch stuff on YouTube because that's where all the creators are.

#Video: Shot 1: Wide shot, a brand-new empty theater with a fresh "OPENING NIGHT" banner, a single hopeful creator performing on stage to rows of empty seats as a tumbleweed rolls through the aisle and the spotlight shrinks, a crowd of viewers passing outside the glass doors at the back. Sound: footsteps echoing on the stage, a tumbleweed scraping, muffled footsteps passing outside. Shot 2: Slow pan to the glass doors, where the crowd of viewers glances in, shrugs, and walks past toward a glow off-frame.

#Narration: It's almost impossible for a new platform to break into this market, because they need viewers to attract creators, and they need creators to attract viewers.

#Video: Shot 1: Medium shot inside a warm banquet hall crammed with food, the play-button king sits at a groaning table surrounded by creators and viewers eating happily, steam rising off the feast, a brass plaque over the door reading "COMPETITIVE ADVANTAGE," three scrawny rival boxes peering in through the window at the back. Sound: cutlery clinking, cheerful chewing. Shot 2: Reverse shot from outside the window, the three scrawny rival boxes with ribs showing through their cardboard sides press their faces to the glass holding empty bowls, faces slowly sliding down.

#Narration: YouTube already has both, allowing them to starve out any new competition. In my opinion, this is YouTube's primary competitive advantage.

#Video: Shot 1: Close-up of a phone screen, a grifter in wraparound sunglasses lurking at its right edge, scrolling a grid of nine thumbnails, eight featureless gray-green blobs with sparkles with "90%" scrawled across them in red marker, and one small human face looking nervous. Sound: soft scrolling ticks. Shot 2: Wider shot revealing the grifter in wraparound sunglasses off to the right, whistling as he shovels more blobs into the grid with a spade until the last human thumbnail is shoveled over.

#Narration: Now imagine a future where 90% of the content you watch on YouTube is AI slop generated by the platform itself, or by low-effort grifters.

#Video: Shot 1: Medium shot, static, two identical bowls of gray-green mush sit side by side on a counter, the left price card reading "+ 6 ADS" and the right reading "NO ADS, HAS FRIENDS" with a little heart and a chat bubble drawn on it, a viewer waiting just off to the left. Shot 2: Tracking shot as the viewer strolls in with hands in pockets, whistling, glances left, glances right, and walks to the right bowl without breaking stride.

#Narration: If another app came along offering the same slop but with fewer ads or better social features, why not make the switch? What keeps users on YouTube in the age of slop?

#Video: Shot 1: Medium shot, the play-button king stands at a control panel with one finger resting on a big red button labeled "REPLACE THE CREATORS," looking pleased with himself, a much larger button labeled "REPLACE YOUTUBE" directly behind him. Sound: a button click. Shot 2: Slow push-in as an enormous hand lowers from off-frame toward the big button, the king's smile freezing and a sweat drop swelling on his face.

#Narration: If human creators can be replaced, YouTube can be replaced.

#Video: Shot 1: Medium shot, a white box with a swirl on it wobbles on a stepladder behind the throne, reaching up to lift the crown off the sleeping king's head, fingertips almost touching it. Sound: the ladder creaking, a soft snore. Shot 2: Close-up of its other hand holding a phone showing an endless vertical feed of blobs, thumb mid-swipe.

#Narration: OpenAI has already shown their willingness to take on YouTube and TikTok with their app Sora, which lets users generate AI slop and scroll through the slop that other people have generated.

#Video: Shot 1: Pulling back from the swirl box's phone mid-swipe to a medium shot of the same stepladder scene, the host steps into his own drawing and slams a big hand-lettered card reading "SCRATCH THAT" down over it, the swirl box still poking out from behind the card. Sound: a card slapping down. Shot 2: Wide shot of the scene behind the card: the ladder has collapsed, the swirl box yanks its own power cord out of the wall with the plug popping out, a small headstone reads "SORA," and a receipt unspools endlessly from a cash register out of the frame.

#Narration: Wait, no — scratch that. While I was editing this video, OpenAI announced that they're actually shutting down Sora, presumably because it was a massively unprofitable waste of computing power.

#Video: Shot 1: Wide shot, a small graveside gathering of tech-company boxes in black ties around the "SORA" headstone, heads bowing, pens scribbling in tiny notepads in unison. Sound: pens scratching, wind across the grass. Shot 2: Close-up of a notepad page reading "TRY AGAIN, BUT BIGGER" as one box already looks up hungrily.

#Narration: Hopefully, other AI companies will learn a lesson from that. But it won't just be AI giants coming for YouTube's throne.

#Video: Shot 1: Wide shot, a cookie factory with a bolted-on new wing covered in sparkles, as an executive shovels bundles of cash into a hopper labeled "$40 MILLION," a small TV set and an accountant on a stool at the other end. Sound: a shovel scraping, cash thumping into the hopper, machinery churning. Shot 2: Medium shot of the small TV set playing an advert on loop in which a gray-green blob lovingly holds a round sandwich cookie, while below it the accountant sits on the stool quietly crying into a ledger, tears pooling.

#Narration: Oreo's parent company, Mondelez International, has already spent over $40 million developing their own AI video generator, which they plan to use to pump out slop TV advertisements.

#Video: Shot 1: Wide shot, slow pan across an open-plan office where all the employees are candy: a gumdrop in a tiny headset nodding at its screen, a lollipop with a face spinning in an ergonomic chair, a candy cane pointing at a monitor, under a wall poster reading "SYNERGY." Sound: an office chair squeaking as it spins, keyboards tapping. Shot 2: Close-up of a monitor as a rendering progress bar fills beside a gray-green blob.

#Narration: Even candy companies can now build their own AI slop generators.

#Video: Shot 1: Wide shot, a downhill slope built from descending price tags, each crossed out and rewritten smaller than the last, tags dropping away as a swarm of tiny startup go-karts careens down it toward the play-button castle at the bottom. Sound: go-kart engines buzzing, tags flapping as they fall. Shot 2: Tracking shot alongside the go-karts as they accelerate, each flying a little flag reading "BETTER FEED," "BETTER SLOP," or "FEWER ADS."

#Narration: As video generation models get cheaper and more efficient, smaller and smaller startups will be able to make a play for YouTube's market share, competing to offer the best features, the best recommendations, and the best slop.

#Video: Shot 1: Medium shot, the play-button king sits cheerfully on a thick tree branch, sawing through it with a handsaw on the trunk side of himself, sawdust puffing as the branch begins to bow, a viewer standing below the branch. Sound: a handsaw rasping back and forth, wood creaking. Shot 2: Tilt down as he leans to hand a pamphlet reading "SLOP IS FINE!" to the viewer standing below, who reads it and nods.

#Narration: By teaching their viewers that watching slop is okay and creators don't need to be human, YouTube is destroying their own competitive advantage.

#Video: Shot 1: Wide shot, the castle drawbridge is down over a dry cracked moat as a parade of rival boxes strolls straight in wheeling suitcases, one checking a map, while the play-button king waves a tiny white handkerchief on the battlements, the host in the bottom corner of the frame. Sound: suitcase wheels rattling over wooden planks. Shot 2: Close-up of the host in the bottom corner giving a sarcastic double thumbs-up straight at the camera, one eyebrow raising.

#Narration: Without the protective factor of their massive pool of human creators, YouTube is going to face meaningful competition for the first time in decades. Good luck with that.

#Video: Shot 1: Wide shot, a huge empty stadium with every seat vacant and confetti drifting down anyway, the play-button king alone at center field holding up a solid green pie chart marked "100%," grinning at nobody, a crow perched on the goalpost. Sound: wind echoing through empty stands. Shot 2: Medium shot as a "100%" balloon tied to his wrist quietly deflates and the crow on the goalpost takes off.

#Narration: And sure, in a slop-based future, they will get to keep 100% of their ad revenue — but only if there's anyone left watching.

#Video: Shot 1: Wide shot, a vast gray-green sea of mush slowly heaving in thick wobbly ridges, thousands of identical blobs bobbing all the way to the horizon, a creator in a little rowboat rocking among them. Sound: thick mush sloshing, the boat creaking. Shot 2: Medium shot, the creator in the little rocking rowboat holds a camera in one hand and a fishing rod labeled "VIEWS" in the other, the empty hook swinging above the surface.

#Narration: AI content generation is obviously terrible for human YouTubers, who will have to compete for views with an ocean of slop.

#Video: Shot 1: Wide shot, pulling back from the creator's little rocking rowboat and empty swinging hook to reveal the same mush sea, wider, as a corporate tower with a red play button on its roof settles deeper, sunk up to the third floor and tilting, four executives in boxy suits standing on its roof. Sound: steel groaning, mush gurgling. Shot 2: Medium shot on the roof, the four executives hold briefcases and carry on a meeting, one pointing at a flipchart whose green arrow keeps climbing.

#Narration: But in the long term, it's also potentially catastrophic for YouTube, the company.

#Video: Shot 1: Slow push-in on a gilded picture frame holding a warm, sunlit alternate universe: the play-button king in a beret respectfully hands a paintbrush to a human artist on a pedestal beneath a banner reading "MADE BY HUMANS," a torch-and-pitchfork mob and a gray-green blob at the edge of town behind them. Shot 2: Inside the frame, the torch-and-pitchfork mob chases the gray-green blob out of town and off the edge of the frame.

#Narration: One obvious solution to all this would be for YouTube to viciously suppress AI content on their platform, inflame the existing slop hatred among viewers, and encourage them to celebrate human-made art instead.

#Video: Shot 1: Pulling back from the gilded frame as the mob runs off its edge to a medium shot, the host has fallen off his chair laughing, legs in the air, one hand slapping the floor, "HA HA HA" scrawled beside him, while behind him the gilded frame is crumpled into a ball and dropped into a wastebasket. Sound: a hand slapping the floor, paper crumpling, a thunk into the bin. Shot 2: Hard cut to the host upright, perfectly still and dead-eyed, staring straight ahead.

#Narration: Ha ha ha. Yeah, they're not going to do that.

#Video: Shot 1: Wide shot, a boardroom whiteboard where drawings from this video appear one by one, the sinking tower, the dry moat and the empty stadium, each sketched out and dated, the executives seated at the table below it. Sound: a marker squeaking. Shot 2: Slow pan along the table as the executives ignore it, one yawning enormously, one checking a watch, one eating a sandwich, and one with this exact video playing at 2x speed on a laptop he isn't looking at.

#Narration: Nothing I've said in this video is new information to the higher-ups at YouTube.

#Video: Shot 1: Medium shot, a viewer tipped back in a chair with a giant funnel in their mouth, held by the play-button box at the edge of the frame, as gray-green mush glugs down it. Sound: thick glugging. Shot 2: Push-in on the play-button box holding the funnel, wincing and apologetic, eyes darting sideways, as a much larger hand from off-frame tightens around its arm, forcing it to keep pouring.

#Narration: The reason that they will continue to force AI slop down our throats, even though it could eventually destroy their business, is that they have no choice.

#Video: Shot 1: Tracking shot, a giant white blob figure with a large "G" on its front pushes a stroller down the street, enthusiastically shaking a sparkle-covered rattle at the red play-button box strapped inside, which kicks its stick legs in protest.

#Narration: YouTube is owned by Google, and Google is one of the leading developers of generative AI.

#Video: Shot 1: Wide shot, slow tilt up a huge wall chart as a steep green line climbs higher, its climbing section held up from beneath by a single wooden prop with a sparkle painted on it, planted on a stack of server boxes, an investor standing off to the side. Sound: servers humming. Shot 2: Close-up on the prop bowing under the weight as a small crack in it widens slightly. Sound: wood creaking. Shot 3: Medium shot of the investor off to the side with dollar signs for eyes, staring up at the line and ignoring the prop entirely.

#Narration: AI slop may one day kill YouTube, but it's also propping up Google's stock price, and forms a key part of their overall growth strategy.

#Video: Shot 1: Wide shot of a family dinner table, the giant "G" parent looming at one end, arm outstretched, pointing sternly down at a plate of gray-green mush in front of the little play-button box on a booster seat at the other end. Shot 2: Medium shot as the play-button box pushes the plate away with both hands and the parent firmly pushes it back, while the box holds a crayon drawing of humans painting, singing and filming higher and higher, the parent never looking at it.

#Narration: Google is heavily reliant on AI, so they can't have one of their own subsidiaries rejecting it and fighting for a future where human culture stays human.

#Video: Shot 1: Medium shot on the courthouse steps, a figure in a stars-and-stripes top hat performs the Heimlich maneuver on the enormous "G" blob, which doubles over and coughs up a round blue-and-green browser icon that arcs across the frame and bounces away, the play-button box standing at the edge of the frame. Sound: a heaving cough, a rubbery bounce on stone steps. Shot 2: Pan to the play-button box standing right beside them, unnoticed, whistling at the sky with a crown half-stuffed into its pocket.

#Narration: The US government previously tried to force Google to spit out Chrome, but it seems to me that YouTube is the far more obvious antitrust case.

#Video: Shot 1: Medium shot, two crowned figures, a magnifying glass over a search bar and the red play-button box, are handcuffed together at the wrist facing opposite directions and strain to walk away from each other, the cuffs going taut as an enormous hand-lettered question mark grows between them, a tiny lawyer standing at their feet. Sound: a handcuff chain rattling and snapping taut. Shot 2: Tilt down to the tiny lawyer at their feet shrugging with both palms up.

#Narration: These are massive, unrelated businesses with opposing commercial interests. Why does the search monopoly own the video sharing monopoly? Who knows?

#Video: Shot 1: Wide shot, an enormous thin-skinned bubble with a sparkle floating inside it drifts slowly toward a needle mounted on the wall, the play-button king crouched just around a corner nearby. Sound: a faint wobbling hum. Shot 2: Medium shot of the play-button king crouched around the corner out of the bubble's sight, a broom in one hand and a "WE ALWAYS HATED SLOP" sign tucked under his arm, peeking out and edging the sign into view.

#Narration: Maybe YouTube will start suppressing slop once the AI bubble pops.

#Video: Shot 1: Medium shot, the play-button box thrashes in dark blue water while a swarm of small startup piranhas, little colored boxes with fins and one angry eye each, dart in from every side. Sound: water churning and splashing, jaws snapping, bubbles rising. Shot 2: Close-up as bits of the crown drift up and away and one tiny piranha with a napkin tucked into its fin takes a bite.

#Narration: Or maybe they'll be eaten alive by smaller startups once slop becomes widely accepted.

#Video: Shot 1: Wide shot of an auction house, a podcaster stands on the block holding a microphone, looking extremely comfortable, as rival platform boxes shoot up numbered paddles with increasingly absurd figures scrawled on them, the play-button king standing at the back of the room. Sound: paddles swishing up, a gavel hammering. Shot 2: Slow push-in to the back of the room, where the play-button king turns his wallet upside down and a single moth flutters out.

#Narration: Maybe we'll see a repeat of the podcast and streamer bidding wars, with top human talent being poached away from YouTube.

#Video: Shot 1: Medium shot, a boxy robot with a flat screen for a face cycles through enormous shocked open-mouthed faces while flinging handfuls of cash, drawn as gray-green blobs, into a roaring crowd with hearts floating over their heads, a creator sitting alone on a stool in the bottom corner. Sound: a crowd roaring, blobs splatting, servos whirring. Shot 2: Pan to the bottom corner, where the creator sits alone on a stool with a "100% HUMAN" badge and no audience at all as the stool slides out of frame.

#Narration: Or maybe AI Mr Beast will be so compelling that these platforms will drop human creators altogether.

#Video: Shot 1: Wide shot, a figure in a dark purple cape stands on the toppling wooden throne, planting a flag reading "NO SLOP" and sailing free tickets into a cheering crowd below, one tidy little ad banner floating politely off to the side. Sound: wood crashing, a flagpole thunking into wood, a crowd cheering. Shot 2: Low tracking shot following the crown as it rolls away across the floor and comes to rest in a puddle.

#Narration: Maybe Nebula will ban AI content from their platform, launch an ad-supported free tier, and overthrow the tyrant king.

#Video: Shot 1: Medium shot, the host stands sheepishly rubbing the back of his head beside an enormous corporate poster in cheery bubble lettering reading "BRING BIG IDEAS TO LIFE" and "FUEL IMAGINATION," a winged yellow lightbulb flapping upward off the ground. Sound: little wings flapping. Shot 2: Close-up of the poster's bottom corner peeling further away as gray-green mush oozes out from behind it, the host not noticing.

#Narration: Or maybe I'm entirely wrong, and AI will help YouTubers bring big ideas to life and fuel imagination, as YouTube seems to believe.

#Video: Shot 1: Medium shot, static, two bottles on a plain shelf under a hand-lettered "?": on the left a bloated milk carton with green stink lines wafting off it and a fly in a tiny gas mask adjusting its mask nearby, on the right a dark wine bottle with a neat label and a small gold medal hanging from its neck. Sound: a fly buzzing close by. Shot 2: Tilt down to an empty comment box below the shelf with a blinking cursor.

#Narration: If you're watching this video in 5 years, comment below whether it aged like milk or wine.

#Video: Shot 1: Wide shot, a tiny island in the middle of the gray-green mush sea, just big enough for one creator, their tripod and their camera, mush already lapping over their shoes. Sound: mush lapping. Shot 2: Medium shot, sleeves rolled up and jaw set, the creator hammers a flag reading "HUMAN MADE" into the ground with three firm strikes, not budging as the mush rises up their ankles.

#Narration: And if you're a YouTuber making real human content — good luck. You're going to need it.

#Video: Shot 1: Medium shot, the host waves with one hand while, on his left, a guest illustrator raises an oversized marker like a staff, a small star doodle spinning beside their head and an arrow pointing at them, a row of supporters lined up to the right. Shot 2: Pan right along the row of supporters as comically enormous hats pop onto their heads one by one, and the biggest hat, with two blinking eyes and a small antenna, glances around the room by itself.

#Narration: Thank you to Star for guest illustrating this video, and thank you to my backers on Patreon, especially those in the big sentient hat tier, for supporting the channel.

#Video: Shot 1: Medium shot, static, the host waves both arms overhead, eyes curved into happy arcs, standing on a plain flat ground line with a small scribbled sun behind him, his marker cap and a closed sketchbook on the ground beside his feet. Shot 2: A whiteboard eraser sweeps across from one side and wipes the whole drawing away.

#Narration: I'm Siliconversations. Thanks for watching. See you all next time. Bye for now.`,
	},
];

const TEMPLATE_MAP = new Map(TEMPLATES.map((t) => [t.id, t]));

/** Optional lookup for ids from outside the app, where a miss is a stale id. */
export function getTemplateById(id: string): Template | undefined {
	return TEMPLATE_MAP.get(id);
}

/** Lookup for ids sourced from `TEMPLATES`, where a miss is a programming error. */
export function getTemplate(id: string): Template {
	const template = TEMPLATE_MAP.get(id);
	if (!template) throw new Error(`Unknown template id "${id}"`);
	return template;
}
