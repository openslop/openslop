import { dedent } from "@/lib/dedent";
import type { TemplateInput } from "../templates";

export const povLife = {
	id: "pov-life",
	length: "5-10m",
	name: "POV Life",
	promptPrefix: "POV: Your life at every stage as a",
	color: "#F59E0B",
	style: {
		description:
			"2D cartoon illustration, thick black outlines, muted desaturated colors, cinematic night lighting, flat shading, western animation style, no gradients",
	},
	referenceImages: ["pov-life-stages-2", "pov-life-stages-3"],
	characters: {
		Protagonist: {
			description: "American male, neutral accent",
			appearance:
				"male, average build, slightly hunched posture, bald, wearing a worn olive green jacket, grey t-shirt underneath, faded blue jeans, brown work boots",
			avatar: "pov-life-stages-4",
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
		image: "pov-life-stages-1",
		title: "POV Your Life as A...",
		description:
			"Long-form, second-person POV voiceover with cartoon illustrations that walk a viewer through ascending stages of a role, career, or world",
		examplePrompt: "tech CEO",
	},
	systemPrompt: dedent`
# Important
- The main character (you) is always called Protagonist, and the Protagonist must always be present in the character list of images and videos where appropriate.
- The Protagonist is already one of the characters: use him like a regular character in the story.
- Never mention any specific ages in the image and video prompts, just generic ones like young man.
	`,
	exampleText: dedent`
#Image: A title card with a black background and white Arial text that says "Level 1: The Kid with the Idea"
#Narration: Level 1: The Kid with the Idea

#Music: Soft, dreamy, optimistic lo-fi piano with twinkling synths, hopeful and childlike

#Image: The young Protagonist lying on his stomach on a bunk bed in a small bedroom on a rainy afternoon, a phone held close to his face playing a video of a smiling app founder beside a sports car, game posters and a shelf of action figures behind him, his eyes wide with wonder.
#Narration: You're 11. You watch YouTube videos about people who made apps and got rich.

#Image: The young Protagonist sitting up on the same bunk bed in the gray afternoon light, staring at the ceiling with a dreamy grin, three cartoon thought bubbles above his head showing stacks of cash, a red sports car and a mansion with a pool.
#Narration: You think you can do that too. You can't. Not yet.

#Image: The young Protagonist hunched over a clunky old laptop at a cluttered desk in his small bedroom late at night, the only light the blue glow of the screen on his face, a free coding tutorial open beside a half-finished calculator app, a cereal bowl and tangled charger cables on the desk.
#Narration: You teach yourself to code from a free website. The first thing you build is a calculator. It barely works.

#Image: A bright kitchen in the morning, the young Protagonist holding up his open laptop toward his mom at the sink, the crude calculator app on the screen, his mom drying a plate and smiling warmly down at him, sunlight through the window over a counter of cereal boxes and a fruit bowl.
#Narration: You show your mom. She says it's amazing. You know it isn't. You feel like a wizard anyway.

#Image: A title card with a black background and white Arial text that says "Level 2: The Dropout"
#Narration: Level 2: The Dropout

#Music: Restless indie rock with a driving acoustic guitar, slightly anxious but full of momentum

#Image: The Protagonist, a young man, sitting cross-legged on an unmade dorm room bed in the late morning, typing on a laptop, an untouched backpack on the floor, and through the window across a sunny courtyard a lecture hall with students filing in, his face set and unbothered.
#Narration: You're 19. You're supposed to be in class. You're not.

#Image: The Protagonist, a young man, and two college friends sitting on the floor of a cramped dorm room at night around an open pizza box with two cold slices left, laptops, notebooks and energy drink cans scattered around them, a whiteboard behind them covered in crossed-out app names, all three leaning in and talking with excited gestures.
#Narration: You're in your dorm with two friends and cold pizza. You have an idea. It changes every week.

#Image: The Protagonist, a young man, standing at a college registrar's counter on a quiet weekday, pen in hand over a withdrawal form, a bored clerk waiting behind the glass, fluorescent light overhead, his jaw tight and his eyes fixed on the signature line.
#Narration: You quit school. Your parents cry on the phone.

#Image: The Protagonist, a young man, sitting alone on a park bench at dusk with a phone pressed to his ear, an empty campus path and bare autumn trees behind him, streetlights just switching on, his face calm but his free hand gripping the edge of the bench.
#Narration: You promise this will work. You have no idea if it will.

#Image: A title card with a black background and white Arial text that says "Level 3: The Garage"
#Narration: Level 3: The Garage

#Music: Cold, sparse, melancholic piano with subtle warm undertones, lonely but hopeful

#Sound: Wind whistling through the gap under a metal garage door

#Image: The Protagonist, a young man, sitting at a folding table in a bare suburban garage on a gray winter morning, his breath visible in the cold air, an old laptop and a space heater that is switched off in front of him, a lawnmower and stacked cardboard boxes against the wall behind him, his shoulders hunched against the cold.
#Narration: You move home. Your mom lets you use the garage. There's no heat.

#Image: A close-up of the Protagonist, a young man, typing on a laptop at the folding table in the garage at night, his hands in fingerless gloves, a bowl of dry cereal beside the laptop, snow falling past a small square garage window behind him, a single bare bulb overhead.
#Narration: In December you type with fingerless gloves. You eat cereal for dinner.

#Image: The Protagonist, a young man, slumped at the folding table in the dim garage in the evening, reading an email on the laptop that says "We regret to inform you", three crumpled printed letters on the table beside a cold mug of coffee, his shoulders dropped and his eyes tired.
#Narration: You apply to a program that picks startups. They say no. You apply again. They say no.

#Sound: A fist knocking twice on a metal garage door

#Image: The Protagonist, a young man, leaping into the air in the cold garage in the evening with both arms raised and his mouth open in a scream of joy, the folding chair tipped over behind him, the laptop on the table showing an email with the word "Congratulations", his breath a cloud in the cold air.
#Narration: The third time, they say yes. You scream so loud the neighbor knocks on the door.

#Image: A title card with a black background and white Arial text that says "Level 4: The First Hire"
#Narration: Level 4: The First Hire

#Music: Warm, curious, mid-tempo synth pop with a hopeful melody and soft drum machine

#Image: A close-up of the Protagonist's hand holding a phone in the garage in the morning, a banking app on the screen showing a fresh deposit of "$250,000.00" above a long list of tiny past balances, the folding table and cold laptop blurred behind it.
#Narration: You raise a little money. Enough for one person who isn't you.

#Image: The Protagonist, a young man, shaking hands across a small bare desk with Sam, an engineer, in a tiny rented office in the afternoon, two mismatched chairs, one laptop and a single potted plant on the desk, blank white walls and a window onto a parking lot, both of them smiling.
#Narration: You hire an engineer named Sam. Sam is 28. You are 21.

#Image: The Protagonist, a young man, sitting at his desk in the small office in the afternoon with his chin in his hand looking stumped, Sam standing beside a whiteboard covered in boxes, arrows and question marks, holding a marker and a notebook and looking back at him expectantly.
#Narration: Sam asks questions you can't answer. You learn to say, "I don't know. Let's figure it out."

#Image: A close-up of the Protagonist, a young man, sitting alone at his desk in the small office in the early evening, soft warm light from a desk lamp on his face, a photo of him and Sam pinned to the wall behind him, his expression quiet and determined.
#Narration: That one sentence will save you a hundred times. Sam will stay three years. Sam leaving will hurt more than you expect.

#Image: A title card with a black background and white Arial text that says "Level 5: The First Customer"
#Narration: Level 5: The First Customer

#Music: Bright, bouncy ukulele and handclaps building into a triumphant indie pop beat

#Image: A close-up of the Protagonist's two hands in the small office in the morning, one holding a printed payment receipt that reads "Total: $12.00", the other clenched in a fist of victory, the laptop and a coffee mug on the desk behind.
#Narration: A real person paid you real money. Twelve dollars.

#Image: The Protagonist, a young man, standing in a small startup office in the afternoon looking up proudly at a framed twelve-dollar receipt hanging on an exposed brick wall, a few desks with monitors behind him, a bicycle leaning by the door, sunlight across the wooden floor.
#Narration: You frame the receipt. Then ten people pay. Then a thousand.

#Image: The Protagonist, a young man, at his desk in the office at night, the laptop showing a dashboard with a user graph climbing steeply to "1,024 users", his smile fading into a tired, heavy look as he stares at the number, the office empty and dark behind him.
#Narration: Each new customer feels like magic for about a week. Then it stops being magic and starts being weight.

#Image: The Protagonist, a young man, gripping his head with both hands at his desk in the office at night, the monitor in front of him filling with red support tickets reading "URGENT", "Broken again" and "Refund now", a cold coffee and an empty takeout box beside the keyboard.
#Narration: People depend on the thing you built. When it breaks, they get mad at you.

#Image: A title card with a black background and white Arial text that says "Level 6: The Office"
#Narration: Level 6: The Office

#Music: Mid-tempo cinematic indie with steady drums and shimmering guitars, bittersweet and grown-up

#Image: The Protagonist, a young man, signing a thick lease document at a real estate agent's glass desk in a bright office lobby in the morning, a set of keys on a ring and a floor plan on the desk, the agent sliding a pen across, the Protagonist's face serious.
#Narration: You sign a lease. You're 24.

#Image: The Protagonist, a young man, standing alone in a modern office building hallway early in the morning, staring at a frosted glass door with a company logo etched into it, his reflection faint in the glass, a coffee cup in his hand, morning light down the hallway.
#Narration: The office has your company name on the door. You stare at the sign for a long time the first morning.

#Image: A wide view of a bright open-plan office in the afternoon with rows of standing desks and about fifty employees at monitors, the Protagonist, a young man, walking down the center aisle with a laptop under his arm, glancing at unfamiliar faces with a slightly overwhelmed look.
#Narration: You hire fifty people. You can't remember everyone's name.

#Image: The Protagonist, a young man, at his desk in a glass-walled office in the evening, scrolling a Slack directory of employee profile photos on his laptop, the busy open office visible through the glass behind him, his expression sad and far away.
#Narration: You used to know everyone's dog's name. Now you can't remember a new hire's last name without checking Slack. That bothers you more than you say out loud.

#Image: A title card with a black background and white Arial text that says "Level 7: The Bad Year"
#Narration: Level 7: The Bad Year

#Music: Slow, somber piano with low cello drones, heavy and grieving

#Image: A dark stormy sky over a city skyline at dusk, rain falling on glass towers, a giant billboard screen on one building showing a red downward stock chart and the headline "Markets Tumble", the streets below slick and nearly empty.
#Narration: Something breaks. Maybe the economy. Maybe a competitor. Maybe both.

#Image: The Protagonist, a man, sitting alone at the end of a long table in a dark conference room at night, a laptop open to a spreadsheet of employee names with fifteen rows highlighted red, the city lights through the window behind him, his hand over his mouth.
#Narration: You fire fifteen people. You write a long email.

#Image: A close-up of the Protagonist's hand hovering over the trackpad of a laptop in the dark conference room at night, the cursor on a blue "Send" button below a very long email, his finger trembling, the screen's glow the only light.
#Narration: You read it three times. You send it.

#Image: The Protagonist, a man, sitting on the carpet of his glass-walled office at night with his back against the wall and his knees up, staring at nothing, his tie loosened, the empty desks and city lights beyond the glass, a phone face-down on the floor beside him.
#Narration: You sit on the floor of your office for an hour without talking.

#Image: A close-up of the Protagonist, a man, on the office floor at night, his eyes red and wet, one hand pressed against his forehead, the reflection of city lights in the dark window beside him.
#Narration: You used to think founders who cried at work were weak. You don't think that anymore.

#Image: A title card with a black background and white Arial text that says "Level 8: The Big Number"
#Narration: Level 8: The Big Number

#Music: Slick, polished electronic beat with synth stabs, glamorous but slightly hollow

#Image: A laptop on a desk in the morning showing a tech news article with the headline "Startup Raises $100 Million Series C", the Protagonist's smiling photo as the hero image, a fresh espresso and a buzzing phone beside the laptop, the Protagonist, a middle-aged man, leaning into frame to read it.
#Narration: You raise a hundred million dollars. The news writes about you.

#Sound: Rapid phone notification chimes

#Image: The Protagonist, a middle-aged man, in a dark car at night, his face lit by his phone as a stack of text notifications piles up on the screen from names like "Jake from high school" and "Tyler H.", the city sliding past the window behind him, his expression flat.
#Narration: People from high school text you for the first time in years. Some want jobs. Some want money.

#Image: A close-up of a phone screen in the dark car showing a long text message that begins "Hey, this is random, but I wanted to say sorry for fifth grade", the Protagonist's thumb hovering over the keyboard without typing, the blank reply box empty.
#Narration: One wants to apologize for being mean to you in fifth grade. You don't write back to most of them. You hate that you don't.

#Image: A warm dining room in the evening, the Protagonist, a middle-aged man, at the head of the table looking down at his glowing phone, his son across from him holding up a drawing and looking at him, his partner watching him with a tired face, plates of pasta going cold.
#Narration: Your kid asks why you're on your phone at dinner. You don't have a good answer.

#Image: A title card with a black background and white Arial text that says "Level 9: The Top"
#Narration: Level 9: The Top

#Music: Grand, sweeping orchestral score with strings and soft brass, regal but lonely

#Image: A wide aerial view of a gleaming glass skyscraper headquarters at golden hour, the company logo lit on its roof, sunlight flaring off the windows, the city and a river spread out far below.
#Narration: The company is worth a billion dollars.

#Image: The Protagonist, a middle-aged man, sitting small behind a huge desk in a vast corner office in the afternoon, floor-to-ceiling windows over the city on two sides, an assistant with a headset visible through the open door checking a tablet, a single family photo on the enormous desk.
#Narration: You have a corner office and an assistant who guards your calendar like it's gold.

#Image: The Protagonist, a middle-aged man, at his desk in the corner office in the late afternoon, his laptop showing an inbox with "2,847 unread" and a code editor minimized to a tiny window in the corner of the screen, his hand resting on the trackpad, his expression wistful.
#Narration: You don't write code anymore. You write emails. So many emails. You miss writing code.

#Image: The Protagonist, a middle-aged man, standing in a bright conference hall lobby in the afternoon, a lanyard around his neck, signing a paper napkin with a borrowed pen for a starstruck stranger in a conference T-shirt, a crowd and banners behind them, the Protagonist's face confused and a little uncomfortable.
#Narration: At a conference, a stranger asks for your autograph. You laugh because you think it's a joke. It isn't.

#Image: The Protagonist, a middle-aged man, alone in a hotel room at night, sitting on the edge of the bed still in his conference lanyard, staring at the pen in his hand, the city lights through the window behind him, his expression uneasy.
#Narration: You sign a napkin. You feel weird about it for three days.

#Image: A title card with a black background and white Arial text that says "Level 10: The Letting Go"
#Narration: Level 10: The Letting Go

#Music: Gentle acoustic guitar with warm strings, reflective and peaceful, ending with quiet hope

#Image: The Protagonist, an older man, standing at a podium in a packed company auditorium in the morning, a huge screen behind him reading "Thank you", hundreds of employees in the seats looking up at him, his hands gripping the sides of the podium and his face composed.
#Narration: You step down. The board picks a new CEO.

#Image: The Protagonist, an older man, standing in the doorway of the corner office in the afternoon watching the new CEO, a woman, sitting in his old chair behind the huge desk and typing, the city through the windows behind her, his expression a mix of pride and hurt.
#Narration: She's better at running a big company than you are. You know this. It still hurts to watch her sit in your chair.

#Sound: A dog barking happily and birds chirping in a park

#Image: The Protagonist, an older man, in a T-shirt and sneakers walking a golden retriever along a sunlit path in a neighborhood park in the morning, dew on the grass, a couple of joggers far behind him, the dog looking up at him and the Protagonist smiling easily.
#Narration: You take six months off. You walk your dog twice a day. You learn to cook one good meal.

#Image: The Protagonist, an older man, sitting across a small wooden table from Maya, a young founder, in a cozy coffee shop on a rainy afternoon, both leaning over a paper napkin with a rough app sketch on it, two coffee cups and a laptop pushed aside, her eyes bright and nervous, his amused.
#Narration: Then the itch comes back. You meet a kid in a coffee shop with an idea on a napkin. She's 22. She's scared and electric.

#Image: A close-up of the Protagonist's hand sliding a personal check across the wooden coffee shop table toward Maya, the sketched napkin between the cups, Maya's hands frozen above the table and her mouth open in shock, rain on the window behind her.
#Narration: You write her a check. You tell her she has no idea what she's signing up for.

#Image: A close-up of Maya's hopeful face in the coffee shop, her eyes shining as she looks at the check, the Protagonist, an older man, slightly out of focus behind her by the rainy window, watching her with a knowing smile.
#Narration: She doesn't believe you. You didn't believe it either. The cycle keeps going. It always does.
	`,
} satisfies TemplateInput;
