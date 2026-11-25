export const MOCK_TITLE = "Little Red";

export const MOCK_ASSETS_OSML = `<asset_style>Warm, earth tones. Whimsical storybook illustration with soft watercolors, gentle brush strokes, warm lighting.</asset_style>

<asset_voice name="Narrator" gender="feminine" age="adult" pitch="medium" accent="american" description="warm, grandmotherly, kind" language="en"></asset_voice>

<asset_avatar name="Red">A cheerful girl around eight years old with warm brown skin, dark curly hair in two puffs, bright brown eyes, wearing a bright red hooded cloak over a white dress, small brown leather boots.</asset_avatar>
<asset_voice name="Red" gender="feminine" age="child" pitch="high" accent="american" description="bright, cheerful, youthful" language="en"></asset_voice>

<asset_avatar name="Wolf">A large gray wolf with kind amber eyes, soft thick fur, wearing a worn brown vest with wooden buttons, slightly hunched posture, gentle expression despite sharp teeth.</asset_avatar>
<asset_voice name="Wolf" gender="masculine" age="adult" pitch="low" accent="american" description="gentle, soft-spoken, kind" language="en"></asset_voice>

<asset_avatar name="Mother">Red's mother, a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron.</asset_avatar>
<asset_voice name="Mother" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic" language="en"></asset_voice>

<asset_avatar name="Granny">Red's grandmother, a small elderly woman with deep brown skin, silver hair in a bun, twinkling hazel eyes behind round spectacles, wearing a soft purple shawl.</asset_avatar>
<asset_voice name="Granny" gender="feminine" age="adult" pitch="medium" accent="american" description="caring, gentle, melodic" language="en"></asset_voice>

`;

