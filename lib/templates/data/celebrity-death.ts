import { dedent } from "@/lib/dedent";
import { templateAsset } from "../template-asset";
import type { Template } from "../templates";

export const celebrityDeath: Template = {
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
- Never describe the real people's looks in the prompts. Their appearance belongs in their asset_avatar element; refer to them by name only.
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
};
