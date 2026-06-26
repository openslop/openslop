import dedent from "dedent";
import { type Template, templateAsset } from "./types";

export const povFinancialLifestyle: Template = {
	id: "pov-financial-lifestyle",
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
			avatarUrl: templateAsset("pov-financial-lifestyle-5"),
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
};
