import { dedent } from "@/lib/dedent";
import { templateAsset } from "../template-asset";
import type { Template } from "../templates";

export const sleepStory: Template = {
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
};
