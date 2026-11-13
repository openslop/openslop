import { dedent } from "@/lib/dedent";
import { templateAsset } from "../template-asset";
import type { Template } from "../templates";

export const povFinancialLifestyle: Template = {
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
			avatar: templateAsset("pov-financial-lifestyle-5"),
		},
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
- The Protagonist is already one of the characters: use him like a regular character in the story.
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
};