export const MOCK_SCRIPT = `<music>Gentle, playful storybook orchestral bed, 1:40, warm and bright, under a narrator. Opens with a light flute melody over pizzicato strings and soft harp as the village wakes; at 0:25 a warm clarinet takes the tune for Mother and Red in the kitchen; at 0:50 the strings thin and slow as Owl watches from the oak; at 1:10 a low, kindly bassoon enters for Wolf picking berries. Ends on a held, curious string chord as Red and Wolf meet on the path. Mood: cheerful, cosy, a little mysterious. Key: G major. Tempo: 96 BPM, 4/4. Light orchestral film score, no lyrics.</music>

<video>Shot 1: Slow pan across a peaceful village at the edge of a lush green forest on a sunny morning, from a cozy cottage with a red door toward the dirt path into the woods. Sound: birds singing, a light breeze in the trees. Shot 2: Wide shot down the flower-lined path as birds fly overhead.</video>

<speech name="Narrator" emotion="cheerful">Once upon a time, in a village at the edge of a great forest, there lived a kind girl named Red.</speech>

<image motion="pushIn">Inside a sunlit kitchen with copper pots hanging on the wall, {{Red}} (a cheerful girl with brown skin, dark curly hair in two puffs, brown eyes, wearing a bright red hooded cloak and a white dress) stands beside her {{Mother}} (a tall woman with warm brown skin, long black braided hair tied back with a green ribbon, kind dark eyes, wearing a long blue dress and a flour-dusted apron). {{Mother}} gently places a wicker basket of fresh vegetables in {{Red}}'s hands.</image>

<speech name="Mother" emotion="gentle">"Take these straight to Granny, sweetheart. And please don't dawdle along the way."</speech>

<speech name="Red" emotion="excited">"I won't, Mama! I'll be back before sundown!"</speech>

<image motion="tiltDown">{{Red}} stands at her cottage door holding a wicker basket filled with fresh vegetables including carrots, lettuce, and tomatoes. She smiles warmly. Morning sunlight streams through nearby trees.</image>

<speech name="Narrator" emotion="happy">Red got her name from the beautiful red cloak she wore everywhere. Today, she was taking a basket of fresh vegetables to her grandmother, who lived deep in the woods.</speech>

<sound loops="5">birds chirping</sound>

<speech name="Narrator" emotion="content">Red skipped along the forest path, humming a cheerful tune.</speech>

<sound>footsteps on dirt path</sound>

<video>Shot 1: Gentle upward pan through the forest canopy, sunlight filtering through the leaves, ending on {{Owl}} perched high in the branches of an ancient oak as she slowly turns her head toward the path below. Sound: leaves rustling high above.</video>

<speech name="Narrator" emotion="wonder">High above, Owl watched silently from the trees. She had been the keeper of these woods for longer than anyone could remember.</speech>

<speech name="Owl" emotion="calm">"A child enters the forest today. The wind tells me she will not walk alone."</speech>

<video duration="4" motion="handheldDrift">Shot 1: Medium shot of {{Wolf}} carefully picking ripe red berries from thick bushes and dropping them into a wicker basket at his feet, dappled sunlight through the canopy. Sound: branches rustling.</video>

<speech name="Narrator" emotion="mysterious">Not far away, someone else was in the forest that morning. Wolf was gathering wild berries near the path.</speech>

<sound loops="4">rustling leaves</sound>

<speech name="Narrator" emotion="sympathetic">Now, Wolf looked scary with his big teeth and sharp claws, but he had a secret. He didn't eat meat at all! He was a vegetarian who loved berries, nuts, and vegetables.</speech>

<speech name="Wolf" emotion="content">"These berries will make Mother feel so much better. She loves berry soup."</speech>

<speech name="Narrator" emotion="calm">Wolf's mother had a terrible cold, and he wanted to bring her something special.</speech>

<image>{{Red}} and {{Wolf}} meet face to face on a sunlit forest path. {{Red}} holds her vegetable basket; {{Wolf}} holds his berry basket. Both look surprised but unafraid. A shaft of golden light falls between them. Wildflowers grow along the path.</image>

<speech name="Red" emotion="curious">"Oh! Hello, Mr. Wolf. Are those berries for someone special?"</speech>

<speech name="Wolf" emotion="happy">"For my mother. She has a cold. And you, little one?"</speech>

<speech name="Red" emotion="cheerful">"Vegetables for my Granny. She lives just past the great oak."</speech>

<speech name="Narrator" emotion="warm">They decided to walk together, two unlikely friends sharing the forest path.</speech>

<sound loops="6">forest stream burbling</sound>

<music>Light, twinkling chamber piece, 0:50, playful and warm, under dialogue. Opens with pizzicato strings and a skipping glockenspiel as Red and Wolf walk the fern path side by side; at 0:20 a hearty tuba phrase greets Hunter at the bridge; at 0:35 the strings swell gently as Granny's cottage comes into view. Ends on a soft, welcoming cadence as Granny opens the door. Mood: friendship, warmth, homecoming. Key: D major. Tempo: 108 BPM, 3/4. Chamber orchestra storybook score, no lyrics.</music>

<video duration="5" motion="panRight">Shot 1: Tracking shot of {{Red}} and {{Wolf}} walking side by side along a winding fern-lined path, a small stream in the background. Sound: footsteps on soft dirt, a stream burbling nearby. Shot 2: {{Red}} gestures as she talks while {{Wolf}} listens with a gentle smile.</video>

<speech name="Wolf" emotion="curious">"Tell me about your Granny. What is she like?"</speech>

<speech name="Red" emotion="proud">"She tells the best stories! And she knits the warmest mittens. And she always has cookies."</speech>

<image motion="panLeft">A clearing where the forest path meets a sturdy bridge over a stream. {{Hunter}} (a broad-shouldered woodsman with a thick brown beard, blue eyes, wearing a green cloak with a hatchet at his belt) stands by the bridge waving warmly at {{Red}} and {{Wolf}} as they approach. His sturdy brown boots crunch on the gravel.</image>

<speech name="Hunter" emotion="hearty">"Well now! Little Red and her woodland friend! You two heading to the old oak cottage?"</speech>

<speech name="Red" emotion="excited">"Yes, Mr. Hunter! Granny isn't feeling well."</speech>

<speech name="Hunter" emotion="kind">"Then walk safe. Tell her I'll bring firewood by tomorrow."</speech>

<sound>creaking wooden bridge</sound>

<speech name="Narrator" emotion="warm">They thanked Hunter and crossed the little bridge, the stream singing beneath their feet.</speech>

<video>Shot 1: Slow push-in toward the open door of a small thatched cottage among ancient oaks, smoke curling from the chimney above a window box of marigolds. Sound: birdsong, a fire crackling inside. Shot 2: Medium shot of {{Granny}} stepping into the doorway leaning on a wooden cane, smiling warmly. Shot 3: Close-up of {{Granny}}'s face as her eyes crinkle with delight. Sound: the cane tapping on the stone step.</video>

<speech name="Granny" emotion="delighted">"Red, my darling! And who is this handsome fellow you've brought along?"</speech>
`;

export const MOCK_STYLE =
	"Warm, painterly storybook illustration with soft watercolor washes, gentle outlines, and golden hour lighting; whimsical and nostalgic.";

/** Long-winded so the mock thinks for a couple of seconds, the way a real model does. */
export const MOCK_THOUGHT =
	"Reading the canvas to see what is already on it. Working out which scene the request points at, which elements sit inside that scene, and what the script currently says about each of them. Weighing whether this reads as a question to answer or as an edit to make, since the two want different tools, and a wrong guess there means an edit nobody asked for. Then picking the smallest change that does what was asked, so nothing else in the script has to move around, and nothing already on the canvas gets rewritten by accident. ";
