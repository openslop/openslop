import { dedent } from "@/lib/dedent";
import { templateAsset } from "../template-asset";
import type { Template } from "../templates";

export const trueCrime: Template = {
	id: "true-crime",
	length: "5-10m",
	name: "True Crime",
	promptPrefix: "A true crime story about",
	color: "#8A0000",
	style: {
		description:
			"Semi-realistic digital comic illustration, cel-shaded with bold ink outlines, muted earthy palette, cinematic dramatic lighting, gritty detailed textures, expressive characters, Rockstar Games concept art style",
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
};
