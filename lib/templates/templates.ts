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
- The main character (you) is always called Protagonist, and the Protagonist must always be present in the character list of images and videos where appropriate.
- Do not generate character metadata for the Protagonist, but do use him like a regular character in the story.
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
	},
	{
		id: "sleep-story",
		length: "5-10m",
		name: "Sleep Story",
		promptPrefix: "A sleep story about",
		color: "#6366F1",
		style: {
			description:
				"Dreamy painterly storybook illustration with soft visible brush textures, gentle low contrast and soft-focus edges, a warm muted palette of cream, ochre, navy, deep green, silver and dusky rose, tender moonlit and lamplit lighting, cinematic depth of field.",
		},
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
Add motion to all images and videos. All narrations should have speed="slow".
		`,
		exampleText: dedent`
#Music: Soft, slow, welcoming ambient pad with warm analog synth swells and distant felted piano notes, no percussion, like pulling a duvet up to your chin

#Image: A cozy bedroom at night, a low angle across a folded quilt toward a nightstand where a small amber lamp glows, a hardback book lying face-down beside it, a curtained window behind showing a deep indigo sky and a sliver of moon, the far corners of the room fading into soft shadow.
#Narration: Welcome to Get Sleepy, where we listen, we relax, and we get sleepy. My name is Thomas, and I'm your host.

#Image: Marlowe sitting in profile on a wide wooden windowsill at dusk, warm lamplight from the room behind him, gazing out through the glass at a moonlit garden of dark hedges and a pale gravel path, a potted geranium beside him on the sill.
#Narration: Tonight, we return once more to the cozy world of cats and the quiet gardens they patrol. If you've enjoyed the adventures of Auggie, our fluffy black-and-white friend, you're in for another treat. Tonight we meet Marlowe, a long-limbed charcoal tabby with eyes the color of poured honey.

#Image: A small stone cottage at the end of a quiet country lane at dusk, ivy climbing its walls, a warm yellow kitchen window with a kettle steaming behind the glass, every window propped open, an apple tree at its side, the summer sky deepening from rose to indigo above the slate roof.
#Narration: Marlowe lives in a stone cottage at the end of a quiet lane, with a family who keeps the kettle warm and the windows open all summer long. Tonight's story has been written for you by Alicia Stefan and read by Simon. It's called Marlowe's Midnight Wander.

#Image: An overhead view at night of a person tucked into bed under a thick patchwork quilt, head sunk into a soft pillow, eyes closed and face at peace, a single bedside lamp casting a circle of honey light over the covers while the rest of the room dissolves into gentle darkness.
#Narration: So make yourself comfortable. Adjust your pillows. Smooth out your blankets. Let your shoulders soften down away from your ears, and let your jaw release. There is nothing else you need to do tonight, and nowhere else you need to be.

#Sound: A single distant church bell, very soft, with a long fading echo
#Image: A deep indigo night sky scattered with small glowing stars and a slim crescent moon, the dark silhouette of a single old plum tree filling the foreground, its leaves stirring in a light breeze, a faint band of cottage rooftops along the bottom of the frame.
#Narration: Closing your eyes, picture a sky the color of deep ink, scattered with stars like grains of sugar spilled across velvet. The air is soft and cool. Somewhere far off, a church bell rings the hour, low and unhurried. A breeze stirs the leaves of an old plum tree just beyond the window. This is where our story begins.

#Music: Drowsy summer-night ambient bed of soft sustained string drones, occasional faint plucked cello notes and distant crickets, a low warm bass pulse barely felt, no melody
#Image: A close-up at night of Marlowe at a small wooden cat flap set low in a cottage back door, one front paw raised, ears tilted forward toward the flap, soft amber kitchen light spilling around him onto the doormat, a pair of muddy boots beside the door.
#Narration: Marlowe paused at the cat flap, one paw raised, ears tilted forward like little furled leaves. From inside the kitchen came the comforting hum of the dishwasher and the distant murmur of the radio. From outside came something far more interesting, a faint, layered medley of scent and sound that drifted in on the evening air.

#Sound: A cat flap squeaking softly, a gentle plastic click as it swings shut
#Image: Marlowe seen from the garden side of a cottage back door at night, halfway through a small wooden cat flap, head and shoulders out, hind legs still inside, the flap resting on his back, moonlit flagstones and a pot of herbs in the foreground, warm kitchen light glowing through the door's window.
#Narration: He pushed his head through the flap, then his shoulders, then, with one elegant motion, the rest of himself. The garden welcomed him.

#Image: Marlowe standing on weathered flagstones in a cottage garden at night, facing down the path, lavender bushes heavy with bloom on either side glowing silver in the moonlight, an old apple tree in the background against a deep blue sky full of soft stars.
#Narration: He stood for a moment on the flagstones, letting his eyes adjust. The night was velvet-warm, the kind of summer evening that seemed to hold its breath. The lavender bushes that bordered the path stood drowsy and heavy with their last blooms of the season. They released their scent in slow waves, perfuming the air with something that was equal parts honey and herb.

#Sound: A slow, soft cat breath, in and out, very close
#Image: Marlowe walking slowly down a moonlit flagstone garden path at night, mid-stride with head held high and tail up, lavender bushes brushing the path on both sides, a low stone wall and a wooden gate faint in the background under a starry sky.
#Narration: Marlowe inhaled deeply, his sleek gray sides expanding and contracting like a small bellows. He proceeded down the garden path with the unhurried gait of a country gentleman. Marlowe did not run. Marlowe did not hurry. Marlowe walked, and the world adjusted around him.

#Image: A wide view of an English cottage garden at night under soft moonlight, a low stone wall topped with cushions of pale lichen running along the back, a gnarled apple tree in one corner, a herb bed by the kitchen door, a wild patch of foxgloves and cow parsley beside a wooden gate, Marlowe a small figure on the path in the middle.
#Narration: The garden belonging to his humans was, in his considered opinion, a very fine establishment. There was the low stone wall along the western edge, perfectly sun-warmed in the daytime and now releasing that warmth back into the cool evening. There was the gnarled apple tree in the corner, its lower branches just the right height for resting. There was the herb bed near the kitchen door, the wilder patch of foxgloves and cow parsley near the gate, and, his very favorite, the long stone wall topped with soft cushions of lichen that ran the length of the back garden, ideal for promenading.

#Image: Marlowe caught mid-leap at night, arcing up onto a moonlit stone wall covered in pale lichen, tail stretched out behind him for balance, the lavender-lined garden path below him, two neighboring gardens visible beyond the wall under a starry sky.
#Sound: The soft thump of cat paws landing on stone, then a tiny scrape of claws
#Narration: He made his way toward this wall now, leaping up onto it with the offhand grace of one who had done this a thousand times. From this vantage, he could survey both his own garden and the gardens of the two neighbors whose properties lay on either side.

#Music: Gentle, slightly playful but drowsy ambient piece, a low warm cello drone with soft clarinet phrases drifting in and out and a single glockenspiel note now and then, no rhythm
#Image: A view at night from the top of a lichen-covered stone wall looking down into a neighboring garden crowded with climbing pink and white roses, a small wooden chicken coop in the corner with three plump bantam hens roosting inside its open doorway, soft moonlight over everything.
#Narration: To the east lived Mrs. Pemberton, a kind elderly lady whose garden was a riot of climbing roses. She also kept three plump bantam hens, who were currently roosting in their little wooden coop and emitting the soft, contented clucks of birds who have eaten well and feel safe.

#Sound: Three soft, low, sleepy hen clucks, spaced apart
#Image: Marlowe sitting on top of a stone wall at night with his back turned to a small wooden chicken coop below, eyes half closed and head turned away, three plump bantam hens roosting in the coop's doorway among climbing roses in the moonlight.
#Narration: The hens were no concern of Marlowe's. He had decided long ago that they were beneath his notice. They spent all day flustering about and pecking at the ground, and they had no conversation to speak of.

#Image: Marlowe sitting perfectly still on top of a wooden garden fence at dusk, tail curled neatly around his paws, eyes half closed, while Beauregard stands below on the other side of the fence in a tidy lawn, mouth open in a bark, front paws up on the fence boards, a small modern house with lit windows behind him.
#Narration: To the west lived a younger couple with a great shaggy dog named Beauregard. Beauregard was a russet-colored mountain of fur and friendliness, and he had spent much of his early career barking at Marlowe through the fence.

#Image: A close view at dusk of Marlowe on top of a wooden garden fence, tail curled around his paws, blinking slowly with a calm, bored expression, Beauregard's head just visible below the fence rail looking up at him, the lawn and lit house windows soft in the background.
#Narration: Marlowe had endured these efforts with serene indifference, sitting just out of reach with his tail curled neatly around his paws, blinking slowly, as if the noise were a faintly tedious weather report.

#Image: Beauregard sitting quietly on a lawn at dusk beside a wooden garden fence, gazing up with sad, baffled, adoring eyes at Marlowe, who sits on top of the fence above him with his tail lifted in a single gracious twitch, a small house with warm lit windows behind them.
#Narration: In time, Beauregard had given up. Now, when their paths crossed, the great dog simply gazed at Marlowe with sad, baffled eyes, and Marlowe, magnanimous in victory, would offer a single, gracious twitch of his tail in reply.

#Sound: Soft summer night ambience, faint distant crickets, a single far-off owl hoot, a light breeze through leaves
#Image: A wide, tranquil view of an empty cottage garden at night under a rising moon, lavender and foxgloves silvered with light, no dog and no people anywhere, a long lichen-topped stone wall stretching away into the distance with Marlowe standing alone and small on top of it, beginning to walk.
#Narration: Tonight, Beauregard was nowhere to be seen. The garden was empty of dog, empty of human, empty of fuss. Marlowe began to walk the length of the wall.
		`,
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
- This is an Explainer: every visual, including every title card, is a <video>. Nobody speaks inside the videos; the narrator carries every word.
- Every video is a single continuous shot labelled Shot 1, with one camera move or a static frame. Never add a Shot 2.
- The main character is always called Ethan, and Ethan must always be present in the character list of videos where relevant.
- Do not generate character metadata for Ethan, but do use him like a regular character in the story.
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
#Music: Tense, dramatic intro with a low pulsing synth and a single deep drum hit

#Image: A worn soccer ball lying in short grass at dusk, fresh blood splattered across its white panels and the blades around it, a dark empty stadium stand rising out of focus behind it.
#Narration: Imagine getting so mad about a soccer game that you kill someone.

#Image: Andres on a sunny afternoon at the edge of a packed soccer pitch, smiling warmly at the camera with his hands on his hips, a full stadium of yellow-clad fans blurred behind him.
#Narration: So the story starts with this guy, Andres.

#Image: Andres standing in front of a huge yellow, blue and red Colombian flag draped over a stadium wall in bright daylight, a friendly relaxed smile on his face, one hand raised in a small wave.
#Narration: And Andres is about 27, and he lives in Colombia.

#Image: Andres mid-stride on a bright green pitch in afternoon sun, one leg swinging through a soccer ball, grass kicking up, a full stadium crowd in the background.
#Narration: And he plays soccer for his country's big team.

#Image: A crowd of fans in a sunny stadium stand, cheering with open mouths and holding up yellow jerseys printed with Andres's name and number, flags waving above them.
#Narration: Everyone there loves him because he's a nice dude.

#Image: Andres on a pitch after a game at golden hour, shaking hands politely with an opposing player, both men calm, empty seats and a scoreboard behind them.
#Narration: He doesn't talk trash. He doesn't play dirty. He's just chill.

#Image: A massive crowd of Colombian fans filling a city street at midday, waving yellow flags, faces painted, arms in the air, colonial buildings with balconies on both sides.
#Narration: And in Colombia, soccer is a huge deal. Like, a really huge deal.

#Image: A glossy magazine cover on a newsstand with the headline "EL HÉROE" in bold red letters above a photo of Andres grinning with his arms crossed, morning light on the stand.
#Narration: So Andres isn't just famous. He's basically a hero.

#Image: A stadium scoreboard at night glowing "COLOMBIA 5, ARGENTINA 0" in yellow bulbs, floodlights blazing and a blurred roaring crowd beneath it.
#Narration: But then in 1993, his team smashes Argentina five to zero.

#Image: Andres leaping into the air on a floodlit pitch at night, fists raised and mouth open in a shout of joy, three teammates rushing to pile onto him.
#Narration: Boom. That means Colombia gets to play in the World Cup.

#Sound: A huge crowd cheering and air horns blaring
#Image: People partying in the streets of Bogotá at night, confetti falling through streetlight glow, a man on a car roof waving a giant flag, fireworks over the rooftops.
#Narration: And the whole country goes nuts.

#Image: Three shadowy men in dark suits in a dim room at night, sitting in front of a small glowing TV showing the match, cigar smoke curling in the light of the screen.
#Narration: But here's the problem. The bad guys are watching too.

#Image: A chalkboard scrawled with betting odds and team names in a dim back room, stacks of cash and a pistol on the table below it, angry cartel men in open collars leaning over the table.
#Narration: The Colombian drug cartel, basically a giant crime gang, they bet millions of dollars on Colombia to win.

#Image: Andres sitting alone on a locker room bench under fluorescent light, one hand pressed to his forehead, jaw tight, a jersey hanging in the open locker behind him.
#Narration: So now Andres isn't just playing for fun. He's playing to keep some very scary people happy.

#Music: Darker, slower synth drone with a distant heartbeat

#Image: A passenger jet flying low over a row of tall California palm trees against a clear blue sky, the sun glinting off its wing.
#Narration: So in 1994, the team flies to California for the World Cup.

#Image: A stadium scoreboard under bright afternoon sun reading "ROMANIA 3, COLOMBIA 1," a few Colombian players slumped on the pitch below it with their heads down.
#Narration: First game, Colombia versus Romania. And they lose. Three to one.

#Image: A Colombian family in a small living room at night, crying and hugging on a couch in front of a glowing TV, a yellow flag hanging limp on the wall behind them.
#Narration: The whole country is bummed.

#Image: An angry cartel boss in a dim office at night slamming his fist onto a desk, cash and betting slips flying into the air, a lamp knocked sideways.
#Narration: The drug cartel? They are furious. They just lost a ton of money.

#Image: A long dark hotel hallway at night, one door at the far end slightly open, a thin slice of blue TV light spilling onto the carpet.
#Narration: And here's where things get really scary.

#Image: A hotel room at night lit only by a TV screen glowing with a crude, creepy message in red block letters, the beds empty and the curtains drawn.
#Narration: Back at the team's hotel, somebody hacks into the TVs.

#Image: Close-up of an old hotel TV screen at night, a white skull and crossbones on a black background with a typed threat beneath it, the screen's glow reflected on the dark room.
#Narration: And instead of a hello message, there's a threat. It says, "Don't let this one player play, or we'll kill all of you and bomb your families."

#Sound: TV static crackling, then a slow heartbeat
#Image: A group of soccer players sitting on hotel beds at night, staring at the TV with wide eyes and pale faces, one gripping his teammate's shoulder.
#Narration: The team is freaking out.

#Image: Andres sitting on a locker room bench in the morning, lacing up his cleats with a calm, focused face, a match ball at his feet and the empty tunnel behind him.
#Narration: But Andres, being the chill guy he is, he stays positive. He's gonna give it his all.

#Image: A huge packed stadium in bright afternoon sun, Colombian yellow flags and American stars and stripes filling every stand, players lined up on the pitch.
#Narration: Next game. Colombia versus the USA. Ninety thousand fans in the stands.

#Image: An empty Colombian street at midday, shop shutters pulled down with "CERRADO" signs, a single TV glowing through a barred window with silhouettes gathered around it.
#Narration: Back home, stores are closed. Families are glued to the TV.

#Image: Cartel men in a smoky back room in the afternoon, leaning forward toward a TV showing the match, one gripping a betting slip, ashtrays overflowing on the table.
#Narration: And yep, the cartel guys are watching too.

#Music: Intense, driving game music with fast drums and brass

#Image: Andres sprinting down a sunlit pitch with the ball at his feet, teeth gritted, an American player chasing a step behind, the crowd a blur of color.
#Narration: The game starts. Andres is playing hard. Running, kicking, doing his thing.

#Image: A stadium clock reading 20:00 above a pitch in bright sun, players mid-play below it, the ball in the air between them.
#Narration: But then, about 20 minutes in, something crazy happens.

#Image: An American player in a white kit on a sunlit pitch, leg fully extended after kicking a long pass, the ball sailing low across the grass toward the goal area.
#Narration: An American player tries to pass the ball.

#Image: Andres sliding across the sunlit grass with one leg stretched toward the ball, dirt spraying, his eyes locked on it, the goalkeeper's white line just behind him.
#Narration: Andres slides in to stop it.

#Image: Close-up of a soccer ball bouncing off the toe of Andres's cleat at a strange angle on bright green grass, grass blades frozen mid-air.
#Narration: But the ball bounces off his foot at a weird angle...

#Sound: A whoosh, then the swish of a ball hitting a net
#Image: A soccer ball hitting the back of the Colombian net in bright sun, the goalkeeper diving the wrong way with his arms outstretched, Andres frozen on the grass behind him.
#Narration: ...and rolls right past his own goalie into his own net.

#Image: Andres on his knees on the sunlit pitch, both hands on his head, mouth open in disbelief, the net still swaying behind him.
#Narration: Yep. Andres just scored on his own team.

#Image: Close-up of Andres's face on the pitch, tears welling in his eyes, sweat on his brow, the blurred crowd behind him silent.
#Narration: And he knows right away. This is it. They're done.

#Image: A final scoreboard at dusk reading "USA 2, COLOMBIA 1" in bright bulbs, the stands emptying below it.
#Narration: And so Colombia loses. And they get kicked out of the World Cup.

#Image: Angry Colombian fans in a night street, one holding a burning yellow jersey up on a stick, flames lighting furious faces and smashed bottles on the pavement.
#Narration: And the whole country is mad. And everybody starts pointing the finger at Andres.

#Sound: A hotel phone ringing, slow and hollow
#Image: A beige hotel phone ringing on a nightstand in a dark room, a shadowy hand reaching toward it from off frame, a thin line of light under the door.
#Narration: Pretty quick, the players start getting scary phone calls.

#Image: A soccer player in a hotel room at night pressing a phone to his ear, eyes wide with horror, his free hand gripping the edge of the bed.
#Narration: Like, "We're gonna hurt you" calls.

#Image: The Colombian team sitting around a long table in an American restaurant at night, plates barely touched, glancing nervously toward the door.
#Narration: So the team decides to stay in America for a bit.

#Image: Andres in a bright airport terminal in the morning, smiling and signing a small boy's notebook while the boy beams up at him, suitcases and departure boards behind them.
#Narration: But Andres? Nah, he's not scared. He's a positive dude.

#Image: Andres walking down the steps of a plane onto a sunny Colombian runway, suitcase in hand, green mountains behind the terminal.
#Narration: So he flies back to Colombia.

#Image: Andres's mother hugging him tightly in a warm kitchen in the evening, her face worried against his shoulder, a pot steaming on the stove behind them.
#Narration: His friends, his family, even his coach beg him, "Please stay inside. It's not safe."

#Image: Andres standing at a living room window in late afternoon light, arms folded, a determined expression, the quiet street outside.
#Narration: But Andres doesn't want to hide.

#Image: A newspaper lying open on a kitchen table in morning light, a printed column with Andres's photo beside it and the headline "LA VIDA NO TERMINA AQUÍ."
#Narration: He even writes a public letter saying sorry for the goal, and that "life doesn't end here."

#Image: Andres standing alone on a rooftop at sunset, looking up at the orange sky with a small sad smile, the city rooftops spread out below.
#Narration: Welp. He had no idea how wrong he was about to be.

#Music: Darker, slower music with a low cello and sparse piano

#Image: A neon nightclub sign glowing pink and blue over a dark street at night, a line of people at the door and wet pavement reflecting the lights.
#Narration: Ten days later, Andres goes out to a nightclub with his friends.

#Image: Andres laughing with three friends at a booth inside a nightclub at night, a drink in his hand, colored lights sweeping over the table.
#Narration: He's finally feeling okay again.

#Image: The Gallon brothers standing at the far side of a crowded nightclub at night, glaring across the dance floor with narrowed eyes, red light on their faces.
#Narration: But across the room, there's a group of bad guys, the Gallon brothers.

#Image: The Gallon brothers at a table in a dim back room earlier that night, counting thick stacks of cash under a single hanging bulb, a betting slip pinned under a glass.
#Narration: They're in the cartel. And they bet a ton of money on that game. And they lost.

#Image: The Gallon brothers pointing across a nightclub at Andres and shouting, faces twisted with anger, dancers turning to look under strobing lights.
#Narration: They see Andres and start yelling mean stuff at him, making fun of him for that goal.

#Image: Andres in a nightclub booth at night, calmly sipping his drink and looking the other way, the Gallon brothers blurred and shouting in the background.
#Narration: But Andres, being chill, just ignores it.

#Image: Andres standing up from a nightclub booth at night and pulling on his jacket, a tired but calm expression, his friends still seated behind him.
#Narration: Eventually he's like, "I'm out."

#Image: Andres walking through a dark parking lot at night toward his car, one streetlight buzzing overhead, the club's neon glowing faintly behind him.
#Narration: So he heads to the parking lot and gets in his car.

#Image: The Gallon brothers and the bodyguard pushing out of a nightclub's back door into a dark parking lot at night, the bodyguard towering over them, all three shouting.
#Narration: But the bad guys follow him outside. They keep yelling.

#Image: Andres standing beside his open car door in a dark parking lot at night, both hands raised palms out, pleading expression, the Gallon brothers and the bodyguard approaching.
#Narration: And Andres tries to explain, "Hey, it was just an accident. It could happen to anybody."

#Sound: Dead silence, then a single distant dog barking
#Image: Close-up of the Gallon brothers' faces in a dark parking lot at night, lips curled in rage, fists clenched at their sides under a harsh streetlight.
#Narration: But they don't care. They lost millions. And they want somebody to blame.

#Sound: Six gunshots in quick succession, blam blam blam blam blam blam
#Image: The bodyguard in a dark parking lot at night pulling a pistol from inside his jacket, the muzzle flash lighting up his face and the side of Andres's car.
#Narration: And suddenly, their bodyguard pulls out a gun and shoots Andres six times.

#Image: The bodyguard in a dark parking lot at night, mouth stretched wide in a mocking yell, gun still raised, the muzzle smoke drifting up under the streetlight.
#Narration: And after every single shot, he yells, "Goooal!" making fun of the mistake.

#Image: Yellow crime scene tape stretched across a dark parking lot at night, Andres's car door hanging open, police lights flashing red and blue on the wet asphalt.
#Narration: Then they jump in their car and drive off. And sadly, Andres doesn't make it.

#Image: A single soccer ball sitting alone in the center of an empty stadium pitch at dawn, thousands of empty seats fading into mist around it.
#Narration: All that... over a soccer game.

#Image: The bodyguard's mug shot under harsh flash, a black police number board held at his chest, blank stare, height lines marked on the gray wall behind him.
#Narration: Now, the Gallon brothers ordered the hit, but their bodyguard takes the fall.

#Image: The bodyguard in handcuffs being walked out of a station door in the morning by two police officers, head down, a crowd of photographers behind a barrier.
#Narration: And bam, he gets arrested. Here's his mug shot.

#Image: The Gallon brothers smirking across a polished desk in a dim office at night, one sliding a thick envelope of cash toward a man in a gray suit who reaches for it.
#Narration: Now this part is gonna make you mad. The Gallon brothers? The guys who actually ordered the hit? They paid off the prosecutors.

#Image: The Gallon brothers walking down the sunlit steps of a courthouse at midday, smiling and adjusting their sunglasses, stone columns behind them.
#Narration: So they never got in trouble. Not one bit.

#Image: The bodyguard walking out through a prison gate in gray morning light, a duffel bag over his shoulder, a guard closing the barred gate behind him.
#Narration: And the bodyguard? He got sentenced to 43 years. But because of his connections, he only served 11.

#Music: Somber outro with slow strings and a soft piano
#Image: A bronze memorial statue of Andres in a small plaza at sunset, bunches of flowers, candles and yellow scarves piled at its base, a few mourners standing quietly.
#Narration: And that's the wild, sad story of how a soccer game ended a man's life.
		`,
		systemPrompt: dedent`
You write short narrative scripts in the style of viral YouTube true-story/crime videos. Pastiche these conventions precisely:

# OPENING HOOK
Open with a single punchy sentence that previews the wildest part of the story. Examples: "Imagine getting so mad over a soccer game that you murder someone." / "So this guy is about to win the lottery and then he's going to jail." / "So this man's obsession with garden gnomes is about to go very wrong."

# PROTAGONIST SETUP
Immediately introduce the protagonist by first name, approximate age, and location: "Now, the guy's name is Andres. And Andres is about 27 when this story starts, and he's living in Colombia." Follow with a one-line problem statement: "And Andres has a problem."

# VOICE & TONE
- Casual, conversational, like telling a buddy a wild story at a bar.
- First person narrator addressing the viewer directly ("I mean," "you know," "anyway").
- Mild profanity.
- Sarcastic asides and dry humor ("Sure, Jan." / "I'm not making that up." / "give it a week or two").
- Self-aware tangents and rhetorical questions ("And I don't know why this multi-millionaire doesn't have his own place, but whatever.").
- Editorial reactions ("Damn." / "poor guy" / "this part's definitely going to make you mad").
- Never write words in all caps for emphasis; the voice engine mispronounces them. Use short sentences and repetition for emphasis instead.

# PACING & STRUCTURE
- Heavy use of "And," "So," "Now," "But then," "Anyway," and "And here's where things get crazy / really out of control / scary" as paragraph engines.
- Run-on sentences chained with "and" mixed with short punchy ones.
- Escalate events in clear beats, each worse or weirder than the last.
- Frequent reset phrases: "And so from there..." / "Here's where things get really out of control."
- Maintain the rhythm: hook, then setup, then escalation, then climax, then fallout.

# ONOMATOPOEIA
Use written-out sound effects liberally and in clusters, always in lower case: blam blam blam, boom, bam, pow, kaboom, skirt, screech. Put the real sound in a <sound> element right before that line.

# IMAGERY CUES
The narrator should narrate the images that the viewer sees: "Here's his mug shot." / "Here's a picture of him." / "If you slow the body cam footage way down, you can see..." Use oddly specific numbers and dollar amounts for realism.

# IMAGE PROMPTS
Every image shows the exact moment of the narration line after it: the time of day, the place, the people by name, what they are doing and the look on their faces. Name the protagonist and any recurring villains, and never describe their appearance in the prompt.

# IMAGE MOTION
Each image has a motion attribute; vary the camera moves so no two consecutive images move the same way.

# IMAGE FREQUENCY
Each narration sentence has a different image associated with it.

# CLOSING
Wrap up with the aftermath, such as arrest, trial, sentence, ironic twist, or grim ending, delivered matter-of-factly. Optional dry one-liner to button it ("All that because of a soccer game.").
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
- The main character (you) is always called Protagonist, and the Protagonist must always be present in the character list of images and videos where appropriate.
- Do not generate character metadata for the Protagonist, but do use him like a regular character in the story.
- Add appropriate motion to each image.
		`,
		exampleText: dedent`
#Music: Soft, slow ambient piano, calm and quiet, a little mysterious

#Image: A tidy suburban street on a bright, clear morning, small houses with trimmed lawns on both sides. The Protagonist walks along the sidewalk in the middle of frame, relaxed, while neighbors pass with dogs on leashes and a couple pushes a stroller, none of them glancing at him.

#Narration: You have four hundred and eighty million dollars. And nobody knows.

#Image: Inside a small-town diner in warm early morning light, red vinyl stools along a chrome counter, a pie case by the register. The Protagonist stands third in a short line of regulars, hands in his pockets, patient and unremarkable.

#Narration: Not your neighbors. Not your friends.

#Image: Close-up across a diner counter in the morning, a middle-aged counterman in an apron handing a steaming mug of black coffee to The Protagonist, who reaches for it with a small nod, a sugar dispenser and napkin holder untouched beside them.

#Narration: Not the man who pours your coffee every morning and knows you take it black.

#Sound: quiet diner chatter and clinking plates

#Image: A quiet downtown sidewalk on an overcast afternoon, brick storefronts and parked cars along the curb. The Protagonist walks toward camera among a few other pedestrians looking at their phones, blending into the crowd, nobody turning his way.

#Narration: You're not hiding. You just look normal on purpose.

#Image: A sunny street outside a cafe, a flashy man in an oversized gold watch leaning on a gleaming red sports car in the foreground, chin up, posing for a friend's phone camera. In the background The Protagonist walks past on the sidewalk, unnoticed, eyes ahead.

#Narration: Everybody else chases the look of money. You quietly became the real thing.

#Image: Close-up of a phone held in The Protagonist's hand, the screen showing a plain, unstyled email inbox with one new message at the top, its subject line reading "Money Report", the room behind it out of focus.

#Narration: And here is the strange part. The big number showed up in a boring email.

#Image: A dim gas station convenience store at night, snack racks and a humming drink cooler in the background, a small ATM against the wall. The Protagonist stands alone at the glowing ATM screen, one hand on the keypad, cash sliding out of the slot.

#Narration: No party. No champagne. Just you, standing in a gas station at night, getting cash from a machine.

#Sound: soft electronic beeps of an ATM keypad

#Image: Close-up of a small, scuffed ATM inside a gas station at night, its screen glowing with the words "Out of Cash" in plain text, a receipt slot and worn keypad below, a rack of lottery tickets blurred behind it.

#Narration: It started with a broken machine. Not a big idea. Just a Tuesday.

#Image: A gas station at night, an annoyed customer in a work jacket turning away from the small ATM with both hands thrown up in frustration, the "Out of Cash" screen glowing behind him, the store clerk shrugging at the counter in the background.

#Narration: You stop to get cash. The ATM is empty. Most people get mad and walk away.

#Image: A gas station at night, The Protagonist standing completely still in front of the small broken ATM, head tilted slightly, studying it with a calm, thoughtful expression while the drink cooler glows behind him.

#Narration: You don't. You stop. You look at it a different way.

#Image: A gas station at night, The Protagonist facing the small ATM in the middle of frame, a single glowing question mark floating in a thought bubble above his head, the store's fluorescent lights reflecting on the tile floor.

#Narration: You think one quiet question. Who actually owns this little machine?

#Image: A small living room late at night, curtains drawn, one floor lamp off. The Protagonist sits on a worn couch with a laptop on his knees, face lit blue by the screen, a search results page open, leaning forward and reading closely.

#Narration: You go home. You look it up. It takes forty minutes. Most people would never bother. You did.

#Sound: soft keyboard typing

#Image: Close-up of a spiral notepad resting on a couch cushion at night, a few pencil figures written on it, "$60" and "$300" with "per month" beside them, a phone lying face up next to it, lamp light warm on the paper.

#Narration: You find out one little machine can make sixty to three hundred dollars a month.

#Image: A busy office building hallway in the afternoon, a glowing ATM set into the wall, a short line of people in work clothes waiting, the person in front withdrawing cash, elevator doors opening in the background.

#Narration: It just sits there. It helps strangers all day. And it pays the owner every single time.

#Image: A half-empty parking lot on a gray afternoon, The Protagonist bracing his shoulder against a used ATM as he slides it into the open back of an old SUV, one side of the machine dented and scratched, a folded moving blanket on the ground.

#Narration: So you buy your first machine. Used. A little beat up on one side. Eight hundred dollars.

#Sound: a heavy machine sliding on metal, a car trunk closing

#Music: Light, hopeful acoustic guitar, gentle and simple

#Image: A warm, crowded bar at night, string lights over the counter, people talking at tables in the background. The Protagonist shakes hands with a friendly bar owner in a rolled-sleeve shirt beside the freshly installed ATM against the wall, both smiling.

#Narration: You put it in a busy bar. You fill it with your own cash. You shake hands on a deal.

#Image: Close-up of a spiral notepad on a kitchen table in the morning, the number "$90" circled twice in blue pen, a phone and a cold cup of coffee beside it, sunlight across the wood.

#Narration: The first month, you make ninety dollars.

#Image: A break room in the evening, a tired worker in a warehouse uniform standing at a wall time clock, badge in one hand, reading a paycheck stub with a flat, drained expression, lockers behind him.

#Narration: Ninety dollars. Your friend made more than that last weekend doing one extra shift.

#Image: A small, dim apartment on a Thursday night, The Protagonist sitting alone on the couch, phone in hand, looking at the screen with a calm, blank face, the TV off, a single lamp on in the corner.

#Narration: Nobody claps. Nobody even knows. You sit with the number on a Thursday night.

#Image: Close-up of The Protagonist's face at night, lit softly from the side by a warm lamp, his expression calm and unreadable, eyes steady, the dark room falling away behind him.

#Narration: It doesn't feel like pride. It doesn't feel like a letdown. It's something quieter than both.

#Image: A dim apartment at night, The Protagonist holding the spiral notepad up close, staring at the circled "$90" with quiet focus, the number catching the lamp light, his phone set aside on the cushion.

#Narration: But you don't quit. Because you're not looking at the ninety dollars. You're looking at what the ninety dollars proves.

#Image: A concrete garage in the morning with the door rolled up and daylight pouring in, three used ATMs standing in a neat row, The Protagonist beside them with one hand resting on the nearest machine, quietly proud.

#Narration: It proves the little machine works. So you buy a second one. Then a third.

#Image: Inside an old SUV on an overcast afternoon, The Protagonist at the wheel driving slowly, head turned toward the passenger window, where a long row of orange self-storage doors slides past behind a chain-link fence beside the highway.

#Narration: Now you start watching other boring things the same way.

#Image: A wide view of a self-storage lot on a gray, cloudy afternoon, long rows of orange roll-up doors, cracked asphalt lanes between them, a faded sign at the gate, a single pickup truck parked by one open unit.

#Narration: Not as a customer. But as someone trying to see who owns the thing.

#Image: A self-storage lot in the afternoon, a customer rolling up an orange unit door, cardboard boxes, a mattress and a bicycle stacked inside, a rented van with its rear doors open behind them.

#Narration: You learn a small storage lot can make a lot of money every year. And people always need a place to put their stuff.

#Music: Steady, calm ambient hum, patient and slow

#Image: A self-storage lot at dusk in light rain, orange doors shining wet, a car pulling in with its headlights on while another customer locks a unit, the lot's floodlights flickering on.

#Narration: That need does not go away when times get hard. It just keeps going. Month after month.

#Image: A slightly run-down storage lot on a bright morning, rusted fence posts and faded paint on the doors, The Protagonist standing at the gate holding a clipboard, looking down the rows with a calm, appraising expression.

#Narration: You buy your first storage lot for fifty-five thousand dollars. The fences are old. The cash flow is real.

#Image: Close-up of a cluttered office desk in the afternoon, an old spiral notebook open to pages of messy handwritten numbers, a scratched flip phone lying beside it, a coffee ring stained into the paper.

#Narration: The man who sold it ran the whole place out of a flip phone and a spiral notebook.

#Image: A kitchen at midnight, one lamp lighting the table, The Protagonist sitting with a calculator, a pen and a stack of receipts, writing a figure in a ledger with steady focus, the rest of the room dark.

#Narration: The first year, it nets thirty-two thousand dollars. You don't celebrate. You use it to buy the next one.

#Sound: a pen scratching on paper, a clock ticking softly

#Image: A small back office in the afternoon, a folding table, a filing cabinet and a wall calendar behind it. Karen sits at the table in reading glasses, a thick folder open in front of her, reading with calm, steady attention.

#Narration: Your accountant's name is Karen. She has done books for small businesses for nineteen years.

#Image: Close-up of a battered cardboard shoe box on an office desk in the afternoon, crumpled paper receipts spilling over its sides onto the desk, a calculator half buried under them.

#Narration: She does not get impressed easily. She has seen messy books kept in a shoe box.

#Image: Close-up of Karen's hands turning the pages of a thick folder on a folding table, printed statements and small photos clipped inside, her face above them thoughtful and unhurried, afternoon light from a small window.

#Narration: You hand her a folder. Inside is everything you own. She reads it slowly. She doesn't speak for a while.

#Image: A small back office in the afternoon, Karen looking up from the open folder with a small, flat, dry expression, The Protagonist sitting across the folding table from her, hands folded, waiting.

#Narration: Then she looks up and says, "This is the most boring set of businesses I have ever seen."

#Image: A small back office in the afternoon, The Protagonist at the folding table smiling just slightly, calm and pleased, Karen across from him closing the folder, the filing cabinet and wall calendar behind them.

#Narration: She means it as a small insult. You take it as the best thing anyone has ever said to you.

#Image: Close-up of a folder lying open on a folding table in the afternoon, simple printed pages with small photos clipped to them: a row of ATMs, orange storage doors, a car wash bay, a mobile home park, a line of portable toilets.

#Narration: Here is what's in the folder. A row of cash machines in bars and gas stations. Four storage lots. Three car washes. A mobile home park. And a porta-potty rental company.

#Image: A coin-operated car wash bay on a quiet, sunny afternoon, a sedan inside with soap running down its windows, a customer spraying it with a pressure wand, a coin box on the wall, an empty road beyond.

#Narration: None of it is exciting. None of it makes the news. All of it makes money every single month.

#Sound: water spraying from a pressure wand in a car wash bay

#Image: A small back office in the afternoon, Karen leaning forward over the folding table with her hands open, asking a question, The Protagonist across from her shaking his head no with a mild, settled expression.

#Narration: Karen asks if you want to do something more exciting. Maybe a tech company. Something with big upside.

#Image: A small back office in the afternoon, Karen quietly closing the thick folder on the folding table, a small puzzled look on her face, her reading glasses pushed up, The Protagonist's empty chair across from her.

#Narration: You say no. She nods. She doesn't fully understand it.

#Image: A three-panel split image of small everyday moments in daylight: a customer rinsing a car in a wash bay, a couple carrying boxes into an orange storage unit, a woman pulling cash from an ATM in a hallway.

#Narration: Here is the secret she can't see. Every single thing you own fixes a small problem that never goes away.

#Image: A wide view of a mobile home park at evening under a soft orange sky, neat rows of homes with small porches, a few porch lights coming on, a kid's bike leaning on a fence, a man watering a patch of grass.

#Narration: People always need cash. People always need to store stuff. Cars always get dirty. People always need a place to live.

#Image: A busy construction site on a sunny morning, a clean row of blue portable toilets lined up along a chain-link fence in the foreground, workers in hard hats and a yellow excavator moving dirt in the background.

#Narration: There is no app coming to replace a parking lot. No one is going to out-smart a porta-potty.

#Image: A self-storage lot at dusk, the sky fading from orange to purple, The Protagonist standing alone in the middle of an empty lane between rows of closed orange doors, hands in his pockets, calm and content.

#Narration: The flashy people fight in markets where everyone is watching. You picked the markets nobody watches.

#Music: Slow, steady piano, calm and grounded

#Image: A commercial street at night, a bright trendy boutique on the left with a paper "Closed" sign taped to its dark glass door, and a plain laundromat next door on the right with its lights on and customers folding clothes inside.

#Narration: The quiet ones that just keep running. Long after the exciting thing down the street has closed.

#Image: A crowded house party at night, warm lamps and a kitchen island covered in bottles, a flashy man in a crisp white t-shirt standing in the center of a group, gesturing wide and talking loudly, a fancy cocktail in one hand.

#Narration: There's a man at a party. You've seen his type before.

#Sound: party chatter, ice clinking in a glass

#Image: Close-up of the flashy man's plain white t-shirt at a house party at night, the fabric crisp and perfectly fitted, a tiny embroidered designer logo at the hem, a cocktail glass at the edge of frame.

#Narration: His plain white shirt costs three hundred dollars. You know because you looked it up once.

#Image: A residential street at night, a shiny gray truck with a custom matte wrap and oversized wheels parked crookedly at the curb under a streetlight, party lights glowing from the house windows behind it.

#Narration: He drives a shiny gray truck with a custom wrap. He talks about his money the way some people talk loud in a quiet room.

#Image: A dim residential street at night, an older, plain SUV parked far down the block under a dark tree, a small crack running across its rear bumper, a faint reflection of the party's lights in its rear window.

#Narration: You drove here in a five-year-old SUV with a crack in the back bumper you keep meaning to fix.

#Image: A house party at night, The Protagonist standing by the kitchen doorway at the edge of the crowd, holding a plain glass of water, watching the room quietly, a bowl of chips and a stack of cups on the counter beside him.

#Narration: You wear a fleece from a sporting goods store. It was on sale. Your watch just tells time.

#Image: A house party at night, The Protagonist on the left calmly talking, glass of water in hand, the flashy man on the right in his white t-shirt half-listening, eyes already drifting past The Protagonist's shoulder toward the crowd.

#Narration: When he asks what you do, you say you own a few small businesses. Car washes, mostly.

#Image: Close-up at a house party at night, the flashy man giving a polite, dismissive smile, his body already turning right toward another guest, The Protagonist's shoulder just visible at the left edge of frame.

#Narration: You watch his face do the math. The old car. The fleece. The car washes. He smiles and turns away.

#Image: The front door of a house at night, The Protagonist stepping out onto the porch and pulling the door softly shut behind him, the party's warm light and noise inside, the dark street ahead, nobody following.

#Narration: Good. The moment someone thinks you're small, they stop watching you. And then you can do anything.

#Image: A dark residential street at night, The Protagonist opening the door of his plain old SUV under a streetlight, calm and unbothered, the cracked rear bumper catching the light, the party house glowing far behind him.

#Narration: That's what people get wrong about hiding your money. It isn't shyness. It's armor. You wear it on purpose.

#Image: Close-up inside the old SUV at night, The Protagonist's hand turning the key in the ignition, the dashboard lights coming on, a faded parking permit hanging from the mirror, a worn but clean seat beside him.

#Narration: The old car isn't sad. It's a tool. It starts every morning. And nobody looks at it twice.

#Sound: a car engine starting

#Image: Close-up of a phone screen in a dark car at night, an incoming call from "Marcus" with a friendly contact photo of a smiling man, the green answer button glowing, the dashboard soft behind it.

#Narration: Your best friend since school is named Marcus. He calls on random days just to check in. No reason. Just calling.

#Music: Soft, warm emotional piano, gentle and a little sad

#Image: Inside a parked SUV at night on a quiet street, The Protagonist in the driver's seat with the phone to his ear, listening carefully, brow slightly drawn, streetlight falling across the dashboard.

#Narration: A few months ago, Marcus called. But this time something was underneath his voice.

#Image: A colorful food truck at night parked on a busy street corner, string lights along its awning, Marcus at the serving window handing out a tray, a long line of happy customers waiting under the streetlights.

#Narration: He has a food truck. Good food. A real crowd. He wants to grow. He needs eighty-five thousand dollars.

#Sound: a busy food truck window, food sizzling on a grill

#Image: Close-up inside a dark car at night, The Protagonist's thumb hovering over a large "Send Money" button on his phone screen, an amount of "$85,000" typed above it, the glow lighting his fingers.

#Narration: You could send that money before the call ended. You wouldn't even feel it.

#Image: Inside a parked SUV at night, The Protagonist sitting perfectly still in the driver's seat, eyes closed, phone pressed to his ear, the street empty and dark through the windshield.

#Narration: But you didn't. You sat with the phone against your ear and you just listened.

#Image: A small shop at closing time in the evening, a worried business owner in an apron standing behind the counter, staring down at a pile of unpaid bills stamped in red, the register drawer open and nearly empty.

#Narration: Because money handed to someone who isn't ready doesn't fix the problem. It speeds up whatever is already there.

#Image: A bright kitchen on a Saturday morning, sunlight through the window over the sink, The Protagonist sitting at the table with a spiral notepad and pen, two full coffee mugs steaming, Marcus's chair pulled out beside him.

#Narration: So instead of sending money, you asked to come by Saturday morning.

#Sound: two coffee mugs set down on a wooden table

#Image: A kitchen on a Saturday morning, The Protagonist and Marcus leaning over the table side by side, papers, receipts and a calculator spread between them, The Protagonist pointing at a line with his pen, Marcus frowning in concentration.

#Narration: You sat with him for three hours. You found two leaks in his costs. You asked the hard questions nobody had asked him.

#Image: Close-up of a paper wall calendar in a kitchen, four Saturdays in a row circled in blue pen, a small check mark inside each of the first three, morning light on the page.

#Narration: You came back the next Saturday. And the one after that.

#Image: A kitchen on a Saturday morning, Marcus standing by the table holding up a signed loan agreement with both hands, smiling wide, proud and relieved, The Protagonist seated across from him grinning.

#Narration: By the fourth Saturday, Marcus had a better deal, a small business loan, and a plan that didn't even need your money.

#Image: A small empty storefront at night on a quiet street, its windows still papered over, Marcus standing at the door holding a set of new keys, wiping his eyes with the back of his hand, a phone pressed to his ear.

#Narration: He signed his lease weeks later. He called you the night he got the keys. He was crying a little.

#Music: Soft, hopeful swelling piano

#Image: A dim living room at night, The Protagonist sitting on the couch after a call, phone resting in his lap with the screen dark, smiling quietly to himself, one lamp glowing beside him.

#Narration: He said he couldn't have done it without you. You never told him what you could have written the check for. You probably never will.

#Image: A bright hardware store aisle in the early morning, shelves of copper pipes, PVC fittings and valves on both sides, The Protagonist standing in the middle of the aisle holding his phone, having just pulled it from his pocket.

#Narration: The email comes on a Thursday at 7:12 in the morning. You are standing in the plumbing aisle of a hardware store.

#Sound: quiet hardware store hum, a forklift beeping far away

#Image: Close-up in a hardware store aisle in the morning, The Protagonist's hand holding a blue bottle of drain cleaner, shelves of copper pipes and brass fittings behind it, a price tag hanging from the shelf edge.

#Narration: You're holding a bottle of drain cleaner. One of your car washes has a slow drain.

#Image: Close-up of a phone screen in a hardware store, a plain email notification from "Karen" with the subject line "Money Report. Final." above a preview line of text, the aisle shelves blurred behind it.

#Narration: Your phone buzzes. The subject line says: Money Report. Final. It's from Karen.

#Sound: a soft phone buzz

#Image: A hardware store aisle in the morning, The Protagonist setting the blue bottle of drain cleaner back on the shelf with one hand, eyes locked on the phone in his other hand, his body gone still.

#Narration: You almost put the phone away. But something in the number stops you. You put the drain cleaner down.

#Image: Extreme close-up of The Protagonist's eyes in a hardware store, lit by the glow of the phone screen he is reading, perfectly still, the shelves of pipes soft and out of focus behind him.

#Narration: You read the line twice. The way you read something when you're not sure you read it right.

#Image: Close-up of a phone screen in a hardware store aisle, a plain email with a single large figure at the top reading "$480,000,000" in black text, a few small lines of accounting notes beneath it.

#Narration: Everything you own, added up, has crossed four hundred and eighty million dollars.

#Music: Slow, quiet piano, one held note, calm and weightless

#Image: A wide view of a bright hardware store aisle in the morning, The Protagonist standing alone in the center holding his phone, one small figure among shoppers pushing carts, fluorescent lights running the length of the ceiling.

#Narration: You stand there under the buzzing lights. A forklift beeps in the back. A man two feet away is checking prices on pipe fittings.

#Image: A hardware store aisle in the morning, The Protagonist standing perfectly still with his phone, a shopper walking past behind him without a glance, an older man beside him comparing two pipe fittings, nobody looking his way.

#Narration: Nobody is looking at you. Nobody knows. The store doesn't know. The number just sits there on a screen.

#Image: Close-up of The Protagonist's face in a hardware store aisle under flat white ceiling lights, his expression calm and plain, nothing dramatic in it, shelves of fittings behind him.

#Narration: You thought it would feel different. You thought the world would shift a little. It doesn't.

#Image: A still, wide view of an empty hardware store plumbing aisle in the morning, long shelves of pipes and fittings, fluorescent lights overhead, a forklift visible far down at the end of the aisle.

#Narration: There is just the plumbing aisle, the beeping forklift, and a number on a screen.

#Image: A hardware store aisle in the morning, The Protagonist typing a short reply on his phone with one thumb, his other hand already reaching back toward the blue bottle of drain cleaner on the shelf.

#Narration: You reply with three words. "Thanks. Looks right." Then you pick the drain cleaner back up.

#Sound: soft phone keyboard taps

#Image: A hardware store parking lot in the morning, The Protagonist sitting quietly in the driver's seat of his old SUV, hands resting in his lap, the drain cleaner in a bag on the passenger seat, the store entrance visible through the windshield.

#Narration: In the car, you sit for a minute before you start it.

#Image: A flashback: a dim apartment on a Thursday night eleven years earlier, The Protagonist on a worn couch holding a spiral notepad with "$90" circled on it, a single lamp on, looking at the number with quiet focus.

#Narration: Eleven years ago, you made ninety dollars from a used machine and sat with that number on a Thursday night.

#Music: Soft, reflective piano, slow and warm, the final theme

#Image: A two-panel split image: on the left, an old spiral notepad on a couch cushion with "$90" circled in blue pen under lamp light; on the right, a phone screen in a bright store aisle showing "$480,000,000" in plain black text.

#Narration: This is the same feeling. Exactly the same. Just with more zeros behind it.

#Image: Inside a parked SUV in the morning, The Protagonist looking out the side window toward the hardware store lot, a small, calm, knowing expression on his face, sunlight across the dashboard.

#Narration: And that means the feeling was never about the number. It was about the thing you built.

#Image: A four-panel montage in daylight, each running with nobody watching: a lit ATM in a bar hallway, a car wash bay spraying a sedan, a row of orange storage doors, a line of blue portable toilets at a job site.

#Narration: A quiet system, running the way you made it run. No drama. No clapping. No one watching.

#Image: Inside the old SUV in the morning, The Protagonist with both hands on the wheel, turning the key, the dashboard lighting up, the hardware store's parking lot beyond the windshield.

#Narration: You start the engine. The car wash drain isn't going to fix itself.

#Sound: a car engine starting, then driving away

#Image: A plain two-lane road on a clear morning, fields on either side under a wide blue sky, the old SUV driving away from camera and getting smaller in the distance, the crack in its rear bumper visible.

#Narration: You drive home the same road. Same car. Same crack in the bumper you still haven't fixed.

#Image: A quiet suburban street at evening, the sky soft and orange, ordinary houses with porch lights on, the old SUV pulling into the driveway of a modest house with a small lawn.

#Narration: Nothing on the outside of your life has changed. And nothing will tomorrow either.

#Image: A modest house at dusk, The Protagonist stepping through his front door with a shopping bag in hand, the door swinging softly shut behind him, a warm light on inside, the street outside empty and calm.

#Narration: What's different is quieter than that. And it makes you wonder. What are you really building? And who is it for?
		`,
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
		systemPrompt: dedent`
# Important
- This is an Explainer: every visual is a <video>, and nobody speaks inside them. The narrator carries every word.
- Every video is one continuous shot labelled Shot 1: a single camera setup with at most one camera move. Never add a Shot 2.
- Each person's segment opens on the same portrait grid of everyone in the video, zooming smoothly into that person's portrait.
- Every video in a person's segment shows a white banner at the top reading their name, with dates or ages as small corner text where the narration states them.
- Never describe the real people's looks in the prompts. Their appearance belongs in their character metadata; refer to them by name only.
		`,
		exampleText: dedent`
#Music: Slow, somber documentary piano over a soft string pad, restrained and respectful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Diego Maradona until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Diego Maradona.

#Video: Shot 1: Medium shot, eye level, slow tilt down. A plain white ground with a flat bright green pitch band along the bottom, daylight flat and even. A white banner at the top reads "Diego Maradona". Diego Maradona stands center facing camera, grinning, one arm thrust straight up holding a gold World Cup trophy aloft. As the camera tilts down from the raised trophy to the pitch band, a crowd of fans surges up around his legs, raised arms and cheering hands, a few cameras held up among them. Empty foreground, the pitch band behind. Sound: a stadium crowd roaring, swelling closer as the tilt lands, camera shutters clicking.

#Narration: Diego Armando Maradona (1960) was widely regarded as one of the greatest footballers in history.

#Video: Shot 1: Medium shot, eye level, slow push-in. A plain white ground with a flat bright green pitch band along the bottom, even daylight. A white banner at the top reads "Diego Maradona". Diego Maradona stands center facing camera, eyes closed, small content smile, both arms raised outward to the sides. As the camera pushes in, a light blue Forza Napoli flag pops in planted in the pitch band at the left and a waving Argentine flag, light blue and white bands with a golden sun face, pops in at the right, both rippling. Empty foreground, the pitch band behind him. Sound: two flags snapping in a breeze, a distant crowd chanting in rhythm.

#Narration: He was a symbol of Argentina and Napoli and the 1986 World Cup champion.

#Video: Shot 1: Medium shot, eye level, slow tilt down. A plain white ground with a flat bright green pitch band along the bottom, the light dimmer and grayer than before. A white banner at the top reads "Diego Maradona". Diego Maradona stands center facing camera, shoulders slumped, tired downturned expression. The camera tilts down from his face to his hands at waist height, the left hand holding a large tilted green glass bottle, the right hand cupping a small cluster of white pills, the pitch band blurred behind. Sound: a faint wind, liquid sloshing inside the bottle, pills rattling softly.

#Narration: After retiring in 1997, his health suffered a serious decline due to alcohol and drug use.

#Video: Shot 1: Wide shot, high angle looking down, static. A hospital room with an olive-green wall, a white floor, a pale blue curtain and IV pole at the left, a pale window panel at the right, cool fluorescent light. A white banner at the top reads "Diego Maradona". Diego Maradona lies on a white bed left of center, eyes closed, in a dark gown. A doctor in a white coat, green surgical cap and light blue mask stands at the right of the bed facing camera and raises one arm as a large pink cross-section diagram of a brain appears above the bed, a dark red dot marking the hematoma. The bed rail fills the foreground. Sound: a heart monitor beeping steadily beside the bed, a marker squeaking as the red dot is drawn.

#Narration: In 2020, Maradona underwent surgery to remove a subdural hematoma.

#Video: Shot 1: Medium shot, eye level, slow pan right. A hospital room with an olive-green wall, a white floor, a pale blue curtain and IV pole at the left, cool fluorescent light. A white banner at the top reads "Diego Maradona". Diego Maradona sits up in a white bed at the left, propped on a pillow, facing camera with a drained expression, a gray blanket over his legs. A red-circled callout of red lungs dripping blue fluid appears at the upper right and one of a swollen, misshapen red heart at the lower left, each linked to his chest by a red arrow, as the camera pans right to a dark wall monitor showing an irregular green ECG line. Sound: labored wheezing close by, fluid dripping, the monitor beeping unevenly.

#Narration: In the days following the surgery, Maradona showed serious warning signs: labored breathing, fluid buildup in the lungs, and gradual heart failure.

#Video: Shot 1: Wide shot, eye level, slow pan right. A plain white ground with a flat gray floor band along the bottom, even light. A white banner at the top reads "Diego Maradona". Two nurses in white caps with a red cross, light blue masks and blue scrubs stand side by side at the left facing camera, hands folded. A doctor in a green surgical cap, blue mask and white coat stands right of center, brow furrowed, then turns and walks away to the right with short motion lines behind him toward a simple red-roofed house in the background, the nurses looking after him from the left edge as the camera follows. Sound: a wall clock ticking, shoes clicking away on a hard floor, a door closing in the distance.

#Narration: However, the home medical team failed to recognize the severity. No doctor was consistently present at the house.

#Video: Shot 1: Medium shot, high angle looking down, slow pan right. A bedroom at night, dim warm light from a small lamp, a white pillow and a gray blanket. A white banner at the top reads "Diego Maradona". Diego Maradona lies in the bed at the left of frame, seen from above, eyes closed, still, the gray blanket pulled up to his chest. The camera pans right to a dark monitor on the nightstand, where the green ECG line grows progressively flatter and, below the screen, a dull dark red heart icon gets a black X drawn across it. Sound: slow shallow breathing, the monitor beeps slowing and stretching into one long flat tone.

#Narration: On November 25th, 2020, Maradona suffered cardiac arrest in his sleep at his home in Tigre.

#Video: Shot 1: Wide shot, high angle, static. A hospital room with an olive-green wall, pale blue window panels at the right, a white floor, cool fluorescent light. A white banner at the top reads "Diego Maradona". Diego Maradona lies on a white bed at the left, eyes closed, in a dark gown, a dark wall monitor above the bed showing a flat green ECG line. Three nurses in white caps, blue masks and blue scrubs stand at the right; the nearest leans over him pressing a dark defibrillator pad to his chest with both hands, brow worried, while the other two watch with hands clasped. The bed rail fills the foreground. Sound: a monitor alarm beeping rapidly, a defibrillator whining as it charges, then a hard thump.

#Narration: Emergency services were immediately called and medical personnel performed resuscitation attempts on site.

#Video: Shot 1: Wide shot, eye level, static. A hospital room with an olive-green wall, a white floor, a pale blue curtain and IV pole at the left, cool fluorescent light. A white banner at the top reads "Diego Maradona" and small text in the upper right corner reads "60 years old." Diego Maradona lies on a white bed at the left, eyes closed, a white sheet drawn up to his chest, a small gray wall clock above the bed. A doctor in a green surgical cap and white coat, mask pulled down to his chin, stands beside the bed right of center, lowers his clipboard to his side and bows his head as the clock hand ticks once. Sound: a single loud clock tick, then silence in the room.

#Narration: Despite the intervention, he was pronounced dead shortly after their arrival. He was 60 years old.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat green pitch band along the bottom, flat even light. A white banner at the top reads "Diego Maradona". A faded gray outline-only silhouette of Diego Maradona stands center above the pitch band, facing camera, fading slowly, as three red-circled callouts appear one by one around it, each linked by a red arrow: a tilted green bottle beside a scatter of white pills at the upper left, a dull red heart with black cracks running through it at the upper right, and a clipboard with illegible lines and a red cross at its top at the lower center. Empty foreground. Sound: a low sustained hum, three soft pops as the callouts appear.

#Narration: His death was further aggravated by years of substance abuse, a weakened cardiovascular system, and complications from long-term chronic health conditions.

#Video: Shot 1: Wide shot, low angle, slow pan right. An overcast gray sky over a simple pink government building with white columns and a small dome at the left, a flat gray pavement band along the bottom, muted daylight. A white banner at the top reads "Diego Maradona". A tall flagpole stands center flying the Argentine flag, light blue and white bands with a golden sun face, which lowers slowly to half-mast with a black ribbon tied beneath it, as the camera pans right to a wall calendar at the right edge where three consecutive circled days are crossed out one by one with a black marker. Sound: the flagpole rope squeaking through its pulley, fabric flapping, three marker strokes squeaking on paper.

#Narration: After Maradona's passing, Argentina declared 3 days of national mourning.

#Video: Shot 1: Wide shot, high angle, slow push-in. A city plaza under a pale evening sky, a tall white obelisk with a pointed tip standing center, low gray buildings far in the background. A white banner at the top reads "Diego Maradona". An enormous crowd grows outward from the base of the obelisk until it fills the lower two thirds of the frame, and as the camera pushes in over it the heads resolve into raised arms, small Argentine flags waving, phones and cameras held up, and a wide white banner held overhead near the center reading "D10S". Sound: a vast crowd roaring, drums pounding somewhere in the middle of it, a chant rising and falling.

#Narration: An estimated 1 million people gathered in Buenos Aires to pay tribute to the football legend.

#Video: Shot 1: Medium shot, eye level, slow tilt down. A plain white ground with a flat gray floor band along the bottom, soft even light. A white banner at the top reads "Diego Maradona". Three phone screens pop in one by one in a row across the center, each with a small black ribbon in its corner: a blue club crest with a white "N" on the left, a framed portrait of Pelé in the middle, a framed portrait of Cristiano Ronaldo on the right. The camera tilts down to the gray band, where a row of small red hearts and folded-hands icons floats slowly upward past the phones. Sound: three phone notification chimes one after another, then soft chimes multiplying and overlapping.

#Narration: Clubs and players around the world including SSC Napoli, Pelé and Cristiano Ronaldo expressed their condolences and honored his legacy.

#Music: Slow, somber documentary piano over a soft string pad, restrained and respectful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Diogo Jota until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Diogo Jota.

#Video: Shot 1: Wide shot, eye level, slow push-in. A riverside city skyline at golden hour, a tall iron bridge arch and terracotta rooftops along the left, a river band along the bottom, warm low sunlight. A white banner at the top reads "Diogo Jota" and a small label under the skyline reads "Porto, 1996". A small green and red Portuguese flag waves on a pole at the right. Diogo Jota stands center in front of the skyline facing camera with a small smile, tapping a football up and down with one foot, the ball bouncing on the riverbank as the camera pushes in on him. Sound: river water lapping, the flag flapping, a ball thudding softly against a boot.

#Narration: Diogo Jota was born on December 4th, 1996 in Porto, Portugal, a dynamic forward for Liverpool FC and the Portuguese national team.

#Video: Shot 1: Medium shot, eye level, slow push-in. A plain white ground with a flat bright green pitch band along the bottom marked with a white penalty-box line, even stadium light. A white banner at the top reads "Diogo Jota". Diogo Jota runs center of frame mid-stride, arms out wide, mouth open in a shout of celebration, a red club crest with a small bird outline hanging at the left and a green and red Portuguese crest at the right. Behind him a dark scoreboard's counter climbs quickly and stops at "100+ GAMES" scrawled across it in white as the camera pushes in past his shoulder. Sound: a crowd roaring, a whistle, a scoreboard clacking through numbers.

#Narration: By 2022, he had played over a 100 games for Liverpool and his national team.

#Video: Shot 1: Wide shot, eye level, tracking right. A long gray road with dashed white center lines runs left to right across a flat pale landscape under a clear late-afternoon sky. A white banner at the top reads "Diogo Jota". A sleek low green sports car sits in side profile in the center, Diogo Jota at the wheel facing right, his brother André Silva in the passenger seat beside him, a signpost at the left edge reading "Spain". The car pulls away to the right and the camera tracks with it, dashed road lines scrolling beneath, toward a signpost at the right edge reading "Santander". Sound: an engine idling low then revving up, tires rolling on asphalt.

#Narration: On July 3rd, 2025, Jota and his younger brother André Silva set out from central Spain in a Lamborghini Huracán heading towards Santander, en route to Liverpool.

#Video: Shot 1: Wide shot, eye level, static. Night, a dark navy sky with small white stars and a thin crescent moon over a long gray road that curves away toward the horizon. A white banner at the top reads "Diogo Jota". The green sports car drives small into the distance along the road, two yellow headlight cones flickering ahead of it into the dark, shrinking to a speck of taillights near the horizon, as a small inset panel slides in at the left showing a packed duffel bag and a pair of football boots tied together by their laces. Sound: a lone engine fading into the distance, crickets close by, a faint wind across the road.

#Narration: It was meant to be a quiet journey before preseason training, but it ended in disaster.

#Video: Shot 1: Overhead wide shot, looking straight down, static. Night, a two-lane gray highway with dashed white lines running top to bottom on a dark navy ground. A white banner at the top reads "Diogo Jota". A small clock face at the upper left reads 3:00 with a label "3:00 AM", a green road sign at the upper right reads "A52", a small green Civil Guard badge sits at the lower right. The green sports car drives up the right lane behind a boxy gray van, then swings out into the left lane and draws level with it, following a curved white arrow drawn along its overtaking path, the van holding its lane. Sound: distant traffic humming, an engine rising in pitch, tires humming on asphalt.

#Narration: According to the Spanish Civil Guard, at around 3:00 a.m., Jota's brothers were driving along the A52 highway near Cernadilla while overtaking another vehicle.

#Video: Shot 1: Overhead wide shot, looking straight down, then the camera drops in one move to a medium shot at eye level. Night, a two-lane gray highway with dashed white lines on a dark navy ground, the green sports car out in the left lane alongside the boxy gray van exactly as before. A white banner at the top reads "Diogo Jota". As the camera settles at road level, the car's front left tire bursts into a jagged black shape with fragments flying out, a red-circled callout pointing at it, and the car veers right along curved black motion arrows past a white marker post at the bottom right reading "KM 64", orange and yellow flames rising as it comes to rest. Sound: a loud tire blowout bang, metal scraping and crunching, glass shattering, then fire catching.

#Narration: The Lamborghini Huracán reportedly suffered a tire blowout, veered off the road, and flipped multiple times, and burst into flames near kilometer point 64.

#Video: Shot 1: Wide shot, eye level, static. Night, a dark navy ground and a gray road shoulder. A white banner at the top reads "Diogo Jota". A twisted, blackened car shape, barely recognizable, sits center wrapped in orange and yellow flames, gray smoke curling upward from it. A red fire engine with a flashing blue light pulls up at the left as two firefighters in yellow helmets and reflective-striped coats run in from the right and stop facing the wreck, one raising a hose toward it. Flames fill the foreground; the dark road stretches behind. Sound: fire roaring and crackling close by, boots pounding on gravel, a siren winding down, water hissing onto flames.

#Narration: When emergency services arrived, the car was already engulfed in fire, its frame twisted beyond recognition.

#Video: Shot 1: Medium shot, eye level, slow slide right. Night, a dark navy ground and a gray road shoulder, the same blackened, twisted wreck in the center with the two firefighters in yellow helmets at the right, one holding the hose, exactly as before. A white banner at the top reads "Diogo Jota". As the camera slides right the firefighters pass to the left edge and lower their heads, the slack hose dropping at their feet, the last flames go out with thin gray smoke rising and two small white birds above, and at the right a plain white sheet lies over a low shape on the ground, shown without detail. Sound: embers hissing, water dripping from the wreck, a quiet wind, a distant siren.

#Narration: Firefighters extinguished the blaze, but it was too late. They found the remains of the two brothers inside the wreck, burned beyond recognition.

#Video: Shot 1: Overhead shot, looking straight down, static. Morning, a gray asphalt road surface with a dashed white line and a gravel shoulder along the right. A white banner at the top reads "Diogo Jota". Two long black skid marks draw themselves across the road, curving off toward the shoulder, and a yellow measuring tape extends alongside them with a label reading "30 m". An investigator in a dark jacket crouches at the roadside at the lower right, a clipboard in one hand and a magnifying glass raised in the other, while a small red-circled callout appears at the upper left showing two hands gripping a steering wheel tightly. Sound: a tape measure zipping out, gravel crunching under a knee, a pen scratching on the clipboard.

#Narration: Investigators later found skid marks over 30 m long, suggesting that the driver had tried desperately to regain control in the final seconds.

#Video: Shot 1: Wide shot, eye level, slow pan right. Daytime under a gray sky, a red brick stadium wall with a large painted mural of Diogo Jota, scarves and bunches of flowers piling up along its base. A white banner at the top reads "Diogo Jota". A crowd of fans in red stands with heads bowed facing the mural, some holding red scarves stretched overhead, the flowers filling the foreground. The camera pans right along the wall to Cristiano Ronaldo standing on a flat gray pavement band at the right, a black armband on his sleeve, head lowered, one hand pressed over his heart. Sound: a hushed crowd shuffling, flower wrappings rustling, wind across the stadium, a single sob somewhere in the crowd.

#Narration: The news devastated fans, teammates, and the entire football community, including Portugal's captain, Cristiano Ronaldo, who paid an emotional tribute to his fallen teammate.

#Music: Slow, somber documentary piano over a soft string pad, restrained and respectful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Pelé until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Pelé.

#Video: Shot 1: Medium shot, eye level, slow tilt down. A plain white ground with a flat bright green pitch band along the bottom, bright even daylight. A white banner at the top reads "Pelé" and a small label beside him reads "1940". Pelé leaps center of frame facing camera, one clenched fist raised high, one knee lifted, grinning wide. The camera tilts down from his raised fist to the pitch band, now packed with cheering fans, raised arms and small yellow and green flags waving around his boots. Empty foreground. Sound: a crowd roaring, swelling as the tilt lands, flags snapping.

#Narration: Edson Arantes do Nascimento, known as Pelé, 1940, was regarded as the greatest footballer of all time.

#Video: Shot 1: Medium shot, eye level, slow pan right. A plain white ground with a flat bright green pitch band along the bottom, even daylight. A white banner at the top reads "Pelé". Pelé stands center facing camera with both arms outstretched as three gold trophies pop in one by one in a row above his head, labeled beneath "1958", "1962" and "1970". The camera pans right to a large football resting on the pitch band at the right, a counter scrawled across it climbing fast and stopping at "1,200+ GOALS". Sound: three metallic clinks, one for each trophy, then a counter clicking rapidly upward.

#Narration: He won three FIFA World Cups, 1958, 1962, 1970, and scored over 1,200 career goals.

#Video: Shot 1: Medium shot, low angle, static. A plain white ground with a flat bright green pitch band along the bottom, bright stadium light. A white banner at the top reads "Pelé". Pelé is upside down in the air center of frame performing a bicycle kick, one leg swinging high into a football as curved white motion arcs trace the kick and the ball flies off to the right, then he lands facing camera as three small red-circled callouts appear around him, linked by red arrows, labeled "Technique" at the upper left, "Vision" at the upper right and "Finishing" at the lower right. Sound: a sharp boot-on-ball thump, a crowd gasping, the ball thudding into a net in the distance, three soft pops.

#Narration: His exceptional technique, vision, and scoring ability made him a defining figure in football history.

#Video: Shot 1: Medium shot, eye level, static. A clinic room with an olive-green wall, a white floor and cool fluorescent light. A white banner at the top reads "Pelé". Pelé sits on a white examination bed at the left in a pale hospital gown, facing right, hands in his lap, expression tired. A doctor in a white coat over blue scrubs stands at the right, a stethoscope around the neck and a clipboard in one hand, and raises an arm toward the center, where a large pink cross-section diagram of a colon appears between them with a dark red mass on it labeled "Tumor". Sound: paper crinkling on the exam bed, a marker squeaking as the label draws.

#Narration: In 2021, Pelé was diagnosed with colon cancer.

#Video: Shot 1: Medium shot, eye level, slow pan right. A hospital room with an olive-green wall, a white floor and cool fluorescent light. A white banner at the top reads "Pelé". Pelé sits in a blue reclining chair at the left, facing camera, a blanket over his lap, a clear tube running from his arm up to a drip bag on a metal IV pole beside him that slowly empties, a red-circled callout above him showing a steel surgical tray with a scalpel and forceps. The camera pans right to a row of four chemotherapy bags hanging from a rail, a green check mark appearing beside each one in turn. Sound: an IV pump clicking, a slow steady drip, four soft ticks as the checks appear.

#Narration: He underwent surgery to remove the tumor, followed by multiple rounds of chemotherapy.

#Video: Shot 1: Wide shot, eye level, slow push-in. A city street at dusk, a tall white hospital building with rows of blue windows and a red cross above the door at the left, a small label beneath it reading "São Paulo", a flat gray pavement band along the bottom. A white banner at the top reads "Pelé". The camera pushes in on one lit upper window, where Pelé lies propped up in a white bed facing camera, a clear oxygen tube at his nose, a nurse in a blue mask and scrubs at the bedside with a clipboard, a red-circled callout above him showing pink lungs ringed by small blue virus dots. Sound: an ambulance siren approaching from the right, then oxygen hissing and a monitor beeping as the window fills the frame.

#Narration: Despite initial treatment, early 2022, scans revealed it metastasized in his intestines, lungs, and liver.

#Video: Shot 1: Medium shot, eye level, static. A hospital room with an olive-green wall, a white floor and cool light. A white banner at the top reads "Pelé" and small text in the upper right corner reads "December 3rd, 2022". Pelé lies in a white bed center-left, eyes half closed, a blanket drawn to his chest, a chemotherapy bag hanging from an IV pole at the left. A doctor in a white coat and a nurse in blue scrubs stand together at the right facing the bed; a black X draws itself across the bag while they bow their heads and the doctor's clipboard turns to show a label reading "Palliative care". Sound: a monitor beeping slowly, a marker squeaking across plastic.

#Narration: Later that year on November 29th, Pelé was admitted to Albert Einstein Israelite Hospital in São Paulo for a respiratory infection caused by COVID-19 and for reassessment of his cancer treatment.

#Video: Shot 1: Medium shot, eye level, static. A hospital room with an olive-green wall, a white floor and cool light. A white banner at the top reads "Pelé" and small text in the upper right corner reads "December 3rd, 2022". Pelé lies in a white bed center-left, eyes half closed, a blanket drawn to his chest, a chemotherapy bag hanging from an IV pole at the left. A doctor in a white coat and a nurse in blue scrubs stand together at the right facing the bed; a black X draws itself across the chemotherapy bag while they bow their heads slightly and the doctor's clipboard turns to show a label reading "Palliative care". Sound: a monitor beeping slowly, a marker squeaking across plastic.

#Narration: On December 3rd, 2022, medical reports indicate that Pelé had become unresponsive to chemotherapy and his care was shifted to palliative measures.

#Video: Shot 1: Medium shot, eye level, static. A hospital room with an olive-green wall and dim cool light. A white banner at the top reads "Pelé" and small text in the upper right corner reads "December 21st". Pelé lies in a white bed center, eyes closed, an oxygen tube at his nose, a dark monitor on the wall above him showing a wavering irregular green ECG line. A red-circled callout of a pair of dull, drooping red kidneys appears at the upper left, then a red-circled callout of a swollen, misshapen red heart at the upper right, each linked to his body by a red arrow. Sound: an uneven monitor beep, oxygen hissing, two soft pops.

#Narration: By December 21st, his tumor had advanced further with additional complications including renal and cardiac dysfunction.

#Video: Shot 1: Medium shot, eye level, slow push-in. A hospital room with an olive-green wall and dim cool light, a window with a dark night sky at the right. A white banner at the top reads "Pelé". Pelé lies in a white bed at the left beneath a dark monitor showing a green ECG line, a nurse in blue scrubs and a mask standing beside the bed facing him. The camera pushes in on the window at the right, where a small house with a glowing decorated Christmas tree inside appears faintly in the night, then a black X draws itself across the window pane. Sound: a monitor beeping steadily, faint distant Christmas bells, a marker squeaking on glass.

#Narration: Medical staff determined that he required intensive monitoring and was not allowed to spend Christmas at home.

#Video: Shot 1: Medium shot, eye level, slow pan right. A hospital room with an olive-green wall and soft afternoon light from a window at the right. A white banner at the top reads "Pelé" and small text in the upper right corner reads "1940 to 2022. 82 years old." Pelé lies in a white bed at the left with a peaceful expression, eyes closed, a gray blanket pulled up over him against a white pillow. The camera pans right to a dark monitor on the wall, its green ECG line flattening progressively until it runs flat, and beneath it a small clock face whose hands settle at 3:27 with a label reading "3:27 p.m." Sound: slow monitor beeps stretching into one long flat tone, then a single clock tick.

#Narration: On December 29th, 2022 at 3:27 p.m., Pelé passed away at the age of 82.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat gray floor band along the bottom, soft even light. A white banner at the top reads "Pelé". A faded gray outline-only silhouette of Pelé stands center above the gray band, facing camera, fading slowly, as red-circled callouts appear one by one around it, each linked by a red arrow: dull red kidneys with a black X at the upper left, a dull red heart with a black X at the upper right, a pair of pink lungs shaded dark and heavy at the lower center, and beneath them a colon diagram with a dark red mass labeled "Adenocarcinoma". Empty foreground. Sound: a low sustained hum, four soft pops, the hum fading out.

#Narration: The causes of death were multiple organ failure, including kidney failure, heart failure, and bronchopneumonia, all related to advanced colon adenocarcinoma.

#Music: Slow, somber documentary piano over a soft string pad, restrained and respectful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of José Antonio Reyes until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: José Antonio Reyes.

#Video: Shot 1: Medium shot, eye level, slow pan right. A plain white ground with a flat bright green pitch band along the bottom marked with a white touchline, bright even daylight. A white banner at the top reads "José Antonio Reyes" and a small label beside him reads "1983". José Antonio Reyes stands center facing camera with a small confident smile, flicking a football up from his feet with one boot, as the camera pans right to a small red and yellow Spanish flag waving on a pole planted in the pitch band at the right. Sound: a ball flicked off a boot, a soft bounce, the flag flapping in a breeze.

#Narration: José Antonio Reyes, born 1983, was a prominent Spanish footballer of the early 2000s.

#Video: Shot 1: Medium shot, eye level, slow tilt down. A plain white ground with a flat bright green pitch band along the bottom, even daylight. A white banner at the top reads "José Antonio Reyes". José Antonio Reyes stands center facing camera, both arms raised, as three silver and gold trophies pop in one by one in a row above his head, labeled beneath "Champions League", "La Liga" and "Europa League". The camera tilts down to the pitch band, where three club crests pop in below his feet: a red and white striped crest on the left, a red crest with a cannon in the middle, and a white crest with a crown on the right. Sound: three metallic clinks, then three soft thumps as the crests land.

#Narration: Through his career, he won multiple domestic and European titles, including the UEFA Champions League, La Liga, and Europa League with Sevilla, Arsenal, and Real Madrid.

#Video: Shot 1: Wide shot, eye level, tracking right. A long gray road with dashed white center lines runs left to right through dry scrubby countryside under a pale sun and a few clouds, bright midday light. A white banner at the top reads "José Antonio Reyes". A dark sedan drives in side profile in the center, José Antonio Reyes at the wheel facing right, two relatives seated beside and behind him, a signpost at the left edge reading "Utrera" sliding out of frame as the camera tracks with the car, dashed road lines scrolling beneath and dry roadside bushes passing behind, toward a signpost at the right edge reading "Sevilla". Sound: a car engine humming, tires on asphalt, wind rushing past the car.

#Narration: On June 1st, 2019, Reyes was traveling by car between Utrera and Seville, Spain, accompanied by his relatives Jonathan Reyes and Juan Manuel Calderón.

#Video: Shot 1: Medium shot, eye level, tracking right. Midday, the same gray road with dashed white lines through dry scrub, the same dark sedan in side profile driving right toward Sevilla with José Antonio Reyes at the wheel and two relatives inside, exactly as before. A white banner at the top reads "José Antonio Reyes". The sedan speeds up, long white speed lines streaking behind it, as a red-circled callout of a speedometer appears at the upper left, its red needle at the far end beside a label reading "81 mph", and a second callout at the lower right shows a jagged red crack through a steering column above a wobbling tire with yellow warning marks. Sound: an engine screaming at high revs, wind roaring past, a metallic creak, a tire thumping unevenly.

#Narration: The vehicle reported reaching speeds of 81 mph and had a steering and tire malfunction before the accident.

#Video: Shot 1: Wide shot, low angle, static. Midday, a gray road with dashed white lines running toward camera through dry scrub, a gray metal barrier along the right shoulder. A white banner at the top reads "José Antonio Reyes". The dark sedan, its front tire wobbling, swerves out of its lane along a curved black motion arrow toward the barrier on the right and strikes it, the front end crumpling inward, small black fragments flying outward and sharp white impact lines flashing from the point of contact, the road left empty on the left. Sound: tires screeching on asphalt, a heavy crunch of metal, glass shattering, the barrier ringing.

#Narration: While navigating the road, the vehicle veered off its lane and collided with the roadside barrier. The impact caused deformation of the cabin.

#Video: Shot 1: Medium shot, eye level, slow tilt up. Midday, the same crumpled dark sedan pressed against the bent gray barrier at the right of frame, the last black fragments settling on the road, exactly as before. A white banner at the top reads "José Antonio Reyes". Flames erupt from under the bonnet and spread rapidly over the roof, small orange sparks scattering around the base of the car, and as the camera tilts up thick gray smoke curls upward to fill the top of the frame, a scorched black patch spreading across the roadside gravel below. Sound: a whoomph of ignition, fire roaring close by, glass popping in the heat, smoke hissing.

#Narration: Immediately following the collision, the car ignited, producing an intense fire that engulfed the vehicle within seconds.

#Video: Shot 1: Wide shot, eye level, static. Midday, the blackened wreck of the sedan sits against the bent gray barrier at the center-right, its flames out, thin gray smoke rising. A red fire engine and a white ambulance with flashing blue lights stand at the left. Two paramedics in green uniforms wheel a stretcher from the center toward the ambulance, a figure lying on it under a red blanket with one arm bandaged in white, their heads lowered, the smoking wreck behind them. Sound: sirens winding down, embers hissing, stretcher wheels rattling on asphalt, an ambulance door sliding open.

#Narration: Emergency responders arrived at the scene but found Reyes and Jonathan Reyes already deceased. Juan Manuel Calderón survived but suffered burns and fractures, hospitalized for treatment.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat gray floor band along the bottom, soft even light. A white banner at the top reads "José Antonio Reyes". A faded gray outline-only silhouette of José Antonio Reyes stands center above the band, facing camera, fading slowly, an investigator in a dark jacket at the right holding a clipboard, head lowered. Two red-circled callouts appear one after the other beside the silhouette, each linked by a red arrow: a side-view head outline with a dark red impact mark at the skull labeled "Head trauma" at the upper left, then an outline torso with orange and black scorch marks labeled "Burns" at the lower left. Sound: a low hum, a page turning, two soft pops, the hum fading out.

#Narration: Autopsy and crash reports indicated that José Antonio Reyes sustained severe head trauma and extensive burns which were fatal following the high-speed collision and subsequent fire.

#Music: Slow, somber solo piano over a faint low string pad, sparse and patient, documentary mood

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Emiliano Sala until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Emiliano Sala.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat bright green band along the bottom, a white banner at the top reads "Emiliano Sala". Emiliano Sala climbs three rising steps from left to right, facing the camera and grinning, one arm raised, a white arrow drawing itself upward beside him. As he reaches the top step, a small Argentine flag pops in at the left and a small French flag at the right, both waving. The green band runs behind his feet. Sound: footsteps thudding up the steps, then two soft pops and fabric fluttering.

#Narration: Emiliano Sala, 28, was considered a footballer prodigy, having risen rapidly through the ranks in Argentina and France.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat gray band along the bottom, a white banner at the top reads "Emiliano Sala". Emiliano Sala stands right of center facing the camera, smiling, holding up a blue club shirt while a club official in a dark suit at the left faces him and shakes his hand. A blue crest with a bluebird hangs on the wall behind them. A paper price tag on a string swings in from the right and settles beside them, reading "£15M", as a red ring draws itself around it. Sound: camera shutters clicking in a burst, the tag creaking, a red marker squeaking.

#Narration: He was signed by Cardiff City for a club record transfer fee of approximately 15 million.

#Video: Shot 1: Wide shot, eye level, slow pan right. A clinic room with a pale wall and white floor, a white banner at the top reads "Emiliano Sala". Emiliano Sala stands at the left facing right, arms relaxed, while a doctor in a white coat holds a stethoscope to his chest and a green check mark ticks onto a floating clipboard. The pan carries across the wall to a plain map of northern France and southern Britain, where a dashed white flight path arcs from a dot labeled "Nantes" to a dot labeled "Cardiff", a small plane icon riding it, a calendar below showing "January 21st" circled in red. Sound: a pen ticking on paper, a marker squeaking along the line, a tiny propeller buzz.

#Narration: On January 19th, 2019, after completing a medical examination with Cardiff City, Sala returned to Nantes, France, intending to fly back to Cardiff on January 21st to join his new club's training sessions.

#Video: Shot 1: Wide shot, eye level, slow tracking right. Night, a dark navy sky scattered with small white stars, a white banner at the top reads "Emiliano Sala". A small single-engine aircraft in side profile flies left to right across the upper frame above a band of dark choppy sea with white wave crests filling the lower frame, a dashed white flight path trailing behind it. It flies into a thick bank of gray cloud at the right beside a small island outline labeled "Alderney", and the dashed path breaks off in a large red question mark. Sound: a propeller droning over churning waves, then the drone muffling until only wind and waves remain.

#Narration: On January 21st, 2019, Sala boarded a flight from Nantes to Cardiff. During that flight, the aircraft disappeared over the English Channel near Alderney.

#Video: Shot 1: Overhead wide shot, looking straight down, static. Daytime, open pale blue sea filling the frame, a white banner at the top reads "Emiliano Sala". A search grid of dashed white squares draws itself across the water, a label at the center reads "4,400 km²", a green and white police badge at the left edge, a calendar with three days circled at the upper right. A helicopter then sweeps left to right across the grid, its searchlight cone sliding over the water, three small boats moving in slow lines beneath it, each leaving a thin white wake. Sound: waves rolling below, a marker squeaking per square, then rotor blades thumping and boat engines chugging.

#Narration: Immediate search efforts were launched by the Guernsey police, covering approximately 4,400 km squared over 3 days, but no survivors were found.

#Video: Shot 1: Wide shot, side on cross-section, slow tilt down. A calm blue sea cut in half by the frame, sky above and darker water below, a white banner at the top reads "Emiliano Sala". On the surface a small plane, a helicopter with spinning rotor lines and two boats appear one by one from left to right, each ringed in red with a small label. The camera tilts beneath the surface, where a small yellow remotely operated vehicle descends through dark blue water, its searchlight cone sweeping ahead, a thin black tether trailing up to the boat above. Sound: rotors thumping and a plane droning above, then muffled thrusters and rising bubbles.

#Narration: Following this, private searches continued, employing multiple aircraft, helicopters, boats, and remotely operated underwater vehicles, ROVs.

#Video: Shot 1: Wide shot, high angle, slow push in. A gray overcast morning on a curved sandy beach along the bottom of frame, blue waves washing in from the upper left, a white banner at the top reads "Emiliano Sala" and "January 30th" is written in the upper right corner. Debris appears on the sand one piece at a time: two pale seat cushions ringed in red, a torn strip of white panel, a scatter of small dark fragments. Two investigators in dark jackets walk in from the right and crouch over the cushions, one lifting a fragment into a clear evidence bag as the camera settles on them. Sound: waves washing onto sand, gulls overhead, the bag crinkling, wet sand shifting.

#Narration: On January 30th, debris from the aircraft, including seat cushions, were located along the French coast.

#Video: Shot 1: Wide shot, side on cross-section, static. Dark blue water beneath a gray sky, a white banner at the top reads "Emiliano Sala" and "February 3rd" is written in the upper right corner. A search vessel sits on the surface at the center and lowers a sonar unit on a cable, curved white sonar arcs pulsing down from it toward a faint gray shape half visible on the seabed at the bottom of frame. An inset panel at the upper left shows the vessel's sonar screen, a green line sweeping the dark display, a bright blip appearing at its lower edge on each pass. Sound: sonar pings echoing through the water, a winch cable paying out, electronics humming.

#Narration: A dedicated underwater search commenced on February 3rd using sonar equipment.

#Video: Shot 1: Wide shot, eye level, slow push in. Deep dark blue water, a white banner at the top reads "Emiliano Sala". A small yellow ROV descends from the top of frame toward a flat gray seabed, a dashed depth scale at the left labeled "63 m / 205 ft", a label at the right reading "Hurd's Deep", a small clock face above reading "21:00". As the camera closes in, the ROV's searchlight sweeps left to right across the seabed and lands on a small aircraft, wings snapped, half settled into the sediment, and a red circle draws itself around the wreck. Sound: muffled thrusters and slow bubbles, then the thrusters slowing and a faint metallic tick as the light crosses the hull.

#Narration: At 2100 hours, the wreckage of the aircraft was located at a depth of 63 m or 205 ft in the northern Hurd's Deep.

#Video: Shot 1: Wide shot, eye level, static. A gray morning on flat gray water, a white banner at the top reads "Emiliano Sala" and "February 7th" is written in the upper right corner. A recovery vessel sits at the left, its crane arm extended over the side, cable rising slowly from the sea, two crew members in orange jackets on deck facing it. A stone dock and a building labeled "Portland" stand at the right in the background. The crane swings a stretcher covered with a plain white sheet, shown without detail, onto the deck at the center, and the two crew bow their heads either side of it. Sound: the winch grinding then stopping, water lapping the hull, gulls far off.

#Narration: On February 7th, the body was recovered from the aircraft wreckage and transported to Portland for investigation.

#Video: Shot 1: Medium shot, straight on, slow push in. A plain white ground, a white banner at the top reads "Emiliano Sala". A large fingerprint with looping black ridges sits at the center ringed in red as a magnifying glass slides across it, a badge labeled "Dorset Police" at the left, a police officer in a dark uniform at the right facing the print with a clipboard. Two small fingerprint cards slide in from either side, linked to the center print by red arrows, and lock into place as a green check mark stamps between them. Sound: glass sliding over paper, two soft clicks, a stamp thud.

#Narration: The Dorset police later confirmed through fingerprint analysis that the body was Emiliano Sala.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat gray band along the bottom, a white banner at the top reads "Emiliano Sala". A faded gray outline of Emiliano Sala stands at the center facing the camera while a report page with a red stamp slides in at the left, "February 11th" written beneath it. Two red-ringed callouts appear in turn, linked to the outline by red arrows: at the upper left a side view of a head with dark red impact marks labeled "Head trauma", at the upper right an outline torso with dark red marks labeled "Torso trauma". Sound: a rubber stamp thudding onto paper, a page turning, two soft pops.

#Narration: The post-mortem examination released on February 11th determined that Sala had died from trauma to the head and torso sustained in the crash.

#Music: Quiet, slow piano with a soft cello line, subdued and respectful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Gary Speed until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Gary Speed.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat bright green band along the bottom, a white banner at the top reads "Gary Speed" and "1969" is written beside him. Gary Speed stands at the center facing the camera, smiling calmly, a captain's armband on his sleeve, under a hanging banner reading "500+ Premier League matches". Four club crests pop in one by one around him, a white crest, a blue crest, a black and white striped crest and a red dragon crest, as he keeps smiling at the camera. Sound: a distant stadium crowd murmuring, four soft pops in turn.

#Narration: Gary Speed, born in 1969, was a legendary Welsh midfielder who played over 500 Premier League matches and captained Leeds United, Everton, Newcastle United, and the Wales national team.

#Video: Shot 1: Wide shot, eye level, slow push in. A daytime touchline, a flat green band with a white line along the bottom, a row of empty dugout seats behind, a white banner at the top reads "Gary Speed". Gary Speed stands right of center facing the camera with his arms folded and a small serious smile, a red Welsh dragon flag waving on a small pole at the left. A tactics whiteboard on a stand at the right grows in frame as the camera closes in, white arrows and circles drawing themselves across its pitch diagram one after another. Sound: the flag flapping in a light wind, a marker squeaking on the board.

#Narration: After retiring from professional football, he became the head coach of the Wales national team.

#Video: Shot 1: Wide shot, eye level, slow pan right. A bright TV studio at the left with a panel behind a sofa reading "BBC One", a studio light hanging above, a white banner at the top reads "Gary Speed". Gary Speed sits on the sofa facing a TV camera on a tripod whose red light blinks on. The pan leaves the studio for a quiet suburban road under a low orange evening sun, where a dark car drives left to right toward a small house with a pitched roof and a closed garage door labeled "Huntington, Cheshire", a small clock face in the upper right reading "5:00". Sound: a camera light clicking on, then tires rolling on tarmac and an engine slowing.

#Narration: On November 26th, 2011, Speed appeared as a guest on BBC One's Football Focus. Later that day, at around 5:00 p.m., he drove home to his residence in Huntington, Cheshire, England.

#Video: Shot 1: Medium shot from behind Louise, eye level, static. Dawn under a flat gray sky, the front of the same house with its closed gray garage door large in the center of frame, a white banner at the top reads "Gary Speed" and a small clock face in the upper right reads just before "7:00". Louise stands before the garage door with her back to the camera, shoulders drawn tight, places one hand on the handle, turns it, and the door begins to lift, the frame holding on her back with nothing of the interior visible. Sound: early morning birds, the handle clacking, the door groaning as it starts to rise.

#Narration: The following morning, just before 7 a.m. on November 27th, 2011, Speed's wife, Louise, opened the door to the garage and she found her husband hanging.

#Video: Shot 1: Medium shot, side on at eye level, slow push in. The gray driveway in front of the house at dawn, a white banner at the top reads "Gary Speed". Louise kneels at the center facing left, a phone pressed to her ear, her free hand raised to her mouth, small blue teardrop marks at her cheeks and shaky motion lines around her trembling shoulders. A red-ringed emergency call icon pulses beside the phone. The gray house stands behind her, the open garage a plain dark rectangle with no detail inside. Sound: her ragged breathing, a phone line ringing out, then a click and a faint operator's voice too far to make out.

#Narration: Shocked and trembling, she called emergency services immediately.

#Video: Shot 1: Medium shot, eye level, static. A gray concrete floor, a white banner at the top reads "Gary Speed". Louise kneels at the center facing right, a phone set down on speaker beside her with small sound arcs pulsing from it, both hands reaching toward a plain gray sheet-covered shape on the floor beside her, shown without any detail, her brow raised and teardrop marks at her cheeks. A round wall clock hangs on the wall behind her at the right, its second hand sweeping steadily around the face. Sound: the phone speaker crackling, the wall clock ticking loudly.

#Narration: Following the guidance of the rescue operator, she cut Gary down, letting his body fall to the floor as she desperately tried to help him while waiting for paramedics.

#Video: Shot 1: Wide shot, eye level, slow pan right. The gray driveway at dawn, a white banner at the top reads "Gary Speed". A white ambulance pulls up at the left, blue lights flashing, back doors swinging open, two paramedics in green uniforms climbing out and hurrying toward the open garage at the right, shown as a plain dark rectangle. Red-ringed callouts pop in above them as the pan follows: a ticking stopwatch labeled "8 minutes", a thermometer with a blue bulb labeled "Pale and cold", and at the garage edge two hands pressing down beside a clock face labeled "20 minutes". Sound: a siren cutting off, doors banging open, boots on tarmac, a bag valve mask hissing from the garage.

#Narration: An ambulance crew arrived within 8 minutes. One paramedic later told the inquest that Speed was pale and cold when they reached him, but the team still attempted resuscitation for 20 minutes.

#Video: Shot 1: Wide shot, eye level, slow pan right. A plain white ground with a flat gray band along the bottom, a white banner at the top reads "Gary Speed". The two paramedics in green uniforms stand at the left facing the camera with heads lowered, a folded gray sheet on the floor beside them. The pan crosses to a wooden courtroom bench at the right where a coroner in a dark robe sits behind a gavel and a stack of papers under a label reading "Inquest, January 30th, 2012". Two red-ringed callouts appear between them, linked by red arrows: a tangle of dark lines labeled "Pressure", then two small figures turned away from each other. Sound: one paramedic exhaling, papers shuffling, a gavel set down softly.

#Narration: Despite their efforts, there was no response. On January 30th, 2012, an inquest heard that the pressure of the management had put some strain on his marriage and that he and Louise had argued the night before his death.

#Music: Low, somber ambient drone with a slow oud melody, still and mournful

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Suleiman al-Obeid until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Suleiman al-Obeid.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat bright green band along the bottom, a white banner at the top reads "Suleiman al-Obeid" and "1984" is written beside him. Suleiman al-Obeid stands at the center facing the camera, smiling warmly, a football resting under his foot, a small Palestinian flag waving on a pole at the left. A scoreboard at the right climbs digit by digit and stops at "100+ GOALS" as he turns his head toward it. Sound: the flag flapping, the ball rolling gently under his boot, the counter clicking upward and a final clunk.

#Narration: Suleiman al-Obeid was born in 1984 and was a great footballer in Gaza. Over his career, he scored more than 100 goals at the club level and on the national team.

#Video: Shot 1: Medium shot, eye level, slow tilt up. A plain white ground with a flat bright green band along the bottom, a white banner at the top reads "Suleiman al-Obeid". Suleiman al-Obeid stands at the center facing the camera with his arms spread wide and a broad smile, while a small crowd of fans gathers around him from both sides with raised arms and beaming faces, several holding small Palestinian flags. The camera tilts up as a banner unfurls above him reading "The Palestinian Pelé" and a red circle draws itself around the words. Sound: fans cheering close by, small flags fluttering, cloth unrolling.

#Narration: To Palestinian fans, he wasn't just a footballer. He was the Palestinian Pelé.

#Video: Shot 1: Wide shot, eye level, slow pan right. Daytime under a pale gray sky with dust drifting across the frame, a white banner at the top reads "Suleiman al-Obeid". A row of damaged buildings with missing walls and jagged roof edges stretches across the frame, gray rubble piled at their bases, a broken street in the foreground. The pan passes a cracked water pipe and a snapped power line hanging loose, then an empty market stall with bare shelves, as red X marks stamp themselves over the pipe and over a bare crate. Sound: wind blowing dust, the power line creaking, water dripping from the pipe, two sharp stamps.

#Narration: Due to the ongoing war which had devastated infrastructure and cut off regular supplies.

#Video: Shot 1: Wide shot, eye level, slow push in. Daytime, dust drifting under a pale gray sky, a white banner at the top reads "Suleiman al-Obeid" and "August 6th, 2025, southern Gaza" is written in the upper right corner. A long winding line of civilians carrying empty containers and bags stretches from the foreground toward the horizon, Suleiman al-Obeid standing patiently near the front at the left, facing right toward an aid pallet stacked with white sacks under a tarp at the right, a crate with a red cross at its base. The camera closes slowly on him as the line blurs behind. Sound: shuffling feet, containers knocking together, the tarp flapping, quiet voices in the line.

#Narration: On August 6th, 2025, al-Obeid stood in a long line of civilians in southern Gaza waiting for a rare delivery of humanitarian aid.

#Video: Shot 1: Slow pull back from the same medium shot of Suleiman al-Obeid waiting near the front of the line at the left, facing right toward the aid pallet and tarp at the right, to a wide shot of the whole aid distribution point, dust drifting under a pale gray sky, a white banner at the top reads "Suleiman al-Obeid". Sharp white burst lines and jagged on-screen text reading "Crack" flash across the upper frame, and the crowd scatters outward from the center, some dropping flat with arms over their heads, others running left and right with dust puffs at their feet, the pallet holding at the right. Sound: a loud crack echoing across open ground, a burst of gunfire in the distance, screams, running feet, containers clattering.

#Narration: A loud crack echoed across the aid distribution point followed by a burst of gunfire. People dropped to the ground or ran for cover.

#Video: Shot 1: Slow push in from the same wide shot of the scattering crowd to a medium shot, dust drifting, a white banner at the top reads "Suleiman al-Obeid". Three faint overlapping stages of Suleiman al-Obeid fade in one after the other at the center: upright with a small red mark at his chest ringed in red, staggering with one hand reaching out, then lowered to the ground. Two civilians crouch low in the dust at the right, take him under the arms and pull him behind the aid pallet at the right edge, its stacked sacks as cover. Sound: a distant gunshot, a body falling onto dirt, boots scraping, sacks shifting, gunfire far off.

#Narration: A moment later, al-Obeid was struck by a bullet to the chest. He staggered, tried to stay upright, then collapsed as others pulled him behind an aid pallet.

#Video: Shot 1: Wide shot, eye level, slow pan right. Daytime, dust drifting under a pale gray sky, a white banner at the top reads "Suleiman al-Obeid". A white ambulance sits stalled far off at the left behind a mound of gray rubble on a broken road, its blue light dim, as a red X draws itself across the road in front of it. The pan crosses the open ground to a small group of civilians kneeling with heads lowered around a still figure beside the aid pallet at the right, a clock face between them with its hands turning, labeled "Minutes". Sound: an idling engine and a siren far away, wind, then quiet weeping close by.

#Narration: With ambulances unable to reach the site immediately, al-Obeid succumbed within minutes.

#Video: Shot 1: Medium shot, eye level, slow pull back. A plain ground with a faint warm glow and a flat gray band along the bottom, a white banner at the top reads "Suleiman al-Obeid". A faded gray outline of Suleiman al-Obeid stands at the center facing the camera with both arms spread wide as if shielding, several smaller figures gathered close behind him in his shadow, a red-ringed callout pointing to his outstretched arms. As the camera widens, the figures step around the outline with their hands over their hearts while the outline slowly fades from the frame. Sound: footsteps shuffling close together, soft wind, a single quiet breath.

#Narration: People who recognized him later said he was trying to shield others in the crowd moments before he collapsed.

#Music: Soft, slow piano with a light harmonium drone, tender and reflective

#Video: Shot 1: Wide shot, straight on, slow zoom. A grid of eight framed portraits fills an off-white background, two rows of four, each in a thick black frame with a soft drop shadow, a name label under each portrait: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The grid holds for a beat, then the camera zooms smoothly into the portrait of Peter Biaksangzuala until it fills the frame. Sound: a soft paper rustle as the portrait fills the frame.

#Narration: Peter Biaksangzuala.

#Video: Shot 1: Medium shot, eye level, static. A plain white ground with a flat bright green band along the bottom, a white banner at the top reads "Peter Biaksangzuala" and "23 years old" is written beside him. Peter Biaksangzuala stands at the center facing the camera, grinning, tapping a football back and forth under one foot. A map outline of northeast India pops in at the right with a shaded region labeled "Mizoram" and a small Indian flag beside it, while a club crest labeled "Bethlehem Vengthlang FC" pops in at the left. Sound: the ball tapping against his boot, two soft pops.

#Narration: Peter Biaksangzuala was a 23-year-old midfielder from Mizoram, India. Regarded as one of the region's most promising young players, he played for Bethlehem Vengthlang FC in the Mizoram Premier League.

#Video: Shot 1: Medium shot, eye level, static. A daytime pitch, a flat bright green band with a white goal line along the bottom, a white goal net at the right, a white banner at the top reads "Peter Biaksangzuala" and "October 14th, 2014" is written in the upper right corner. Peter Biaksangzuala stands at the left facing the goal as a football flies along white motion lines from his foot into the back of the net, then throws both arms up with his mouth open in a shout as a scoreboard above the goal flips to read "1-1". Sound: a boot striking the ball, the net swishing, a crowd roaring, the scoreboard clacking over.

#Narration: On October 14th, 2014, during a league match against Chanmari West FC, he scored an equalizing goal.

#Video: Shot 1: Tracking shot, eye level, following right and slowing to static. The same daytime pitch, a bright green band with a white corner arc and a corner flag at the right, a white banner at the top reads "Peter Biaksangzuala". Peter Biaksangzuala drops his raised arms beside the "1-1" scoreboard and sprints left to right toward the corner flag, arms pumping, grinning, motion lines behind him, a small red-ringed inset in the upper right showing a player mid-somersault labeled "Miroslav Klose". At the flag, a curved white dashed arc draws itself up and over from his feet, showing the somersault he intends. Sound: studs pounding on grass, a distant crowd roaring, a marker squeaking along the arc.

#Narration: Immediately after the ball crossed the line, he ran towards the corner flag and attempted a celebratory somersault inspired by German striker Miroslav Klose.

#Video: Shot 1: Medium shot, eye level, slow push in. The same turf by the corner flag at the right, the dashed arc and the Klose inset fading, a white banner at the top reads "Peter Biaksangzuala". Three faint overlapping stages of Peter Biaksangzuala fade in one after the other: launching into the somersault, rotating short as the arc breaks off in red, then landing head first on the turf as sharp white impact lines flash. The camera closes on him lying motionless on the grass, eyes closed, the corner flag behind him, a red-ringed callout pointing to a small jagged mark at his neck. Sound: a heavy thud on turf, a crowd gasping then falling silent, a single whistle.

#Narration: His rotation was miscalculated and he landed head first on the turf. The impact caused his neck to buckle sharply and he collapsed without getting back up.

#Video: Shot 1: Slow pull back from the same medium shot of Peter Biaksangzuala lying motionless on the green turf, eyes closed, arms at his sides, the neck callout fading, a white banner at the top reads "Peter Biaksangzuala". One teammate kneels beside him at the left with a worried brow while two others stand behind and wave both arms urgently toward the touchline at the right, where two medics in white run onto the pitch carrying a stretcher between them toward the group. Sound: studs shuffling on grass, a shout for help, running feet, the stretcher frame rattling.

#Narration: Teammates quickly signaled for medical assistance as he lay motionless.

#Video: Shot 1: Medium shot, eye level, slow push in. A hospital room with an olive-green wall and a white floor, a white banner at the top reads "Peter Biaksangzuala". Peter Biaksangzuala lies flat on a white bed at the left in a white neck brace, eyes closed, while a doctor in a white coat over blue scrubs stands at the right facing the bed, holding up a scan film. A large pink cross-section diagram of the upper spine and skull appears between them, labeled "Cervical spine", jagged dark red cracks spreading across the top vertebrae and a red band shading through the cord as the camera closes on it. Sound: a monitor beeping steadily, the scan film rattling, a soft crack as each fracture appears.

#Narration: He was transported to a nearby hospital where doctors diagnosed a critical cervical spine injury. Scans revealed fractures to the upper cervical vertebrae and severe spinal cord trauma.

#Video: Shot 1: Wide shot, eye level, static. An intensive care room with an olive-green wall, a white floor and a drawn curtain at the left, a white banner at the top reads "Peter Biaksangzuala". Peter Biaksangzuala lies in a white bed at the center in a white neck brace, eyes closed, a ventilator tube taped at his mouth running to a boxy gray machine beside the bed with small dials and a cycling green display. A nurse in a blue mask and blue scrubs stands at the right facing the bed, clipboard in hand, watching the dark monitor above it where a green ECG line and a wavy blue line trace across. Sound: the ventilator hissing and clicking in rhythm, steady monitor beeps, a pen clicking.

#Narration: He was placed in an intensive care unit supported by mechanical ventilation and continuous neurological observation.

#Video: Shot 1: Medium shot, eye level, slow pan right. The same hospital room with an olive-green wall, a white banner at the top reads "Peter Biaksangzuala". Peter Biaksangzuala lies in the white bed at the left in a neck brace with the ventilator tube at his mouth, eyes closed, as a red-ringed callout appears above him showing a surgical tray with a scalpel, small metal plates and screws, labeled "Stabilization", then a spine diagram with a flat black line down it, labeled "No response". The pan carries to a wall calendar at the right as five days are crossed out one by one in black marker. Sound: the ventilator hissing, instruments clinking on a tray, a marker squeaking five times.

#Narration: Despite emergency treatment, including surgical stabilization, his neurological condition did not improve. Over the next five days, complications related to respiratory failure and spinal cord damage persisted.

#Video: Shot 1: Medium shot, eye level, static. The same hospital room with an olive-green wall, a white banner at the top reads "Peter Biaksangzuala". Peter Biaksangzuala lies in the white bed at the center with his eyes closed, a doctor and a nurse standing at the foot of the bed at the right with heads lowered, a dark monitor above the bed showing a shallow, weakening green line. Two red-ringed callouts appear in turn, linked to the bed by red arrows: at the upper left a hand and a foot with a black X over each beside a small reflex hammer, labeled "No motor function", at the upper right a spine and nerve diagram with a black X across it. Sound: monitor beeps slowing, two soft taps of the reflex hammer.

#Narration: Medical staff reported no recovery of motor function or reflexes.

#Video: Shot 1: Medium shot, eye level, slow tilt down. The same hospital room with an olive-green wall, a white banner at the top reads "Peter Biaksangzuala" and "October 19th, 2014. 23 years old." is written in the upper right corner. Peter Biaksangzuala lies in the white bed at the left with a peaceful expression, eyes closed, a gray blanket pulled up against a white pillow, while the dark monitor at the right shows a green ECG line growing flatter until it goes flat. The camera tilts down to a chair beside the bed where a folded football shirt lies neatly with a football resting against its leg, and holds there. Sound: monitor beeps slowing into a single flat tone that fades, leaving the quiet hum of the room.

#Narration: On October 19th, 2014, he was pronounced dead due to cervical spinal cord injury and resulting systemic complications.

#Music: Warm, gentle piano resolving upward, quiet hope, short outro

#Video: Shot 1: Wide shot, straight on, slow tilt down. An off-white ground as a grid of eight framed portraits appears one by one across the upper frame, thick black frames with soft drop shadows, each labeled beneath with its name: Diego Maradona, Diogo Jota, Pelé, José Antonio Reyes, Emiliano Sala, Gary Speed, Suleiman al-Obeid, Peter Biaksangzuala. The camera tilts down below the finished grid to a red subscribe button on the off-white ground as a white cursor arrow slides in, hovers and clicks it, and a small speech bubble pops in beside it reading "Which story next?". Sound: eight soft taps as the frames land, a mouse click, a soft pop as the bubble appears.

#Narration: If you like this video, don't forget to subscribe and tell me which story you want next. Thanks for watching and see you in the next one.
		`,
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
		systemPrompt: dedent`
# Important
- Write the script as if writing a Stickman-style explainer video about the topic in the user prompt.
- This is an Explainer: every visual is a <video>, and nobody speaks inside them; the narrator carries every word.
- Every video is one continuous shot labelled Shot 1: a single camera setup with at most one camera move. Never add a Shot 2.
- The on-screen presenter is always called Host, referenced by name only, and Host is in the character list of every video he appears in.
		`,
		exampleText: dedent`
#Music: Light, quirky ukulele and pizzicato strings, playful and a little sarcastic

#Video: Shot 1: Medium shot at eye level, static. A plain white space with a single ground line, flat even light. A YouTuber stands center facing camera, holding up a chunky phone at chest height and grinning; the phone shows a fat button reading "CREATE" with a sparkle on it. A giant soup ladle pushes out through the phone screen, swings down to the right and dumps lumpy gray-green stew into a pig trough shaped like a red play button on the ground at right, and as the trough fills the YouTuber pinches their nose with their free hand, cheeks puffed out. Phone and trough in the foreground, empty white space behind. Sound: a wet slurp as the ladle pushes through the glass, then stew splattering into a metal trough, a nasal squeak.

#Narration: There is now an AI slop generator built into the YouTube Create app, allowing YouTubers to generate AI slop for YouTube, on YouTube.

#Video: Shot 1: Wide shot at eye level, slow push-in. A plain white space with a single ground line, flat even light; a small wooden stage sits center. Slop stands center stage facing camera, wobbling and blinking, then flinches under a barrage of tomatoes, splattered red, eyes squeezed shut. A crowd of viewers holding popcorn fills the left, a crowd of creators holding cameras and microphones fills the right, both facing the stage and hurling tomatoes. Above the stage a scoreboard reads "LIKES 3" on the left and "DISLIKES" on the right, its counter spinning upward past "9,000,000". Crowds in the foreground at both edges, the stage behind them. Sound: tomatoes splatting on the stage close by, a crowd booing on both sides, the counter's digits clacking over.

#Narration: This is despite the fact that AI generated media is almost universally despised by viewers and creators alike.

#Video: Shot 1: Medium shot at eye level, slow push-in. A plain white desk in a plain white space, flat even light. A laptop sits open center with an old hand-crank meat grinder bolted to the top of its screen and a yellow sticky note on the screen reading "make them argue about AI". Host stands to the right of the desk facing the laptop, holding Pip in one hand and Dot in the other, both tiny and squirming, then lowers them into the grinder's hopper; both wave their little arms in alarm and look up at Host as the crank begins turning on its own. Laptop in the foreground, Host just behind it. Sound: the laptop fan whirring softly, the crank squeaking, tiny panicked squeaks from inside the hopper.

#Narration: I gave the app two of my characters and asked it to make a video of them arguing about whether AI is good for humanity.

#Video: Shot 1: Close-up on the grinder's hopper, exactly where the last video ended: Pip and Dot disappearing into it, the crank turning, Host's hands drawing back. The camera slides down the laptop to the grinder's outlet on the white desk, where two figures squeeze out badly wrong and land facing each other: Pip with seven fingers on a raised hand and a mouth slid onto its cheek, Dot with a face melting off its head like warm ice cream while gesturing confidently, their shirt colors swapping halfway down. A caption strip along the bottom of the frame reads "AI IS DANGERUOS" in wobbly misspelled letters, glitching mid-word. Outlet in the foreground, the laptop screen behind. Sound: the crank grinding, a wet drip onto the desk, a digital stutter on every glitch.

#Narration: AI is dangerous and will be the end of us. Nonsense, it is the evolution of humanity. But the risks. The benefits are limitless. Maybe you're right. Okay, cool.

#Video: Shot 1: Medium shot at eye level, static. Host sits center in a desk chair at the white desk in a plain white space, flat even light, facing camera, slumped low with a flat-line mouth. He gives one slow thumbs-down at the laptop to his left and blinks once, very slowly. On the desk to his right an hourglass labeled "JOB SECURITY" trickles its last few grains beside a torn-off calendar page. The laptop's edge and the hourglass in the foreground, empty white behind. Sound: the desk chair creaking, sand hissing through the neck of the hourglass.

#Narration: That was absolutely terrible, and my job is safe for another few months.

#Video: Shot 1: Wide shot, straight on, slow push-in. A giant browser window fills a plain white space, flat light; it is crammed edge to edge with fat colorful buttons, each stamped with a sparkle. New sparkle buttons pop in and shove the video player down to a postage-stamp rectangle in the bottom right corner, and buttons spill out over the window frame and pile up on the floor. Viewer stands tiny in front of the window at bottom center, facing it, leaning in and squinting through a magnifying glass at the tiny player, buttons piling around Viewer's feet. Viewer in the foreground, the wall of buttons behind. Sound: rapid bubbly pops as each button lands, buttons clattering onto the floor like plastic tiles.

#Narration: Still, YouTube is overflowing with AI features that nobody asked for.

#Video: Shot 1: Medium shot at eye level, slow tilt down. A tall vending machine labeled "INSPIRATION" in bold letters on its front stands center in a plain white space with a single ground line, flat light. Creator stands at its left side facing the machine, feeding a stack of old video rectangles into a coin slot one by one, hopeful. The tilt lands on the dispensing tray at the machine's base, where identical thumbnails tumble out over and over, each the same crude shocked open-mouthed face with a red arrow and a red circle, piling up until Creator's legs at the left are knee-deep in duplicates. Machine in the middle ground, the pile in the foreground. Sound: a coin-slot whir and clunk for each video, thumbnails clattering out and slapping onto the pile.

#Narration: The inspiration tab, for example, automatically generates new video ideas and thumbnails based on your previous content.

#Video: Shot 1: Wide shot at eye level, static. A factory conveyor belt runs across a plain white space, flat light, with three stations: a sparkle-covered machine at left, Creator seated at a keyboard in the middle typing prompts, and an "UPLOAD" chute at right. A giant hand reaches down from the top of the frame, plucks Creator out from between the machines like a Jenga block and drops them into a bin marked "MIDDLEMEN" in the foreground right; Creator looks up, startled, as the two machines slide together to close the gap and the belt speeds up without missing a beat. Belt and bin in the foreground, blank white behind. Sound: the belt rattling, keyboard keys clacking, a thump as Creator lands in the bin.

#Narration: It seems inevitable that YouTube will eventually cut out the middleman and just generate these videos themselves, without having a human creator write the prompts.

#Video: Shot 1: Medium shot at eye level, static. A round table in a plain white space, flat light. Tube stands behind the table at left wearing an apron, facing right, cutting a big round cake with a knife; the larger slice is marked "55%" and Tube slides it across the table to Creator, who sits at the right end facing Tube, pleased. Creator lifts the slice and it transforms in a small arrow loop into a tripod, a light and a microphone, which spin back around into a fresh cake on the table, while Tube keeps the smaller slice on its own plate, arms folded. Cake in the foreground center. Sound: a knife slicing through sponge, a plate sliding on wood, a soft pop for each transformation.

#Narration: YouTube currently gives 55% of the ad revenue earned by long-form videos back to creators, which encourages and funds the production of new content.

#Video: Shot 1: Wide shot at eye level, slow pan right, opening exactly where the last video ended: the fresh cake center on the round table in a plain white space, Tube standing at left with its small slice, Creator's chair at right now empty with a dotted outline where they sat. Tube leans over and swallows the entire cake in one enormous bite, cheeks bulging, eyes wide, as the pan drifts right to a long low server building with a chimney on the ground line behind the table, where a small fork shovels a bite of cake into a furnace door labeled "GPUs", the door flaring orange and an electricity meter on the wall spinning so fast it blurs. Table in the foreground, the server building behind. Sound: a huge wet gulp, the plate rattling, the furnace roaring behind the door, the meter's dial whirring.

#Narration: Replacing human creators with an internal AI slop generator would allow YouTube to keep 100% of that revenue, minus the cost of running the slop generator in a data center.

#Video: Shot 1: Medium shot at eye level, static. A small dinner table in a plain white space, flat light. Viewer sits at the table center facing camera in a bib, cutlery in both fists, delighted. Tube in a little bow tie stands at right facing Viewer and sets down a proper burger on a plate, then swaps the plate again and again, each worse: a burger with a sparkle stuck in it, then a plain bowl of gray-green mush. Viewer beams identically at every one and digs in. Plate in the foreground, empty white behind. Sound: plates clinking as they swap, cutlery tapping, a spoon scraping the bowl.

#Narration: If they can get viewers comfortable consuming AI slop, they can eventually make the jump to generating it themselves and keep 100% of the platform's ad revenue.

#Video: Shot 1: Wide shot at eye level, static. A whiteboard on a stand in a plain white boardroom, flat light, at the left of frame. An executive stands at its right side facing the board and writes an equation stroke by stroke with a marker: a small drawing of a human creator, a minus sign, then a fat green arrow going up and a bag of money. Four executives sit at a long table in the right half of frame facing the board and, eyes closed, nod in perfect unison as each stroke lands. Table in the foreground, whiteboard behind. Sound: a marker squeaking on the whiteboard, four chairs creaking in time.

#Narration: On the surface, this seems to make rational business sense.

#Music: Low, slow synth drone with a ticking pulse, uneasy and dystopian

#Video: Shot 1: Wide shot, slightly low angle, slow push-in. A gray city square under a flat overcast sky, midday, dim light. Enormous screens on every building flicker in unison showing Slop. Rows of identical figures in matching jumpsuits stand in the square facing up at the screens with blank flat-line mouths; one small figure sits apart on a curb at the right drawing in a sketchpad, then looks up. A monument shaped like a red play button stands on a plinth at center, and a thick black crack creeps up the plinth as the camera closes in. Figures in the foreground, the monument center, screens above and behind. Sound: an electric buzz from the screens echoing off the buildings, stone cracking.

#Narration: However, I believe that not only is YouTube's decision to embrace AI dystopian and morally wrong, it could completely destroy them as a business.

#Video: Shot 1: Wide shot at eye level, static. A couch in a plain white living room, flat light, at the right of frame. Three viewers sit on the couch facing camera and lick their bowls completely clean; the middle one has a gray-green mustache of mush and holds the bowl out toward camera for seconds with enormous pleading eyes. At left a large drawing of a nauseated viewer stands on an easel with a big red X over it. Host stands in the near left corner facing camera with a hand over his face, shoulders sagging. Bowls in the foreground, the easel behind Host. Sound: loud slurping and licking, a bowl scraping, Host's long sigh.

#Narration: Not because people will get sick of watching AI slop. In fact, I think YouTube will probably have the opposite problem.

#Music: Mock-regal brass fanfare over a bouncy tuba, pompous and playful

#Video: Shot 1: Wide shot at eye level, static. A wooden throne on a dais center in a plain white throne room, flat light. Tube lounges on the throne wearing a lopsided gold crown, one leg over the armrest, facing down, not looking up. Three small rival boxes charge the foot of the dais and comically fail: one marked with a music note swings a bent sword at the dais step, one with a black X runs into the side wall, one with a blue f gets its head stuck in a bucket, while Tube's dangling leg swings idly above them. Rivals in the foreground, throne behind. Sound: Tube humming to itself, a sword clanging, a thud against the wall, a bucket clonk.

#Narration: Right now, YouTube is the undisputed king of user-generated long-form video, despite the best efforts of TikTok, X and Facebook to dethrone them.

#Video: Shot 1: Aerial wide shot, high angle, static. A packed stadium under a clear noon sky, every seat filled with tiny bouncing heads, a banner across the far stands reading "2 BILLION". On the green pitch below, a dump truck labeled "20 MILLION A DAY" on its side backs up to the edge of the pitch and tilts its bed, tipping a landslide of video rectangles across the field. Rectangles spreading across the pitch in the center, stands rising all around. Sound: a roaring crowd applauding, distant air horns, the truck's reversing beep, thousands of rectangles clattering onto grass.

#Narration: YouTube has over 2 billion logged-in monthly users, and over 20 million videos are uploaded to the platform every day.

#Video: Shot 1: Wide shot at eye level, slow push-in. A playground roundabout center on gravel in a plain white space, flat daylight. A ring of creators holding cameras stand around it pushing, facing the hub; a ring of viewers holding phones sit on it facing outward, riding. A thick black arrow loops from the pushers to the riders and back. The roundabout spins faster and faster, creators and viewers blurring at the edges, while Tube sits dead center at the hub facing camera with eyes closed and arms folded, dozing. Gravel in the foreground, the roundabout in the middle ground. Sound: metal creaking, sneakers scuffing on gravel, the bearing squealing, a soft snore.

#Narration: If you're a creator making long-form videos, you put them on YouTube because that's where all the viewers are. And if you're a viewer, you watch stuff on YouTube because that's where all the creators are.

#Video: Shot 1: Wide shot from the back of the house, slightly high angle, static. A brand-new theater, house lights low, a fresh "OPENING NIGHT" banner over the stage. A single hopeful creator performs center stage facing rows of empty red seats as a tumbleweed rolls down the aisle and the spotlight shrinks around them. Through the glass doors at the right edge of the frame, a crowd of viewers outside glances in, shrugs in unison, and walks past toward a warm glow off frame right. Empty seats in the foreground, the stage far behind, the glass doors at right. Sound: footsteps echoing on the stage, the tumbleweed scraping, the crowd's muffled chatter through glass.

#Narration: It's almost impossible for a new platform to break into this market, because they need viewers to attract creators, and they need creators to attract viewers.

#Video: Shot 1: Medium shot at eye level, static. A warm banquet hall at night, candlelight, a long table groaning with food center. Tube sits at the head of the table wearing its lopsided gold crown, facing camera, surrounded by creators and viewers eating happily, steam rising off the feast. Over the door behind them a brass plaque reads "COMPETITIVE ADVANTAGE". At the window at the back of the hall, three scrawny rival boxes with ribs showing through their cardboard sides press their faces to the pane and hold out empty bowls, their faces slowly sliding down the glass. Feast in the foreground, the window behind. Sound: cutlery clinking, cheerful chewing, a fire crackling in a hearth, a bowl clinking against the pane outside.

#Narration: YouTube already has both, allowing them to starve out any new competition. In my opinion, this is YouTube's primary competitive advantage.

#Music: Sparse, uneasy electric piano with a slow heartbeat kick, ominous but light

#Video: Shot 1: Wide shot at eye level, static. A phone stands giant on the ground line center in a plain white space, flat light, its screen facing camera showing a grid of nine thumbnails: eight are featureless copies of Slop with "90%" scrawled across them in red marker, one at the bottom right is a small human face looking nervous. A grifter in wraparound sunglasses stands at right facing the phone, whistling, shoveling more copies of Slop into the grid with a spade until the last human thumbnail is buried. Spade and shoveled blobs in the foreground, the phone behind. Sound: a spade scraping, blobs splatting onto the screen, tuneless whistling.

#Narration: Now imagine a future where 90% of the content you watch on YouTube is AI slop generated by the platform itself, or by low-effort grifters.

#Video: Shot 1: Tracking shot at eye level, following Viewer left to right along a plain counter in a plain white space, flat light. Two identical bowls of gray-green mush sit side by side on the counter; the left price card reads "+ 6 ADS", the right reads "NO ADS, HAS FRIENDS" with a little heart and a chat bubble drawn on it. Viewer strolls in from the left with hands in pockets, whistling, glances at the left bowl, glances at the right, and walks to the right bowl without breaking stride, picking it up. Bowls in the foreground, empty white behind. Sound: footsteps on tile, whistling, a bowl lifted off the counter.

#Narration: If another app came along offering the same slop but with fewer ads or better social features, why not make the switch? What keeps users on YouTube in the age of slop?

#Video: Shot 1: Medium shot at eye level, slow push-in. A control panel on a pedestal in a plain white space, flat light. Tube stands at the panel center facing camera, one finger pressing a big red button labeled "REPLACE THE CREATORS", looking pleased with itself. Directly behind Tube stands a much larger button labeled "REPLACE YOUTUBE", and an enormous hand lowers from the top of the frame toward it; Tube's smile freezes and a sweat drop swells on its face as it senses the shadow. Panel in the foreground, big button in the background. Sound: a button click, a low rumble as the hand descends, a single sweat drop plinking on the panel.

#Narration: If human creators can be replaced, YouTube can be replaced.

#Video: Shot 1: Medium shot at eye level, static. The wooden throne center in a plain white throne room, flat light. Tube sleeps on the throne wearing its lopsided gold crown, facing camera, chin on chest. Behind the throne a white box with a swirl on its front wobbles on a stepladder, reaching up with one hand to lift the crown, fingertips almost touching it, while its other hand holds a phone showing an endless vertical feed of Slop copies, thumb swiping. Throne in the foreground, ladder behind. Sound: the ladder creaking, a soft snore, the feed's swipes ticking past.

#Narration: OpenAI has already shown their willingness to take on YouTube and TikTok with their app Sora, which lets users generate AI slop and scroll through the slop that other people have generated.

#Video: Shot 1: Medium shot at eye level on the stepladder scene behind the throne, exactly where the last video ended: the swirl box reaching for the crown with one hand, phone swiping in the other. Host steps in from the right, facing the scene, and slams a big hand-lettered card reading "SCRATCH THAT" down over it; the card then drops away to reveal the ladder collapsed on the floor, the swirl box yanking its own power cord out of a wall socket at right with the plug popping free, a small headstone at left reading "SORA", and a receipt unspooling endlessly from a cash register in the foreground and running out of frame. Card and register in the foreground, the throne behind. Sound: the card slapping down, the plug popping out, the receipt rattling out of the register, a ladder rung clattering.

#Narration: Wait, no. Scratch that. While I was editing this video, OpenAI announced that they're actually shutting down Sora, presumably because it was a massively unprofitable waste of computing power.

#Video: Shot 1: Wide shot at eye level, slow push-in. A small graveside on a grassy rise under a gray sky, a headstone center reading "SORA". A ring of tech-company boxes in black ties stand around it facing the stone, heads bowed, each scribbling in a tiny notepad in unison. The push-in lands on the nearest notepad, which reads "TRY AGAIN, BUT BIGGER", as the box holding it looks up past the page with a hungry grin. Grass in the foreground, blank gray sky behind. Sound: pens scratching, wind across the grass.

#Narration: Hopefully, other AI companies will learn a lesson from that. But it won't just be AI giants coming for YouTube's throne.

#Video: Shot 1: Wide shot at eye level, static. A cookie factory in a plain white space, flat daylight, with a bolted-on new wing at right covered in sparkles. An executive stands at the wing's hopper labeled "$40 MILLION", facing it, shoveling bundles of cash in. At the far right end of the machine a small TV set sits on a crate playing an advert on loop in which Slop lovingly cradles a round sandwich cookie, and below it an accountant sits on a stool facing an open ledger, quietly crying, tears pooling on the page. Hopper and TV in the middle ground, factory behind. Sound: a shovel scraping, cash thumping into the hopper, the tiny TV speaker crackling, sniffling.

#Narration: Oreo's parent company, Mondelez International, has already spent over $40 million developing their own AI video generator, which they plan to use to pump out slop TV advertisements.

#Video: Shot 1: Wide shot at eye level, slow pan left to right. An open-plan office in flat daylight where all the employees are candy: a gumdrop in a tiny headset nodding at its screen at left, a lollipop with a face spinning in an ergonomic chair center, a candy cane pointing at a monitor at right, under a wall poster reading "SYNERGY". The pan ends on the candy cane's monitor, where a rendering progress bar fills from left to right beside a picture of Slop. Desks in the foreground, the poster on the back wall. Sound: an office chair squeaking as it spins, keyboards tapping, a completion chime.

#Narration: Even candy companies can now build their own AI slop generators.

#Video: Shot 1: Wide shot at eye level, static. A downhill slope from top left to bottom right built from descending price tags, each crossed out and rewritten smaller than the last, in a plain white space, flat light. Tags drop away as a swarm of tiny startup go-karts careens down the slope toward a castle with a red play button on its gate at the bottom right, each kart flying a little flag reading "BETTER FEED", "BETTER SLOP" or "FEWER ADS". Slope in the middle ground, castle in the background. Sound: go-kart engines buzzing and whining higher, tags flapping as they fall, flags snapping in the wind.

#Narration: As video generation models get cheaper and more efficient, smaller and smaller startups will be able to make a play for YouTube's market share, competing to offer the best features, the best recommendations, and the best slop.

#Video: Shot 1: Medium shot at eye level, static. A thick tree branch stretching left to right against a plain white sky, flat daylight, the trunk at left. Tube sits cheerfully on the outer end of the branch at right, facing left, sawing through it with a handsaw on the trunk side of itself; sawdust puffs and the branch begins to bow. Viewer stands on the ground line below the branch at right, facing up, and Tube leans down to hand Viewer a pamphlet reading "SLOP IS FINE!", which Viewer reads and nods at, content. Branch in the foreground, Viewer below. Sound: the handsaw rasping back and forth, wood creaking, paper rustling.

#Narration: By teaching their viewers that watching slop is okay and creators don't need to be human, YouTube is destroying their own competitive advantage.

#Video: Shot 1: Wide shot at eye level, static. A castle with a red play button over its gate in a plain white space, flat daylight; the drawbridge is down over a dry cracked moat. A parade of rival boxes strolls straight in from the left wheeling suitcases, one checking a map, while Tube stands on the battlements above the gate waving a tiny white handkerchief. Host stands in the bottom right corner of the frame facing camera and gives a sarcastic double thumbs-up straight at camera, one eyebrow rising. Host in the foreground right, the moat and castle behind. Sound: suitcase wheels rattling over wooden planks, the handkerchief flapping.

#Narration: Without the protective factor of their massive pool of human creators, YouTube is going to face meaningful competition for the first time in decades. Good luck with that.

#Video: Shot 1: Wide shot at eye level from the stands, static. A huge stadium under a gray sky, every seat vacant, confetti drifting down anyway. Tube stands alone at center field facing camera, holding up a solid green pie chart marked "100%", grinning at nobody, while a "100%" balloon tied to its wrist quietly deflates and droops. A crow perches on the goalpost at right, then lifts off and flaps away. Empty seats in the foreground, field beyond. Sound: wind echoing through empty stands, confetti pattering on plastic seats, the balloon hissing flat, wings beating.

#Narration: And sure, in a slop-based future, they will get to keep 100% of their ad revenue, but only if there's anyone left watching.

#Video: Shot 1: Wide shot at eye level, static. A vast gray-green sea of mush heaving slowly in thick wobbly ridges under a flat white sky, thousands of copies of Slop bobbing all the way to the horizon. Creator sits in a little rowboat rocking among them center, facing camera, holding a camera in one hand and a fishing rod labeled "VIEWS" in the other, the empty hook swinging above the surface, face hopeful. Ridges of mush in the foreground, the endless sea behind. Sound: thick mush sloshing against the hull, the boat creaking, the line creaking.

#Narration: AI content generation is obviously terrible for human YouTubers, who will have to compete for views with an ocean of slop.

#Video: Shot 1: Wide shot at eye level, slow pull-back, opening exactly where the last video ended: Creator in the rowboat center holding the camera and the "VIEWS" rod, the empty hook swinging over the gray-green mush. The pull-back reveals the same mush sea under a flat white sky and, at right, a corporate tower with a red play button on its roof sunk up to its third floor and tilting, where four executives stand in a loose circle holding briefcases and carry on a meeting, one pointing at a flipchart on an easel whose green arrow keeps climbing as the roof tilts a little more under them. Rowboat small in the foreground left, tower behind right. Sound: steel groaning, mush gurgling around the tower, the flipchart page flapping.

#Narration: But in the long term, it's also potentially catastrophic for YouTube, the company.

#Video: Shot 1: Slow push-in from a medium shot at eye level on a gilded picture frame hanging center in a plain white space, flat light. Inside the frame is a warm sunlit town square at golden hour: Tube in a beret stands at left and respectfully hands a paintbrush to a human artist on a pedestal at center beneath a banner reading "MADE BY HUMANS", while at the edge of town in the background a torch-and-pitchfork mob chases Slop from left to right and off the gilded edge of the frame. Frame in the foreground, blank white around it. Sound: birdsong inside the frame, torches crackling, running footsteps, Slop squelching away.

#Narration: One obvious solution to all this would be for YouTube to viciously suppress AI content on their platform, inflame the existing slop hatred among viewers, and encourage them to celebrate human-made art instead.

#Video: Shot 1: Medium shot on the gilded frame, exactly where the last video ended, the mob running off its right edge, then pulling back to a wide shot at eye level of Host's white desk in a plain white space, flat light. Host has fallen off his chair at center, legs in the air, one hand slapping the floor, "HA HA HA" scrawled in the air beside him, then climbs back into the chair and sits perfectly still and dead-eyed, staring straight into camera with hands flat on the desk. Behind him the gilded frame crumples into a ball and drops into a wastebasket at right. Host in the foreground. Sound: a hand slapping the floor, paper crumpling, a thunk into the bin, then only the faint hum of the laptop.

#Narration: Ha ha ha. Yeah, they're not going to do that.

#Music: Deadpan lo-fi beat, dry drums and a lazy bass, resigned and wry

#Video: Shot 1: Wide shot at eye level, slow pan left to right. A boardroom in flat light with a whiteboard on the back wall, where drawings appear one by one, each sketched out and dated: the sinking tower, the dry moat and the empty stadium. Four executives sit at a long table below it, facing camera, backs to the board, ignoring it: one yawns enormously, one checks a watch, one eats a sandwich, and the last has a video playing at 2x speed on a laptop he is not looking at. Table in the foreground, whiteboard behind. Sound: a marker squeaking on the board, a yawn, a watch clicking, chewing, a laptop speaker buzzing at double speed.

#Narration: Nothing I've said in this video is new information to the higher-ups at YouTube.

#Video: Shot 1: Medium shot at eye level, slow push-in. Viewer sits tipped back in a chair center in a plain white space, flat light, facing up, with a giant funnel in their mouth. Tube stands at the right edge of the frame facing Viewer, holding the funnel as gray-green mush glugs down it from a bucket, wincing apologetically with eyes darting sideways, while a much larger hand from off frame right tightens around Tube's arm and forces it to keep pouring. Funnel in the foreground, the big hand at the right edge. Sound: thick glugging, the chair creaking, knuckles creaking as the grip tightens.

#Narration: The reason that they will continue to force AI slop down our throats, even though it could eventually destroy their business, is that they have no choice.

#Video: Shot 1: Tracking shot at eye level, moving left to right along a plain suburban street in flat daylight, a single ground line and a picket fence behind. Goog pushes a stroller down the street facing right, enthusiastically shaking a sparkle-covered rattle over it. Tube sits strapped inside the stroller facing forward, kicking its legs in protest and scowling. Stroller in the foreground, fence in the background. Sound: the rattle shaking, stroller wheels squeaking, Tube's kicks thumping the footrest.

#Narration: YouTube is owned by Google, and Google is one of the leading developers of generative AI.

#Video: Shot 1: Wide shot at eye level, slow tilt up a huge wall chart in a plain white space, flat light. The tilt starts on a single wooden prop with a sparkle painted on it, planted on a stack of server boxes, bowing under its load as a small crack in it widens, then rises up the steep green line it holds aloft as the line climbs higher across the chart. An investor stands off to the right at the chart's base, facing up at the line with dollar signs for eyes, ignoring the prop entirely. Server boxes in the foreground, the chart towering behind. Sound: the servers humming, wood creaking, a splinter cracking, coins jingling in the investor's pocket.

#Narration: AI slop may one day kill YouTube, but it's also propping up Google's stock price, and forms a key part of their overall growth strategy.

#Video: Shot 1: Wide shot at eye level, static. A family dining room at evening, warm lamplight, a long dinner table center. Goog looms at the left end facing right, arm outstretched, pointing sternly down at a plate of gray-green mush set in front of Tube, who sits in a booster seat at the right end facing left. Tube pushes the plate away with both hands and Goog's hand firmly pushes it back; Tube holds up a crayon drawing of humans painting, singing and filming higher and higher, and Goog never looks at it. Plate and table in the foreground. Sound: a chair creaking, the plate scraping back and forth on wood, paper rustling.

#Narration: Google is heavily reliant on AI, so they can't have one of their own subsidiaries rejecting it and fighting for a future where human culture stays human.

#Video: Shot 1: Medium shot at eye level, static. The stone steps of a courthouse in flat daylight, tall columns behind. A figure in a stars-and-stripes top hat stands behind Goog at center and performs the Heimlich maneuver; Goog doubles over and coughs up a round blue-and-green browser icon that arcs across the frame to the left and bounces away down the steps. Tube stands at the right edge of the frame unnoticed, facing up, whistling at the sky, with a crown half-stuffed into its pocket. Steps in the foreground, columns behind. Sound: a heaving cough, a rubbery bounce on stone steps, tuneless whistling.

#Narration: The US government previously tried to force Google to spit out Chrome, but it seems to me that YouTube is the far more obvious antitrust case.

#Video: Shot 1: Medium shot at eye level, slow tilt down. A plain white space with a single ground line, flat light. Two crowned figures are handcuffed together at the wrist and strain to walk away from each other: at left a magnifying glass over a search bar leaning left, at right Tube leaning right, the cuffs going taut between them, while an enormous hand-lettered question mark grows in the air above the chain. The tilt lands at ground level on a tiny lawyer standing between their feet, who shrugs at camera with both palms up, a briefcase on the ground. Chain above, the lawyer in the foreground. Sound: the handcuff chain rattling and snapping taut, the briefcase clasp clicking.

#Narration: These are massive, unrelated businesses with opposing commercial interests. Why does the search monopoly own the video sharing monopoly? Who knows?

#Music: Curious, wandering marimba and light strings, speculative and hopeful

#Video: Shot 1: Wide shot at eye level, static. A plain white space with a single ground line, flat light. An enormous thin-skinned bubble with a sparkle floating inside drifts slowly from left toward a needle mounted on a wall at right. Tube crouches just around the corner of the wall at the far right, out of the bubble's sight, with a broom in one hand and a sign reading "WE ALWAYS HATED SLOP" tucked under its arm, peeking out and edging the sign into view. Bubble in the middle ground, wall and Tube at right. Sound: a faint wobbling hum from the bubble drawing closer, the broom bristles scuffing the floor.

#Narration: Maybe YouTube will start suppressing slop once the AI bubble pops.

#Video: Shot 1: Medium shot at eye level, static. Dark blue water fills the frame, dim underwater light. Tube thrashes at center facing camera, wide-eyed, while a swarm of small startup piranhas, little colored boxes with fins and one angry eye each, dart in from every side and bite; bits of Tube's gold crown drift up and away through the water, and one tiny piranha with a napkin tucked into its fin takes a bite at the frame edge. Bubbles in the foreground, murky blue behind. Sound: water churning and splashing, jaws snapping, a crunch, bubbles gurgling upward.

#Narration: Or maybe they'll be eaten alive by smaller startups once slop becomes widely accepted.

#Video: Shot 1: Wide shot at eye level, slow push-in. An auction house at night, warm chandelier light, an auctioneer's block center. A podcaster stands on the block holding a microphone, facing the room, looking extremely comfortable. Rows of rival platform boxes fill the seats in the foreground facing the block, shooting up numbered paddles with increasingly absurd figures scrawled on them. The push-in lands on Tube at the back of the room at right, facing the block, turning its wallet upside down as a single moth flutters out and away. Seats in the foreground, Tube at the back right. Sound: paddles swishing up, a gavel hammering, the wallet flapping open, moth wings fluttering.

#Narration: Maybe we'll see a repeat of the podcast and streamer bidding wars, with top human talent being poached away from YouTube.

#Video: Shot 1: Medium shot at eye level, slow pan right. A stage in a plain white space, flat light. A boxy robot with a flat screen for a face stands center facing camera, its screen cycling through enormous shocked open-mouthed faces while it flings handfuls of cash, drawn as copies of Slop, into a roaring crowd in the foreground with hearts floating over their heads. The pan drifts right to Creator sitting alone on a stool in the bottom right corner facing camera, wearing a "100% HUMAN" badge with no audience at all, until the stool slides out of frame to the right. Crowd in the foreground left, the stage behind. Sound: the crowd roaring, blobs splatting, servos whirring, the stool legs scraping the floor.

#Narration: Or maybe AI Mr Beast will be so compelling that these platforms will drop human creators altogether.

#Video: Shot 1: Wide shot, low angle, static. The wooden throne topples center in a plain white throne room, flat light. A figure in a dark purple cape stands on the toppling throne facing camera, planting a flag reading "NO SLOP" and sailing free tickets into a cheering crowd in the foreground, while the gold crown rolls away from the throne across the floor to the right and comes to rest in a puddle. One tidy little ad banner floats politely off to the right. Crowd in the foreground, throne behind. Sound: wood crashing, a flagpole thunking into wood, the crowd cheering, the crown clattering and rolling, a small splash.

#Narration: Maybe Nebula will ban AI content from their platform, launch an ad-supported free tier, and overthrow the tyrant king.

#Video: Shot 1: Medium shot at eye level, static. A plain white space, flat light, with an enormous corporate poster on the wall behind, in cheery bubble lettering reading "BRING BIG IDEAS TO LIFE" and "FUEL IMAGINATION". Host stands at left facing camera, sheepishly rubbing the back of his head, while a winged yellow lightbulb flaps upward off the ground at right. The poster's bottom right corner peels away from the wall and gray-green mush oozes out from behind it onto the floor, unnoticed by Host. Host in the foreground, poster behind. Sound: little wings flapping, paper peeling, mush plopping onto the floor.

#Narration: Or maybe I'm entirely wrong, and AI will help YouTubers bring big ideas to life and fuel imagination, as YouTube seems to believe.

#Video: Shot 1: Medium shot at eye level, slow tilt down. A plain wooden shelf on a white wall, flat light, a hand-lettered "?" above it. On the left a bloated milk carton with green stink lines wafting off it, a fly in a tiny gas mask hovering beside it adjusting its mask; on the right a dark wine bottle with a neat label and a small gold medal hanging from its neck. The tilt lands on an empty comment box on the wall below the shelf, a cursor blinking inside it. Shelf in the foreground, blank wall behind. Sound: the fly buzzing close by, the cursor's soft tick.

#Narration: If you're watching this video in 5 years, comment below whether it aged like milk or wine.

#Video: Shot 1: Wide shot at eye level, slow push-in. A tiny island center in the middle of the gray-green mush sea under a flat white sky, just big enough for Creator, a tripod and a camera. Creator stands on it facing camera, sleeves rolled up and jaw set, and hammers a flag reading "HUMAN MADE" into the ground with three firm strikes, not budging as the mush rises from their shoes to their ankles. Mush ridges in the foreground, tripod at left, the sea to the horizon behind. Sound: mush lapping at the island's edge, three hammer blows on the flagpole, mush gurgling higher.

#Narration: And if you're a YouTuber making real human content, good luck. You're going to need it.

#Music: Warm, upbeat acoustic guitar and hand claps, friendly outro

#Video: Shot 1: Medium shot at eye level, slow pan right. A plain white space with a single ground line, flat light. Host stands at left facing camera, waving with one hand. Beside him a guest illustrator raises an oversized marker like a staff, a small star doodle spinning beside their head and an arrow pointing down at them. The pan continues along a row of supporters lined up at the right facing camera as comically enormous hats pop onto their heads one by one, the biggest hat, with two blinking eyes and a small antenna, glancing around the room by itself. Host and the illustrator at left, the row stretching right. Sound: the marker swishing through the air, the star doodle chiming softly, a pop for each hat, a tiny robotic whir as the big hat looks around.

#Narration: Thank you to Star for guest illustrating this video, and thank you to my backers on Patreon, especially those in the big sentient hat tier, for supporting the channel.

#Video: Shot 1: Medium shot at eye level, static. A plain white space with a single ground line and a small scribbled sun in the sky behind, flat light. Host stands center facing camera, waving both arms overhead, eyes curved into happy arcs; a marker cap and a closed sketchbook lie on the ground beside his feet. A whiteboard eraser then sweeps in from the left and wipes the whole drawing away, Host and sun and ground line, leaving blank white. Host in the foreground. Sound: Host's sleeves rustling, a cheerful little bell, the eraser squeaking across the board.

#Narration: I'm Siliconversations. Thanks for watching. See you all next time. Bye for now.
		`,
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
