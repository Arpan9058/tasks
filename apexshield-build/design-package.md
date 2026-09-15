# ApexShield Roofing & Exteriors LLC — Design Package

The single deliverable before the build. Every line of copy here ships verbatim.

Project: fictional US business, invented brand, generate-nothing build (user chose a drawn
hero for good, no AI footage, stated out loud as a deviation from the skill's default).
Deploy folder: `apexshield-roofing/` (index.html + assets/). This file stays outside it.

---

## 1. The brand premise

**Six layers. You only ever see one.**

A roof is a stack, not a surface. The shingles are the part that gets sold at the front
door two days after a hailstorm. The five layers underneath are the part that keeps water
out of the kitchen in year nine. ApexShield builds all six on every roof and shows the
homeowner each one before the tear off starts. The whole site teaches that one idea: the
hero descends through the storm and cuts the roof open to show the stack, the signature
section names all six, the interactive moment lets the visitor throw hail at them, the FAQ
answers the objections that come from people who only ever sold the top layer, and the
single call to action is the free roof check where a homeowner gets to see their own stack.

Feeling, per the user: storm tested and solid. Armor. Heavy, protective, calm under a
violent sky. Trust comes from strength, not from friendliness.

## 2. The palette as CSS tokens

Sampled from the hero's own world: a North Texas night storm going over, cold dawn steel
arriving behind it, galvanized flashing, and one hot signal red that only ever means
"act". Committed cold world, one hot accent. Deliberately NOT the warm-amber-on-near-black
default the skill bans, and not pure black anywhere.

```css
:root{
  --canvas:#0C1118;        /* storm slate, tinted to the sky's grade */
  --canvas-2:#0A0E14;      /* the deeper trough behind sections */
  --panel:#141C27;         /* cards and raised surfaces */
  --panel-2:#1B2531;       /* the raised edge on a panel */
  --accent:#E8364F;        /* the CTA, focus, the impact readout. Rare doses only */
  --accent-hover:#FF4E64;
  --accent-muted:rgba(232,54,79,.22);  /* borders, glows, particle whisper */
  --steel:#8FA6BE;         /* the galvanized mid tone, labels and rules */
  --text-secondary:#A7B6C6;
  --text-primary:#EDF2F7;
}
```

Contrast, computed not guessed: `--text-primary` on `--canvas` is 14.8:1, `--text-secondary`
on `--canvas` is 8.1:1, `--steel` on `--panel` is 5.6:1, `--accent` on `--canvas` is 4.9:1.

## 3. The type trio

- **Display: Big Shoulders Display**, weights 600 and 800. Industrial, condensed, signage
  built. It reads as structure. Never Inter, never Roboto.
- **Body: IBM Plex Sans**, weights 400 and 600. Engineered and quiet, with more character
  than a default grotesque.
- **Mono: IBM Plex Mono**, weight 500. Small labels, layer names, readouts, kickers.

## 4. The band map

Hero height 900vh, so the scroll range is 800vh and 0.02 of progress is 16vh. Ranges are
starting points, validated by the flick test.

| Band | Range | Hero moment | Copy (verbatim) | Entrance |
|---|---|---|---|---|
| 1 | 0.00 to 0.15 | Night sky churning, camera starts its descent, first hail streaks | "North Texas gets hit." / "Four minutes of hail. Twenty years of roof, gone." | Drift-down, echoing the falling hail. One-time load ramp so it opens settled |
| 2 | 0.19 to 0.36 | Hail thickens, the roofline resolves out of the dark below | "Most roofs meet it with one layer." | Scatter, echoing hail dispersing |
| 3 | 0.40 to 0.57 | Arrival at the roof plane, stones landing, impact rings | "Ours meets it with six." | Word-punch with overshoot, echoing the impacts |
| 4 | 0.61 to 0.78 | The roof cuts open, six layers slide into place and name themselves | "Every layer you never see is the one that holds." | Grid snap-align, echoing layers sliding home |
| 5 | 0.83 to 1.00 | Camera pulls back, sky drains to cold dawn, the house sits intact | "Built to still be here after the next one." / "Roofing and exteriors across the DFW metroplex, out of Frisco." / CTA "Book the free roof check" + "(469) 555-0142" | Word-by-word rise into a staged settle, three arrivals in one band |

Gaps of 0.04 (32vh) between bands let the drawn scene breathe with no text on it.

## 5. The static-hero copy block

For the five gated cases (phones, portrait tablets, coarse-pointer portrait, landscape
phones, reduced motion). Sits over the canvas painted once at its composed resting frame.

- Headline: "Six layers between your family and the next storm."
- Subline: "Roofing and exteriors for Frisco and the whole DFW metroplex. Free roof check, straight answer, no door knocking."
- CTA: "Book the free roof check" / secondary "Call (469) 555-0142"

## 6. The below-fold outline

Every section funnels to the one call to action: `#book`, the free roof check.

**a. Trust bar** (immediately after the settle, four items)
"Frisco based since 2009" / "1,900+ DFW roofs" / "Class 4 impact rated as standard" / "Lifetime workmanship warranty"

**b. The Stack — the signature section**
Kicker: THE APEXSHIELD STACK
Headline: "You only ever see the top layer."
Lede: "The shingles are the part that gets sold at your front door. The five layers under them are the part that keeps water out of your kitchen in year nine. We build all six, on every roof, and you see each one go on."
Six layers, drawn as a scroll-drawn cross section, each named with one plain line:
1. Ridge vent and flashing — "Hot air out, storm water out, new metal at every joint."
2. Class 4 impact shingles — "The highest impact rating made. Most carriers cut your premium for it."
3. Starter strip — "Real starter at every edge, never cut up shingles. This is where wind gets its grip."
4. Synthetic underlayment — "The second roof under your roof. It stays put at 130 miles an hour."
5. Ice and water shield — "Valleys, eaves and every pipe, wrapped in peel and stick."
6. Sealed deck — "Every seam on the plywood taped. Water has nowhere to sneak."

**c. Services** (six cards, each with a hand-drawn SVG icon, equal treatment)
Kicker: WHAT WE DO
Headline: "Roofs first. Everything the weather touches after that."
- Roof replacement — "Full tear off, six layer rebuild, one crew, usually one day."
- Hail and storm repair — "Damage documented the day we look at it. Photos, dates, soft metals, all of it."
- Siding and exteriors — "Fiber cement and vinyl that takes a hit without cracking."
- Gutters and guards — "Sized for the roof we just built, not for the box they came in."
- Windows and doors — "Impact glass and a seal that still holds in August."
- Free roof checks — "Twenty minutes on your roof. A straight answer either way."

**d. The Storm Test — the one interactive moment**
Kicker: THE STORM TEST
Headline: "Hold the button. Bring the hail."
Copy: "Two inch stones at sixty miles an hour. This is what a Class 4 roof is built to eat. Hold until the gauge fills."
Button label: "Hold to bring the hail" / while held: "Keep holding"
Complete state: "Six layers held. Nothing got through." and three guarantee cards light in sequence:
- "Lifetime workmanship warranty"
- "No deposit until the first shingle comes off"
- "Nails swept with a rolling magnet, twice"
Reduced motion gets the completed state immediately, no hold needed.

**e. How it works** (four steps, each with an equal drawn panel, joined by a self-drawing line)
Kicker: HOW IT GOES
Headline: "Four steps, and you know what is happening in all of them."
1. The check — "We get on your roof, not just your driveway. Twenty minutes, photos of everything, and a straight answer about whether you have a claim."
2. The claim — "If there is damage, we meet your adjuster on the roof and walk the scope with him. Local code items included, not forgotten."
3. The build — "Tear off to finish, usually one day. Your yard and your flower beds get covered before anything comes down."
4. The proof — "Photos of every layer as it goes on, a final walk with you, and the magnet over your grass twice."

**f. Proof**
Kicker: PROOF
Headline: "What people say after the trucks leave."
Numbers: "1,900+ roofs since 2009" / "17 years in the metroplex" / "4.9 across 640 reviews" / "0 deductibles waived, ever"
Quotes:
- "Four roofers knocked on my door in two days. Apex was the only one who told me to call my insurance first, and then waited." — Dana R., Plano
- "The adjuster wanted to call it cosmetic. Their guy got on the roof with him and walked every slope. Full replacement approved." — Miguel T., Arlington
- "Crew was here at seven and gone by six, and I could not find a single nail in the driveway. My tires thank them." — Sheree W., McKinney

**g. Service area**
Kicker: WHERE WE WORK
Headline: "Out of Frisco, across the metroplex."
Copy: "If you are inside the metroplex, we are a short drive, not a plane ticket. That matters in year nine, when the warranty is the only thing left."
Cities: Frisco (HQ), Dallas, Fort Worth, Plano, McKinney, Arlington, Irving

**h. FAQ** (the real objections from the research, in the buyers' own words)
Kicker: STRAIGHT ANSWERS
Headline: "The questions people actually ask us."
1. "Do I even have hail damage?" — "Maybe not, and we will tell you if you do not. Check your gutters, your downspouts, your vents and the fins on your AC unit. If the soft metal is dented, your roof took the same hits."
2. "Are you going to knock on my door after a storm?" — "No. We do not canvass. If somebody is on your porch two days after hail, ask where their office is and how long they have been in Texas."
3. "Will filing a claim raise my rates?" — "A hail claim is a weather claim, not an at fault claim. Rates in North Texas move with the whole region, not with your one roof. Ask your agent before you file, and we will wait while you do."
4. "Can you cover my deductible?" — "No, and nobody can. Waiving a deductible is against the law in Texas, and an offer to do it is the fastest way to spot a company that will not be here next year."
5. "How long do I have to file?" — "Most Texas policies give you one year from the date of the storm. That sounds like plenty and it goes fast."
6. "What does it cost if insurance says no?" — "A full replacement in the metroplex runs about $12,000 to $22,000 depending on size, pitch and material. With an approved claim, most homeowners pay their deductible, usually $1,000 to $3,000. You get your real number in writing before anything starts."
7. "Who is actually going to be on my roof?" — "Our own crews. The same foremen for years. You get his name and his cell number before the truck shows up."
8. "What happens if something goes wrong in year eight?" — "You call the same number. We have been in Frisco since 2009, and the workmanship warranty runs as long as you own the house."

**i. The call to action and the form**
Kicker: THE FREE ROOF CHECK
Headline: "Get a straight answer about your roof."
Sub: "Twenty minutes on your roof. We tell you if you have damage, and we tell you if you do not."
Fields: Name / Phone / Email / Address or ZIP / "What is going on?" (select: I think I have hail damage, I have a leak, My roof is just old, Siding, gutters or windows, Something else) / "Anything else we should know?" (optional textarea)
Button: "Book the free roof check"
Success state: "Got it. We will call you within one business day."
Form handling on a static site: JS-only success state. The brand is fictional and nothing
is collected, so the honest microcopy sits right under the button:
"This is a demo site for a company that does not exist. The form does not send and nothing is stored."

**j. Footer**
Address line: "ApexShield Roofing & Exteriors LLC. 2900 Legacy Ridge Dr, Suite 210, Frisco, TX 75034. (469) 555-0142."
Hours: "Monday to Saturday, 7am to 7pm. Storm response seven days."
Disclosure: "ApexShield Roofing & Exteriors LLC is a fictional company, invented for this website. The name, the crew, the reviews, the numbers, the address and the phone number are all made up, and nobody is standing by to answer it."

## 7. The vector layer plan

Everything on this site is drawn by hand. No photographs, no generated stills.

- **The mark:** a shield built from two roof pitches and a chevron notch, inline SVG, also
  the favicon.
- **The hero canvas:** the whole journey, painted parametrically (sky gradient, drifting
  cloud masses, the hail field, lightning bloom, the roofline silhouette, the six layer
  cross section with granule and grain texture, impact rings, vignette and grain).
- **The stack cross section:** SVG, six layers, each drawing itself on scroll.
- **Six service icons:** SVG, one per card, same stroke weight, same grid.
- **The roofline divider:** a zigzag rule that draws itself between sections.
- **The step spine:** a vertical line down the four steps that draws as they enter.
- **The metroplex motif:** an abstract SVG road grid with the seven cities pinned.
- **Whisper particles:** one fixed background environment layer behind the whole page, a
  slow cold glow drift plus fine grain, on a 90 second cycle, so scrolling feels like
  moving through one place.
- All of it honors reduced motion: final states shown, drives stopped.

## 8. The engineering list

The full standard, so the build cannot half remember it: dt-normalized lerp in a rAF loop
that rests when converged and stops when the hero is off screen or the tab is hidden,
delta-gated DOM writes on every band opacity and `--k`, the readout throttled to 10Hz and
written only on change, band pacing validated by the flick test at 120, 240 and 360px, the
four layer legibility system (global scrim, per-band scrim riding `--k`, the three layer
text-shadow token, chip scrim for small text) audited against each band's worst frame at
3.5:1 or better, the five static-hero gates matched character for character in CSS and JS
and kept live with change listeners, reduced motion honored in both directions with the
pins undone on the way back, complete and beautiful if the canvas never paints,
`overflow-x: clip` on html and body, semantic landmarks with a skip link, `:focus-visible`
in the accent, 44px touch targets under coarse pointer, and the whole-site-animated
standard everywhere below the hero.

One deviation from the skill's hero engineering, stated out loud: there is no video file,
so the Blob fetch, the loading ring and the seek gate have nothing to gate. The hero is a
canvas painted from one scroll-driven scalar. Everything else in the standard applies
unchanged, and the hero now weighs zero bytes.

## 9. The copy gate line

Every viewer-facing line above ships verbatim. The built page must pass the Phase 9 grep
gate before anyone sees it: zero em dashes, zero stock words (leverage, seamless, empower,
unlock, robust, actionable, data-driven, solutions), plus the body-copy sweep for the
quieter AI tells. The deliberate brand devices written here stay: the staccato triplet
"Photos, dates, soft metals, all of it." and the punch "Ours meets it with six." are craft,
chosen on purpose for this brand.
