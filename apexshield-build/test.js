/* Adversarial self-test harness for the ApexShield build.
   Drives real Chromium: screenshots, console, flick test, legibility audit,
   the five static-hero gates, reduced motion in both directions, sideways overflow. */
const { chromium } = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs');
const path = require('path');

const URL = process.env.SITE || 'http://127.0.0.1:8080/';
const OUT = path.join(__dirname, 'review');
fs.mkdirSync(OUT, { recursive: true });

const log = [];
function say(s) { console.log(s); log.push(s); }
async function step(name, fn) {
  try { await fn(); } catch (e) { say('!! ' + name + ' FAILED: ' + (e.message || e).split('\n')[0]); }
}
const NOSMOOTH = 'html{scroll-behavior:auto !important}';
/* real mouse click that survives a page still settling */
async function realClick(page, sel) {
  await page.evaluate(s => document.querySelector(s).scrollIntoView({ block: 'center' }), sel);
  await page.waitForTimeout(900);
  const b = await page.locator(sel).boundingBox();
  await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
}

(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--ignore-certificate-errors'] });

  /* ---------- 1. desktop pass: console, screenshots, sideways overflow ---------- */
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NOSMOOTH });
  await page.waitForTimeout(1500);

  say('== console at 1440x900: ' + (errors.length ? errors.join(' | ') : 'clean'));

  const sideways = await page.evaluate(() => ({
    doc: document.documentElement.scrollWidth,
    win: window.innerWidth,
    body: document.body.scrollWidth
  }));
  say('== sideways: scrollWidth ' + sideways.doc + ' vs viewport ' + sideways.win +
      (sideways.doc > sideways.win + 1 ? '  <-- HORIZONTAL OVERFLOW' : '  ok'));

  await page.screenshot({ path: path.join(OUT, 'desk-hero-top.png') });

  /* scrub the hero at several points and prove the drive actually moves */
  const heroH = await page.evaluate(() => document.querySelector('#top').offsetHeight);
  const probe = [];
  for (const frac of [0.02, 0.22, 0.45, 0.68, 0.88, 0.995]) {
    await page.evaluate(y => window.scrollTo(0, y), Math.round((heroH - 900) * frac));
    await page.waitForTimeout(650);
    const s = await page.evaluate(() => {
      const bands = [...document.querySelectorAll('.band')].map(b => ({
        op: +getComputedStyle(b).opacity,
        k: +(getComputedStyle(b).getPropertyValue('--k') || 0)
      }));
      return { y: Math.round(scrollY), bands, hud: document.querySelector('#hudtext').textContent };
    });
    probe.push(frac + ' -> ' + s.bands.map((b, i) => i + ':' + b.op.toFixed(2) + '/' + b.k.toFixed(2)).join(' ') + '  hud "' + s.hud + '"');
    await page.screenshot({ path: path.join(OUT, 'desk-hero-' + String(Math.round(frac * 100)).padStart(3, '0') + '.png') });
  }
  say('== hero probe (band opacity/--k):\n   ' + probe.join('\n   '));

  /* read the whole page at a human pace, then shoot each section */
  const docH = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < docH; y += 380) { await page.evaluate(v => window.scrollTo(0, v), y); await page.waitForTimeout(220); }
  await page.waitForTimeout(2200);
  for (const id of ['stack', 'services', 'stormtest', 'how', 'proof', 'area', 'faq', 'book']) {
    await page.evaluate(i => document.getElementById(i).scrollIntoView(), id);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, 'desk-' + id + '.png') });
  }

  /* prove entrances actually played */
  const ent = await page.evaluate(() => {
    const pick = s => [...document.querySelectorAll(s)].map(e => +getComputedStyle(e).opacity);
    return {
      rise: pick('.rise').filter(o => o < 0.99).length,
      layers: pick('.layer').filter(o => o < 0.99).length,
      steps: pick('.step').filter(o => o < 0.99).length,
      quotes: pick('.quote').filter(o => o < 0.99).length,
      counters: [...document.querySelectorAll('#nums b')].map(b => b.textContent),
      staleDelays: [...document.querySelectorAll('.stack-fig.done .layer, .steps.done .step, .quotes.done .quote')]
        .filter(e => getComputedStyle(e).transitionDelay.split(',').some(d => parseFloat(d) > 0)).length
    };
  });
  say('== entrances not played (should be 0 for visited sections): rise ' + ent.rise +
      ', layers ' + ent.layers + ', steps ' + ent.steps + ', quotes ' + ent.quotes);
  say('== counters: ' + ent.counters.join(' | '));
  say('== stagger delays NOT retired after entrance (must be 0): ' + ent.staleDelays);

  /* the press and hold, performed like a visitor */
  await page.evaluate(() => document.getElementById('hold').scrollIntoView({ block: 'center' }));
  await page.waitForTimeout(1400);
  const box = await page.locator('#hold').boundingBox();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.waitForTimeout(2800);
  await page.mouse.up();
  await page.waitForTimeout(1600);
  const held = await page.evaluate(() => ({
    on: document.querySelector('#testout').classList.contains('on'),
    label: document.querySelector('#hold').textContent.trim(),
    gauge: document.querySelector('#gaugefill').style.width,
    guards: [...document.querySelectorAll('.guard')].map(g => +getComputedStyle(g).opacity)
  }));
  say('== storm test after a 2.8s hold: complete=' + held.on + ', button "' + held.label +
      '", gauge ' + held.gauge + ', guards ' + held.guards.map(o => o.toFixed(2)).join('/'));
  await page.screenshot({ path: path.join(OUT, 'desk-stormtest-done.png') });

  /* the form */
  let invalid = -1, sent = null, blockedEarly = null;
  await step('form', async () => {
    await realClick(page, '#bookform button[type=submit]');
    await page.waitForTimeout(400);
    invalid = await page.evaluate(() => document.querySelectorAll('#bookform [aria-invalid=true]').length);
    blockedEarly = await page.evaluate(() => !document.querySelector('#bookform').classList.contains('sent-on'));
    await page.fill('#bookform input[name=name]', 'Dana Reyes');
    await page.fill('#bookform input[name=phone]', '469 555 0199');
    await page.fill('#bookform input[name=email]', 'dana@example.com');
    await page.fill('#bookform input[name=where]', '75034');
    await realClick(page, '#bookform button[type=submit]');
    await page.waitForTimeout(900);
    sent = await page.evaluate(() => document.querySelector('#bookform').classList.contains('sent-on'));
    await page.screenshot({ path: path.join(OUT, 'desk-form-sent.png') });
  });
  say('== form: empty submit flagged ' + invalid + ' fields and was blocked = ' + blockedEarly +
      ', filled submit reached success state = ' + sent);

  /* every link and button reachable */
  const links = await page.evaluate(() => {
    const bad = [];
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      const id = a.getAttribute('href').slice(1);
      if (id && !document.getElementById(id)) bad.push(a.getAttribute('href'));
    });
    return bad;
  });
  say('== dead in-page links: ' + (links.length ? links.join(', ') : 'none'));


  /* ---------- 2. the flick test ---------- */
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NOSMOOTH });
  await page.waitForTimeout(1200);

  /* on a FRESH load: park on the booking section and make sure the success
     overlay stays hidden long after the entrance cleanup class lands */
  await page.evaluate(() => document.getElementById('book').scrollIntoView());
  await page.waitForTimeout(3500);
  const premature = await page.evaluate(() => {
    const f = document.querySelector('#bookform');
    return {
      entranceDone: f.classList.contains('done'),
      submitted: f.classList.contains('sent-on'),
      sentVisible: getComputedStyle(f.querySelector('.sent')).visibility
    };
  });
  say('== form success overlay on a fresh load, 3.5s parked on the booking section: entrance cleanup class ' +
      premature.entranceDone + ', submitted ' + premature.submitted + ', overlay ' + premature.sentVisible +
      (premature.sentVisible === 'hidden' && !premature.submitted ? '  ok' : '  <-- LEAKING'));
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);

  const flick = async (step, count) => {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(500);
    const rows = [];
    for (let i = 0; i < count; i++) {
      await page.evaluate(s => window.scrollBy(0, s), step);
      await page.waitForTimeout(400);
      const r = await page.evaluate(() => ({
        y: Math.round(scrollY),
        b: [...document.querySelectorAll('.band')].map(b => +getComputedStyle(b).opacity)
      }));
      rows.push(r);
    }
    return rows;
  };
  for (const [step, count] of [[120, 70], [240, 36], [360, 24]]) {
    const rows = await flick(step, count);
    const n = rows[0].b.length;
    const full = Array.from({ length: n }, () => 0);
    const runs = Array.from({ length: n }, () => 0);
    const best = Array.from({ length: n }, () => 0);
    rows.forEach(r => r.b.forEach((o, i) => {
      if (o > 0.97) { full[i]++; runs[i]++; best[i] = Math.max(best[i], runs[i]); }
      else runs[i] = 0;
    }));
    say('== flick ' + step + 'px x' + count + ': full-opacity consecutive steps per band = ' + best.join(', ') +
        (best.some(b => b === 0) ? '  <-- A BAND IS SKIPPABLE' : ''));
  }

  /* ---------- 3. worst-frame legibility audit ---------- */
  const audit = [];
  const bandCount = await page.evaluate(() => document.querySelectorAll('.band').length);
  for (let bi = 0; bi < bandCount; bi++) {
    const range = await page.evaluate(i => {
      const b = document.querySelectorAll('.band')[i];
      return [parseFloat(b.dataset.a), parseFloat(b.dataset.b)];
    }, bi);
    let worstRatio = 99;
    for (const frac of [0.25, 0.5, 0.75]) {
      const p = range[0] + (range[1] - range[0]) * frac;
      await page.evaluate(pp => {
        const hero = document.querySelector('#top');
        window.scrollTo(0, (hero.offsetHeight - window.innerHeight) * pp);
      }, p);
      await page.waitForTimeout(700);
      const zone = await page.evaluate(i => {
        const b = document.querySelectorAll('.band')[i];
        const r = b.getBoundingClientRect();
        b.querySelectorAll('.vis, .sub, .cta-row').forEach(e => e.style.visibility = 'hidden');
        return { x: Math.max(0, Math.round(r.x)), y: Math.max(0, Math.round(r.y)), width: Math.round(r.width), height: Math.round(r.height) };
      }, bi);
      if (zone.width < 4 || zone.height < 4) continue;
      const shot = await page.screenshot({ clip: zone });
      await page.evaluate(i => {
        document.querySelectorAll('.band')[i].querySelectorAll('.vis, .sub, .cta-row').forEach(e => e.style.visibility = '');
      }, bi);
      const ratio = await page.evaluate(async b64 => {
        const img = await createImageBitmap(await (await fetch('data:image/png;base64,' + b64)).blob());
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        const g = c.getContext('2d');
        g.drawImage(img, 0, 0);
        const d = g.getImageData(0, 0, c.width, c.height).data;
        const lum = (r, gg, bb) => {
          const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
          return 0.2126 * f(r) + 0.7152 * f(gg) + 0.0722 * f(bb);
        };
        let worst = 0;
        for (let i = 0; i < d.length; i += 4) worst = Math.max(worst, lum(d[i], d[i + 1], d[i + 2]));
        const lt = lum(237, 242, 247);
        const hi = Math.max(lt, worst), lo = Math.min(lt, worst);
        return (hi + 0.05) / (lo + 0.05);
      }, shot.toString('base64'));
      worstRatio = Math.min(worstRatio, ratio);
    }
    audit.push('band ' + (bi + 1) + ': ' + worstRatio.toFixed(2) + ':1' + (worstRatio < 3.5 ? '  <-- FAILS 3.5:1' : ''));
  }
  say('== worst-frame legibility (text hidden, lightest pixel under the text box vs #EDF2F7):\n   ' + audit.join('\n   '));

  await ctx.close();

  /* ---------- 4. the five static-hero gates ---------- */
  const gates = [
    ['phone 375x812', { viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true }],
    ['phone 375x667', { viewport: { width: 375, height: 667 }, hasTouch: true, isMobile: true }],
    ['portrait tablet 820x1180', { viewport: { width: 820, height: 1180 }, hasTouch: true, isMobile: true }],
    ['landscape phone 740x420', { viewport: { width: 740, height: 420 }, hasTouch: true, isMobile: true }],
    ['reduced motion 1440x900', { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' }],
    ['narrow desktop 1280x800', { viewport: { width: 1280, height: 800 } }]
  ];
  for (const [label, opts] of gates) {
    const c = await browser.newContext(Object.assign({ ignoreHTTPSErrors: true }, opts));
    const pg = await c.newPage();
    const errs = [];
    pg.on('pageerror', e => errs.push(e.message));
    pg.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await pg.goto(URL, { waitUntil: 'networkidle' });
    await pg.addStyleTag({ content: NOSMOOTH });
    await pg.waitForTimeout(1400);
    const st = await pg.evaluate(() => {
      const stage = document.querySelector('#stage');
      const sh = document.querySelector('#statichero');
      const still = document.querySelector('#still');
      let painted = false;
      try {
        const g = still.getContext('2d');
        const d = g.getImageData(Math.floor(still.width / 2), Math.floor(still.height * 0.8), 1, 1).data;
        painted = d[3] > 0 && (d[0] + d[1] + d[2]) > 8;
      } catch (e) { painted = 'blocked'; }
      return {
        stage: getComputedStyle(stage).display,
        staticShown: getComputedStyle(sh).display,
        painted: painted,
        docW: document.documentElement.scrollWidth,
        winW: window.innerWidth,
        heroH: document.querySelector('#top').offsetHeight,
        h1: (document.querySelector('.static-in h1') || {}).offsetHeight || 0
      };
    });
    say('== ' + label + ': stage ' + st.stage + ', static hero ' + st.staticShown +
        ', still painted ' + st.painted + ', hero height ' + st.heroH +
        ', sideways ' + (st.docW > st.winW + 1 ? 'OVERFLOW ' + st.docW + '>' + st.winW : 'ok') +
        (errs.length ? ', console: ' + errs.join(' | ') : ', console clean'));
    await pg.screenshot({ path: path.join(OUT, 'gate-' + label.replace(/[^a-z0-9]+/gi, '-') + '.png'), fullPage: false });
    if (label.indexOf('phone 375x812') === 0) {
      await pg.screenshot({ path: path.join(OUT, 'phone-full.png'), fullPage: true });
    }
    await c.close();
  }

  /* ---------- 5. reduced motion flipped live, both directions ---------- */
  const c2 = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const p2 = await c2.newPage();
  const e2 = [];
  p2.on('pageerror', e => e2.push(e.message));
  await p2.goto(URL, { waitUntil: 'networkidle' });
  await p2.addStyleTag({ content: NOSMOOTH });
  await p2.waitForTimeout(1000);
  await p2.evaluate(() => document.getElementById('proof').scrollIntoView());
  await p2.waitForTimeout(400);
  await p2.emulateMedia({ reducedMotion: 'reduce' });
  await p2.waitForTimeout(900);
  const pinnedState = await p2.evaluate(() => ({
    stage: getComputedStyle(document.querySelector('#stage')).display,
    unfinished: [...document.querySelectorAll('.rise, .step, .quote, .layer')].filter(e => +getComputedStyle(e).opacity < 0.99).length,
    test: document.querySelector('#testout').classList.contains('on'),
    counters: [...document.querySelectorAll('#nums b')].map(b => b.textContent)
  }));
  say('== reduced motion flipped ON mid-session: stage ' + pinnedState.stage +
      ', elements still unfinished ' + pinnedState.unfinished +
      ', storm test pinned complete ' + pinnedState.test + ', counters ' + pinnedState.counters.join('/'));
  await p2.emulateMedia({ reducedMotion: 'no-preference' });
  await p2.waitForTimeout(900);
  await p2.evaluate(() => window.scrollTo(0, 600));
  await p2.waitForTimeout(800);
  const rearmed = await p2.evaluate(() => ({
    stage: getComputedStyle(document.querySelector('#stage')).display,
    bandsLive: [...document.querySelectorAll('.band')].some(b => +getComputedStyle(b).opacity > 0.02),
    pinsLeft: [...document.querySelectorAll('.done')].length
  }));
  say('== reduced motion flipped back OFF: stage ' + rearmed.stage + ', hero captions live ' + rearmed.bandsLive +
      (e2.length ? ', errors ' + e2.join(' | ') : ', no errors'));
  await c2.close();

  /* ---------- 6. complete without the canvas ---------- */
  const c3 = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const p3 = await c3.newPage();
  await p3.addInitScript(() => {
    HTMLCanvasElement.prototype.getContext = function () { return null; };
  });
  const e3 = [];
  p3.on('pageerror', e => e3.push(e.message));
  await p3.goto(URL, { waitUntil: 'networkidle' });
  await p3.waitForTimeout(1200);
  const noCanvas = await p3.evaluate(() => ({
    bodyOpacity: getComputedStyle(document.body).opacity,
    staticHero: getComputedStyle(document.querySelector('#statichero')).display,
    stage: getComputedStyle(document.querySelector('#stage')).display,
    headline: (document.querySelector('.static-in h1') || {}).offsetHeight || 0,
    sections: document.querySelectorAll('main section').length,
    ctaVisible: !!document.querySelector('#book form')
  }));
  say('== canvas unavailable: body opacity ' + noCanvas.bodyOpacity + ', static hero ' + noCanvas.staticHero +
      ', scrub stage ' + noCanvas.stage + ', hero headline height ' + noCanvas.headline +
      ', sections ' + noCanvas.sections + ', form present ' + noCanvas.ctaVisible +
      (e3.length ? ', errors ' + e3.join(' | ') : ', no errors'));
  await p3.screenshot({ path: path.join(OUT, 'no-canvas.png') });
  await c3.close();

  /* ---------- 7. keyboard path ---------- */
  const c4 = await browser.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
  const p4 = await c4.newPage();
  await p4.goto(URL, { waitUntil: 'networkidle' });
  await p4.addStyleTag({ content: NOSMOOTH });
  await p4.waitForTimeout(800);
  await p4.keyboard.press('Tab');
  const firstFocus = await p4.evaluate(() => document.activeElement.className + ' / ' + document.activeElement.textContent.trim().slice(0, 30));
  await p4.evaluate(() => document.getElementById('hold').scrollIntoView({ block: 'center' }));
  await p4.waitForTimeout(900);
  await p4.evaluate(() => document.getElementById('hold').focus());
  await p4.keyboard.down(' ');
  await p4.waitForTimeout(2700);
  await p4.keyboard.up(' ');
  await p4.waitForTimeout(900);
  const kb = await p4.evaluate(() => document.querySelector('#testout').classList.contains('on'));
  say('== keyboard: first tab stop "' + firstFocus + '", space-held storm test completed ' + kb);
  await c4.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'selftest.txt'), log.join('\n') + '\n');
  console.log('\nscreenshots + log in ' + OUT);
})().catch(e => { console.error('HARNESS FAILED', e); process.exit(1); });
