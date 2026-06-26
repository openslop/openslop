import dedent from "dedent";
import { type Template, templateAsset } from "./types";

export const povLife: Template = {
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
};
