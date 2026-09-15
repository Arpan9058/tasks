# ApexShield Roofing & Exteriors — build notes

`../apexshield-roofing/` is the website. Everything else in this folder is working
material and never ships.

## What ships

```
apexshield-roofing/
  index.html
  assets/site.css
  assets/app.js
  assets/og-cover.jpg      (link preview image only, the page never loads it)
```

Plain HTML, CSS and vanilla JavaScript. No framework, no build step, no npm, no
backend. The hero is drawn in a canvas from one scroll driven number, so the site
ships zero video and zero photographs.

## Preview it

Double clicking `index.html` works and shows the designed static hero. For the full
scroll journey, serve the folder:

```
cd apexshield-roofing
npx http-server -p 8080 -c-1 .
```

Then open `http://127.0.0.1:8080/` in a browser.

## Put it online

The deploy folder's CONTENTS go at the top level of the zip, so `index.html` sits at
the root and `assets/` beside it:

```
cd apexshield-roofing
zip -r ../apexshield-site.zip index.html assets
```

Before zipping, patch the two tags marked `<!-- DEPLOY STEP -->` in `index.html`
(`og:url` and `og:image`) with the real live address, and the `<link rel="canonical">`
above them.

## The self test

`test.js` drives real Chromium against a running preview server and checks the things
that are easy to get wrong: console errors, sideways overflow, the scroll drive, the
entrance choreography, the stagger cleanup, the press and hold, form validation, the
caption flick test at 120/240/360px, worst frame text contrast under every hero
caption, all five static hero gates, reduced motion flipped both ways mid session, the
page with canvas unavailable, and the keyboard path.

```
node test.js          # SITE=https://... to run it against a live URL
```

Output and screenshots land in `review/`. The PNGs are ignored by git.

## Files

- `design-package.md` — every creative decision, written before the build. All the
  site's copy lives here verbatim.
- `test.js` — the self test harness.
- `review/selftest.txt` — the last run's results.
