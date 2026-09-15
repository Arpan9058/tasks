/* ApexShield Roofing & Exteriors
   Scroll driven hero, drawn entirely in canvas. No video, no framework, no build step. */
(function () {
'use strict';

/* ------------------------------------------------------------------ helpers */

var clamp = function (v, lo, hi) { return Math.min(hi, Math.max(lo, v)); };
var lerp  = function (a, b, t) { return a + (b - a) * t; };
var smoothstep = function (p, e0, e1) {
  var t = clamp((p - e0) / (e1 - e0), 0, 1);
  return t * t * (3 - 2 * t);
};
function rng(seed) {
  var s = seed >>> 0;
  return function () { return (s = (s * 1664525 + 1013904223) >>> 0) / 4294967296; };
}
function hex(c) {
  return [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
}
function mixRGB(c1, c2, t) {
  var a = hex(c1), b = hex(c2);
  return [Math.round(lerp(a[0], b[0], t)), Math.round(lerp(a[1], b[1], t)), Math.round(lerp(a[2], b[2], t))];
}
function mix(c1, c2, t) { return 'rgb(' + mixRGB(c1, c2, t).join(',') + ')'; }
var $  = function (s, r) { return (r || document).querySelector(s); };
var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

/* ------------------------------------------------------- the scene, keyframed */

var SKY = [
  { p: 0.00, a: '#0A0F1A', b: '#141D2C', c: '#1E2A3A' },
  { p: 0.40, a: '#05080E', b: '#0B1220', c: '#121C2A' },
  { p: 0.74, a: '#070C14', b: '#101A28', c: '#1C2A3A' },
  { p: 1.00, a: '#0E1926', b: '#2A3A4C', c: '#8FA6BC' }
];
function skyAt(p) {
  var i = 0;
  while (i < SKY.length - 2 && p > SKY[i + 1].p) i++;
  var s0 = SKY[i], s1 = SKY[i + 1];
  var t = smoothstep(p, s0.p, s1.p);
  return { a: mix(s0.a, s1.a, t), b: mix(s0.b, s1.b, t), c: mix(s0.c, s1.c, t) };
}

var FLASH = [
  { p: 0.215, w: 0.016, i: 0.85 },
  { p: 0.335, w: 0.013, i: 0.60 },
  { p: 0.505, w: 0.020, i: 1.00 },
  { p: 0.640, w: 0.012, i: 0.50 }
];
function flashAt(p) {
  var f = 0;
  for (var i = 0; i < FLASH.length; i++) {
    var d = (p - FLASH[i].p) / FLASH[i].w;
    f = Math.max(f, FLASH[i].i * Math.exp(-d * d));
  }
  return f;
}

var R = rng(20260915);
var CLOUDS = [], HAIL = [], STONES = [], RINGS = [];
var i;
for (i = 0; i < 8; i++) CLOUDS.push({ x: R(), y: R(), r: 0.26 + R() * 0.36, d: 0.18 + R() * 0.82, sp: (R() * 2 - 1) * 0.02, a: 0.34 + R() * 0.42 });
for (i = 0; i < 280; i++) HAIL.push({ x: R(), y: R(), d: R(), s: 0.5 + R() * 0.95 });
for (i = 0; i < 16; i++) STONES.push({ x: R(), y: R(), d: 0.45 + R() * 0.55, s: 0.6 + R() * 0.6 });
for (i = 0; i < 7; i++) RINGS.push({ x: 0.08 + R() * 0.84, o: R() });
var SKYLINE = [];
for (i = 0; i < 15; i++) SKYLINE.push({ h: 0.4 + R() * 0.9, w: 0.7 + R() * 0.6 });

var LAYERS = [
  { name: 'RIDGE VENT + FLASHING', short: 'Ridge and flashing', th: 0.10, kind: 'metal' },
  { name: 'CLASS 4 IMPACT SHINGLES', short: 'Class 4 shingles', th: 0.24, kind: 'granule' },
  { name: 'STARTER STRIP', short: 'Starter strip', th: 0.10, kind: 'seal' },
  { name: 'SYNTHETIC UNDERLAYMENT', short: 'Underlayment', th: 0.15, kind: 'weave' },
  { name: 'ICE AND WATER SHIELD', short: 'Ice and water', th: 0.14, kind: 'rubber' },
  { name: 'SEALED DECK', short: 'Sealed deck', th: 0.27, kind: 'wood' }
];
var RW = 2400, RH = 540;
var tiles = null;

function makeTile(kind, w, h) {
  var cv = document.createElement('canvas');
  cv.width = Math.max(2, Math.round(w));
  cv.height = Math.max(2, Math.round(h));
  var g = cv.getContext('2d');
  var W = cv.width, H = cv.height, n, x, y, r2 = rng(kind.length * 9173 + W);
  var grad = g.createLinearGradient(0, 0, 0, H);

  if (kind === 'metal') {
    grad.addColorStop(0, '#A2B0BE'); grad.addColorStop(0.45, '#75828F'); grad.addColorStop(1, '#4E5A66');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 1;
    for (x = 0; x < W; x += 74) { g.beginPath(); g.moveTo(x + 0.5, 0); g.lineTo(x + 0.5, H); g.stroke(); }
  } else if (kind === 'granule') {
    grad.addColorStop(0, '#333D4A'); grad.addColorStop(1, '#171C24');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    for (n = 0; n < 5200; n++) {
      x = r2() * W; y = r2() * H;
      var v = r2();
      g.fillStyle = v > 0.82 ? 'rgba(186,204,224,.30)' : (v > 0.5 ? 'rgba(126,146,168,.22)' : 'rgba(0,0,0,.30)');
      g.fillRect(x, y, 1 + r2() * 1.8, 1 + r2() * 1.6);
    }
    g.fillStyle = 'rgba(0,0,0,.45)';
    for (x = 0; x < W; x += 196) g.fillRect(x, H * 0.34, 3, H * 0.66);
  } else if (kind === 'seal') {
    grad.addColorStop(0, '#48545F'); grad.addColorStop(1, '#28313A');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(232,54,79,.42)'; g.lineWidth = Math.max(2, H * 0.12);
    g.setLineDash([30, 20]); g.beginPath(); g.moveTo(0, H * 0.56); g.lineTo(W, H * 0.56); g.stroke();
    g.setLineDash([]);
  } else if (kind === 'weave') {
    grad.addColorStop(0, '#5B6975'); grad.addColorStop(1, '#3A444F');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.strokeStyle = 'rgba(255,255,255,.055)'; g.lineWidth = 1;
    for (x = -H; x < W; x += 24) {
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + H, H); g.stroke();
      g.beginPath(); g.moveTo(x + H, 0); g.lineTo(x, H); g.stroke();
    }
  } else if (kind === 'rubber') {
    grad.addColorStop(0, '#222A33'); grad.addColorStop(1, '#0E1319');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    var gl = g.createLinearGradient(0, 0, W, H);
    gl.addColorStop(0, 'rgba(255,255,255,0)');
    gl.addColorStop(0.42, 'rgba(198,222,250,.085)');
    gl.addColorStop(0.58, 'rgba(198,222,250,.085)');
    gl.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gl; g.fillRect(0, 0, W, H);
  } else {
    grad.addColorStop(0, '#6E6048'); grad.addColorStop(1, '#443A2C');
    g.fillStyle = grad; g.fillRect(0, 0, W, H);
    g.lineWidth = 1;
    for (n = 0; n < 130; n++) {
      y = r2() * H;
      g.strokeStyle = r2() > 0.55 ? 'rgba(0,0,0,.22)' : 'rgba(255,255,255,.05)';
      g.beginPath(); g.moveTo(0, y);
      for (x = 0; x <= W; x += 80) g.lineTo(x, y + Math.sin((x + n * 60) / 160) * 2.4);
      g.stroke();
    }
    g.fillStyle = 'rgba(206,218,232,.20)';
    for (x = 280; x < W; x += 520) g.fillRect(x, 0, 26, H);
  }

  g.fillStyle = 'rgba(255,255,255,.13)'; g.fillRect(0, 0, W, Math.max(1, H * 0.035));
  g.fillStyle = 'rgba(0,0,0,.42)'; g.fillRect(0, H - Math.max(1, H * 0.06), W, Math.max(1, H * 0.06));
  return cv;
}
function buildTiles() {
  if (tiles) return;
  tiles = [];
  for (var i = 0; i < LAYERS.length; i++) tiles.push(makeTile(LAYERS[i].kind, RW, LAYERS[i].th * RH));
}
var LAYER_TOP = (function () {
  var o = [], acc = 0;
  for (var i = 0; i < LAYERS.length; i++) { o.push(acc); acc += LAYERS[i].th; }
  return o;
})();

/* --------------------------------------------------------------- noise tile */

var noiseTile = null;
function buildNoise() {
  if (noiseTile) return noiseTile;
  var cv = document.createElement('canvas');
  cv.width = cv.height = 150;
  var g = cv.getContext('2d');
  var d = g.createImageData(150, 150), r2 = rng(7717);
  for (var i = 0; i < d.data.length; i += 4) {
    var v = 118 + r2() * 137;
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v;
    d.data[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  noiseTile = cv;
  return cv;
}

/* ------------------------------------------------------------ the main paint */

function paint(ctx, W, H, p, t) {
  var sky = skyAt(p), f = flashAt(p);
  var storm = smoothstep(p, 0.02, 0.30) * (1 - smoothstep(p, 0.70, 0.96));
  var cx = W * 0.5;

  /* sky */
  var g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, sky.a); g.addColorStop(0.58, sky.b); g.addColorStop(1, sky.c);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);

  /* the dawn arriving behind the horizon */
  var dawn = smoothstep(p, 0.78, 1);
  if (dawn > 0) {
    var dg = ctx.createRadialGradient(cx, H * 0.86, 0, cx, H * 0.86, W * 0.85);
    dg.addColorStop(0, 'rgba(206,226,244,' + (0.46 * dawn) + ')');
    dg.addColorStop(0.42, 'rgba(142,168,196,' + (0.19 * dawn) + ')');
    dg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = dg; ctx.fillRect(0, 0, W, H);
  }

  /* cloud masses streaming up past the descending camera */
  var span = H * 2.9, big = Math.max(W, H);
  var body = mixRGB('#26344A', '#0C1220', storm).join(',');
  var core = mixRGB('#38495F', '#7E93AC', Math.min(1, f * 1.2)).join(',');
  for (var i = 0; i < CLOUDS.length; i++) {
    var c = CLOUDS[i];
    var par = 0.55 + 1.7 * c.d;
    var cy = ((c.y * span - p * par * H * 2.05) % span + span) % span - H * 0.85;
    var px = ((c.x * W * 2.4 + t * c.sp * W * 0.55) % (W * 2.4) + W * 2.4) % (W * 2.4) - W * 0.7;
    var r = c.r * big * (0.5 + 0.95 * c.d);
    var alpha = c.a * (0.62 + 0.38 * storm) * (1 - dawn * 0.62);
    var cg = ctx.createRadialGradient(px, cy - r * 0.22, r * 0.04, px, cy, r);
    cg.addColorStop(0, 'rgba(' + core + ',' + alpha.toFixed(3) + ')');
    cg.addColorStop(0.38, 'rgba(' + body + ',' + (alpha * 0.78).toFixed(3) + ')');
    cg.addColorStop(1, 'rgba(8,11,17,0)');
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.ellipse(px, cy, r, r * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  /* lightning bloom, capped low on purpose */
  if (f > 0.01) {
    ctx.fillStyle = 'rgba(178,206,238,' + (f * 0.15).toFixed(3) + ')';
    ctx.fillRect(0, 0, W, H * 0.8);
  }

  var pull = smoothstep(p, 0.795, 0.985);
  /* narrow frames (the phone static hero) get the arrival composed for THEIR shape,
     bigger and lower, instead of a 16:9 composition shrunk into a portrait box */
  var narrow = clamp(1.62 / Math.max(0.42, W / H), 1, 2.25);
  var sScale = lerp(1, 0.345 * narrow, pull);
  var stackCy = H * lerp(0.615, narrow > 1.25 ? 0.80 : 0.742, pull);
  var k = (W * 1.26 / RW) * sScale;
  var sw = RW * k, sh = RH * k;
  var sTop = stackCy - sh * 0.5;
  var pitch = pull * 0.30;
  var eaveY = sTop + (sw * 0.5) * pitch;

  /* the neighbourhood below: there from the first frame, so the sky is never empty */
  var townIn = 1 - smoothstep(p, 0.26, 0.44);
  if (townIn > 0.004) {
    var tScale = lerp(1, 3.4, smoothstep(p, 0, 0.44));
    drawSkyline(ctx, W, H, H * lerp(0.845, 1.06, smoothstep(p, 0, 0.44)), tScale, townIn * 0.82, 'rgba(9,13,20,.95)');
    drawSkyline(ctx, W, H, H * lerp(0.80, 0.96, smoothstep(p, 0, 0.44)), tScale * 0.7, townIn * 0.42, 'rgba(16,23,34,.9)');
  }

  /* the one house, growing under the descent */
  var appear = smoothstep(p, 0.03, 0.17) * (1 - smoothstep(p, 0.31, 0.44));
  if (appear > 0.002) {
    var gs = smoothstep(p, 0.02, 0.46);
    drawHouse(ctx, cx, H * lerp(0.80, 0.66, gs), W * lerp(0.05, 0.62, gs), appear, true);
  }

  /* the arrival: the stack has become a roof over a home */
  var home = smoothstep(p, 0.835, 0.945);
  if (home > 0.002) {
    ctx.globalAlpha = home;
    drawSkyline(ctx, W, H, groundY - H * 0.02, 0.9, 0.9, 'rgba(8,12,18,.96)');
    var groundY = H * (narrow > 1.25 ? 0.955 : 0.92);
    var bw = sw * 0.62, bx0 = cx - bw / 2, by0 = eaveY - 2, by1 = groundY;
    if (by1 > by0) {
      var bg = ctx.createLinearGradient(0, by0, 0, by1);
      bg.addColorStop(0, 'rgba(28,38,50,.99)'); bg.addColorStop(1, 'rgba(12,17,25,.99)');
      ctx.fillStyle = bg; ctx.fillRect(bx0, by0, bw, by1 - by0);
      ctx.strokeStyle = 'rgba(160,184,208,.3)'; ctx.lineWidth = 1;
      ctx.strokeRect(bx0 + 0.5, by0 + 0.5, bw - 1, by1 - by0 - 1);
      var bh = by1 - by0;
      ctx.fillStyle = 'rgba(255,226,186,.5)';
      ctx.fillRect(bx0 + bw * 0.12, by0 + bh * 0.24, bw * 0.15, bh * 0.32);
      ctx.fillRect(bx0 + bw * 0.73, by0 + bh * 0.24, bw * 0.15, bh * 0.32);
      var wgl = ctx.createRadialGradient(bx0 + bw * 0.5, by0 + bh * 0.4, 0, bx0 + bw * 0.5, by0 + bh * 0.4, bw * 0.9);
      wgl.addColorStop(0, 'rgba(255,214,160,.10)'); wgl.addColorStop(1, 'rgba(255,214,160,0)');
      ctx.fillStyle = wgl; ctx.fillRect(bx0 - bw, by0 - bh, bw * 3, bh * 3);
      ctx.fillStyle = 'rgba(10,14,21,.99)';
      ctx.fillRect(bx0 + bw * 0.44, by0 + bh * 0.42, bw * 0.13, bh * 0.58);
      ctx.fillStyle = 'rgba(255,226,186,.34)';
      ctx.fillRect(bx0 + bw * 0.44, by0 + bh * 0.42, bw * 0.13, bh * 0.05);
    }
    var lawn = ctx.createLinearGradient(0, groundY, 0, H);
    lawn.addColorStop(0, 'rgba(10,15,22,.99)'); lawn.addColorStop(1, 'rgba(5,8,12,1)');
    ctx.fillStyle = lawn; ctx.fillRect(0, groundY, W, H - groundY + 1);
    var ag = ctx.createRadialGradient(cx, eaveY, 0, cx, eaveY, sw * 0.8);
    ag.addColorStop(0, 'rgba(232,54,79,.12)'); ag.addColorStop(1, 'rgba(232,54,79,0)');
    ctx.fillStyle = ag; ctx.fillRect(cx - sw, eaveY - sh * 2, sw * 2, sh * 3);
    ctx.globalAlpha = 1;
  }

  /* the six layers, flat and full bleed at the cut, pitched into a roof at the arrival */
  var cut = smoothstep(p, 0.36, 0.46);
  if (cut > 0.002 && tiles) {
    var ang = Math.atan(pitch);
    var slope = (sw * 0.5) / Math.cos(ang);
    for (var side = 0; side < 2; side++) {
      ctx.save();
      if (pitch > 0.004) {
        ctx.beginPath();
        if (side === 0) ctx.rect(-20, -20, cx + 20, H + 40);
        else ctx.rect(cx, -20, W - cx + 20, H + 40);
        ctx.clip();
      }
      ctx.translate(cx, sTop);
      if (side === 0) ctx.scale(-1, 1);
      ctx.rotate(ang);
      for (var L = 0; L < LAYERS.length; L++) {
        var t0 = 0.435 + L * 0.055;
        var rv = smoothstep(p, t0, t0 + 0.05);
        if (rv <= 0.002) continue;
        ctx.globalAlpha = rv * cut;
        /* wipe outward from the ridge, so the layer is laid rather than slid */
        var srcW = Math.max(1, Math.round(tiles[L].width * rv));
        ctx.drawImage(tiles[L], 0, 0, srcW, tiles[L].height,
                      0, LAYER_TOP[L] * RH * k, slope * rv, LAYERS[L].th * RH * k + 1);
      }
      ctx.globalAlpha = 1;
      ctx.restore();
    }
    /* the ridge cap covering the join, which is literally the ridge vent */
    if (pull > 0.02) {
      ctx.globalAlpha = cut;
      var rcw = Math.max(sw * 0.055, sh * 0.22), rch = sh * 0.20;
      var rg = ctx.createLinearGradient(0, sTop - rch, 0, sTop + rch * 0.7);
      rg.addColorStop(0, '#A8B6C4'); rg.addColorStop(0.5, '#75828F'); rg.addColorStop(1, '#3E4954');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.moveTo(cx - rcw, sTop + rcw * pitch + rch * 0.3);
      ctx.lineTo(cx - rcw * 0.5, sTop - rch * 0.62);
      ctx.lineTo(cx + rcw * 0.5, sTop - rch * 0.62);
      ctx.lineTo(cx + rcw, sTop + rcw * pitch + rch * 0.3);
      ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(214,230,246,.22)'; ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - rcw * 0.5, sTop - rch * 0.62);
      ctx.lineTo(cx + rcw * 0.5, sTop - rch * 0.62);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }

    /* the layer labels, chipped so they stay readable on their own texture */
    var lab = cut * (1 - smoothstep(p, 0.76, 0.84));
    if (lab > 0.03 && W > 760) {
      ctx.font = '500 11px "IBM Plex Mono", ui-monospace, monospace';
      ctx.textBaseline = 'middle';
      for (var M = 0; M < LAYERS.length; M++) {
        var mv = smoothstep(p, 0.435 + M * 0.055, 0.435 + M * 0.055 + 0.05);
        if (mv <= 0.03) continue;
        var txt = LAYERS[M].name;
        var tx = Math.max(22, cx - sw * 0.5 + 34);
        var ty = sTop + (LAYER_TOP[M] + LAYERS[M].th * 0.5) * RH * k;
        var tw = ctx.measureText(txt).width;
        ctx.globalAlpha = lab * mv;
        ctx.fillStyle = 'rgba(8,11,17,.66)';
        ctx.fillRect(tx - 9, ty - 9, tw + 18, 18);
        ctx.fillStyle = 'rgba(232,54,79,.9)';
        ctx.fillRect(tx - 9, ty - 9, 2, 18);
        ctx.fillStyle = '#C8D6E4';
        ctx.fillText(txt, tx, ty + 0.5);
        ctx.globalAlpha = 1;
      }
    }

    /* stones landing on the top surface */
    var act = smoothstep(p, 0.40, 0.50) * (1 - smoothstep(p, 0.70, 0.82));
    if (act > 0.01) {
      for (var rI = 0; rI < RINGS.length; rI++) {
        var ph = ((t * 0.6 + RINGS[rI].o) % 1 + 1) % 1;
        var rx = ph * W * 0.075;
        var ra = (1 - ph) * (1 - ph) * 0.5 * act;
        var ox = RINGS[rI].x * W;
        var oy = sTop + Math.abs(ox - cx) * pitch + 3;
        ctx.strokeStyle = 'rgba(214,232,252,' + ra.toFixed(3) + ')';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(ox, oy, rx, rx * 0.26, 0, 0, Math.PI * 2);
        ctx.stroke();
        if (ph < 0.14) {
          var fa = (1 - ph / 0.14) * 0.55 * act;
          var fg = ctx.createRadialGradient(ox, oy, 0, ox, oy, W * 0.035);
          fg.addColorStop(0, 'rgba(236,246,255,' + fa.toFixed(3) + ')');
          fg.addColorStop(1, 'rgba(236,246,255,0)');
          ctx.fillStyle = fg;
          ctx.fillRect(ox - W * 0.04, oy - W * 0.04, W * 0.08, W * 0.08);
        }
      }
    }
  }

  /* hail, in front of everything, falling from the very first frame */
  var dens = (0.34 + 0.66 * smoothstep(p, 0.02, 0.26)) * (1 - smoothstep(p, 0.66, 0.93));
  if (dens > 0.004) {
    var n = Math.floor(HAIL.length * (0.18 + 0.82 * dens));
    ctx.lineCap = 'round';
    for (var hI = 0; hI < n; hI++) {
      var h = HAIL[hI];
      var fall = ((h.y + t * (0.2 + 0.5 * h.s) * (0.7 + 1.4 * p) * (0.45 + h.d)) % 1 + 1) % 1;
      var hy = fall * (H * 1.3) - H * 0.15;
      var hx = ((h.x + t * 0.006 * (0.3 + h.d)) % 1 + 1) % 1 * W;
      var len = (14 + 40 * h.s) * (0.3 + h.d) * (0.7 + 0.8 * p);
      var ha = (0.12 + 0.46 * h.d) * (0.3 + 0.7 * dens);
      ctx.strokeStyle = 'rgba(206,228,254,' + ha.toFixed(3) + ')';
      ctx.lineWidth = 0.6 + 1.7 * h.d;
      ctx.beginPath(); ctx.moveTo(hx, hy); ctx.lineTo(hx - len * 0.2, hy - len); ctx.stroke();
    }
    if (dens > 0.5) {
      var bigA = (dens - 0.5) / 0.5;
      for (var sI = 0; sI < STONES.length; sI++) {
        var st = STONES[sI];
        var sf = ((st.y + t * 0.36 * st.s) % 1 + 1) % 1;
        var sy = sf * (H * 1.3) - H * 0.15;
        var sx = st.x * W;
        var rr = (1.8 + 2.6 * st.d) * (0.8 + 0.6 * p);
        var sa = 0.5 * st.d * bigA;
        var lg = ctx.createLinearGradient(sx, sy, sx - rr * 2.2, sy - rr * 13);
        lg.addColorStop(0, 'rgba(226,240,255,' + (sa * 0.7).toFixed(3) + ')');
        lg.addColorStop(1, 'rgba(226,240,255,0)');
        ctx.strokeStyle = lg; ctx.lineWidth = rr * 0.9;
        ctx.beginPath(); ctx.moveTo(sx, sy); ctx.lineTo(sx - rr * 2.2, sy - rr * 13); ctx.stroke();
        ctx.fillStyle = 'rgba(240,248,255,' + sa.toFixed(3) + ')';
        ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.fill();
      }
    }
  }

  /* grade */
  var vg = ctx.createRadialGradient(cx, H * 0.46, Math.min(W, H) * 0.24, cx, H * 0.5, Math.max(W, H) * 0.82);
  vg.addColorStop(0, 'rgba(6,9,14,0)');
  vg.addColorStop(1, 'rgba(6,9,14,.62)');
  ctx.fillStyle = vg; ctx.fillRect(0, 0, W, H);

  if (!ctx._grain) ctx._grain = ctx.createPattern(buildNoise(), 'repeat');
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = ctx._grain; ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
}

function drawSkyline(ctx, W, H, y, scale, alpha, color) {
  if (alpha <= 0.004 || y > H * 1.5) return;
  ctx.globalAlpha = Math.min(1, alpha);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(-20, H + 20);
  var n = Math.max(5, Math.min(SKYLINE.length, Math.round(W / 118)));
  var step = (W + 60) / (n - 1);
  for (var q = 0; q < n; q++) {
    var bx = -30 + q * step;
    var hw = step * 0.5 * SKYLINE[q].w;
    var hh = SKYLINE[q].h * Math.min(H * 0.05, step * 0.5) * scale;
    ctx.lineTo(bx - hw, y);
    ctx.lineTo(bx, y - hh);
    ctx.lineTo(bx + hw, y);
  }
  ctx.lineTo(W + 20, H + 20);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawHouse(ctx, cx, cy, u, alpha, detail) {
  ctx.globalAlpha = alpha;
  ctx.fillStyle = 'rgba(6,9,14,.96)';
  ctx.beginPath();
  ctx.moveTo(cx - u * 1.24, cy);
  ctx.lineTo(cx, cy - u * 0.70);
  ctx.lineTo(cx + u * 1.24, cy);
  ctx.lineTo(cx + u, cy);
  ctx.lineTo(cx + u, cy + u * 1.3);
  ctx.lineTo(cx - u, cy + u * 1.3);
  ctx.lineTo(cx - u, cy);
  ctx.closePath();
  ctx.fill();
  if (detail && u > 26) {
    ctx.fillRect(cx + u * 0.42, cy - u * 0.48, u * 0.19, u * 0.42);
    ctx.fillStyle = 'rgba(255,224,182,' + (0.2 * alpha).toFixed(3) + ')';
    ctx.fillRect(cx - u * 0.6, cy + u * 0.3, u * 0.28, u * 0.3);
    ctx.fillRect(cx + u * 0.32, cy + u * 0.3, u * 0.28, u * 0.3);
    ctx.strokeStyle = 'rgba(160,184,208,' + (0.3 * alpha).toFixed(3) + ')';
    ctx.lineWidth = Math.max(1, u * 0.014);
    ctx.beginPath();
    ctx.moveTo(cx - u * 1.24, cy);
    ctx.lineTo(cx, cy - u * 0.70);
    ctx.lineTo(cx + u * 1.24, cy);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

/* ------------------------------------------------------------- canvas sizing */

function fit(cv) {
  if (!cv || typeof cv.getContext !== 'function') return null;
  var probe = null;
  try { probe = cv.getContext('2d'); } catch (e) { probe = null; }
  if (!probe) return null;
  var dpr = Math.min(2, window.devicePixelRatio || 1);
  var r = cv.getBoundingClientRect();
  var w = Math.max(1, Math.round(r.width)), h = Math.max(1, Math.round(r.height));
  if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) {
    cv.width = Math.round(w * dpr);
    cv.height = Math.round(h * dpr);
  }
  probe.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx: probe, w: w, h: h };
}

/* ------------------------------------------------------------------ the hero */

var hero = $('#top'), stage = $('#stage'), sky = $('#sky');
var hudEl = $('#hud'), hudText = $('#hudtext');
var bandEls = $$('.band');
var canFit = (function () {
  try { var t = document.createElement('canvas'); return !!(t.getContext && t.getContext('2d')); }
  catch (e) { return false; }
})();
if (!canFit) document.documentElement.classList.add('no-canvas-probe');

var bands = bandEls.map(function (el, idx) {
  return {
    el: el, i: idx,
    a: parseFloat(el.dataset.a), b: parseFloat(el.dataset.b),
    ramp: el.dataset.ramp ? parseFloat(el.dataset.ramp) : 0,
    op: -1, k: -1
  };
});

/* split the headlines once, with a seeded generator so every load is identical */
function splitText() {
  $$('.vis[data-split]').forEach(function (vis, vi) {
    var band = vis.closest('.band');
    var mode = vis.dataset.split;
    var spread = band && band.dataset.spread ? parseFloat(band.dataset.spread) : 0.45;
    var emIdx = band && band.dataset.em ? parseInt(band.dataset.em, 10) : -1;
    var r = rng(4801 + vi * 977);
    var words = vis.textContent.split(/(\s+)/).filter(function (s) { return s.length; });
    var chars = [], wi = 0;
    vis.textContent = '';
    words.forEach(function (word) {
      if (/^\s+$/.test(word)) { vis.appendChild(document.createTextNode(' ')); return; }
      var w = document.createElement('span');
      w.className = 'w';
      if (wi === emIdx) w.classList.add('em');
      if (mode === 'char') {
        for (var ci = 0; ci < word.length; ci++) {
          var c = document.createElement('span');
          c.className = 'c';
          c.textContent = word[ci];
          chars.push(c);
          w.appendChild(c);
        }
      } else {
        w.textContent = word;
      }
      vis.appendChild(w);
      wi++;
    });

    var ws = $$('.w', vis);
    ws.forEach(function (w, n) {
      w.style.setProperty('--th', (n / Math.max(1, ws.length) * spread + r() * 0.05).toFixed(3));
    });
    if (mode === 'char') {
      var scatter = band && band.classList.contains('e-scatter');
      chars.forEach(function (c, n) {
        var th = scatter ? (r() * 0.55) : (n / Math.max(1, chars.length) * spread + r() * 0.06);
        c.style.setProperty('--th', th.toFixed(3));
        if (scatter) {
          c.style.setProperty('--jx', ((r() * 2 - 1) * 52).toFixed(1) + 'px');
          c.style.setProperty('--jy', ((r() * 2 - 1) * 46).toFixed(1) + 'px');
          c.style.setProperty('--jr', ((r() * 2 - 1) * 26).toFixed(1) + 'deg');
        } else {
          c.style.setProperty('--jx', ((r() > 0.5 ? 1 : -1) * (26 + r() * 40)).toFixed(1) + 'px');
        }
      });
    }
  });
}

var loadK = 0, loadStart = 0;
function updateCaptions(p) {
  for (var i = 0; i < bands.length; i++) {
    var B = bands[i];
    var f = Math.min(0.02, (B.b - B.a) / 3);
    var inn = i === 0 ? 1 : smoothstep(p, B.a, B.a + f);
    var out = i === bands.length - 1 ? 0 : smoothstep(p, B.b - f, B.b);
    var op = Math.round(inn * (1 - out) * 1000) / 1000;
    if (op !== B.op) { B.op = op; B.el.style.opacity = op; }

    var ramp = B.ramp || Math.min(0.025, (B.b - B.a) * 0.35);
    var k = clamp((p - B.a) / ramp, 0, 1);
    if (i === 0) k = Math.max(k, loadK);
    if (k !== B.k && (Math.abs(k - B.k) >= 0.008 || k === 0 || k === 1)) {
      B.k = k;
      B.el.style.setProperty('--k', k.toFixed(3));
    }
  }
}

var lastHud = '', lastHudAt = 0, lastDeep = null;
function updateHud(p, now) {
  var deep = p > 0.045;
  if (deep !== lastDeep) { lastDeep = deep; stage.classList.toggle('deep', deep); }
  if (now - lastHudAt < 100) return;
  var txt;
  if (p < 0.36) {
    txt = 'Hail ' + (0.5 + p * 4.4).toFixed(1) + ' in · Wind ' + Math.round(38 + p * 140) + ' mph';
  } else if (p < 0.86) {
    var li = clamp(Math.floor((p - 0.40) / 0.055), 0, 5);
    txt = 'Layer ' + (li + 1) + ' of 6 · ' + LAYERS[li].short;
  } else {
    txt = 'Six layers · Sealed and holding';
  }
  if (txt === lastHud) return;
  lastHud = txt; lastHudAt = now;
  hudText.textContent = txt;
}

function heroProgress() {
  var range = hero.offsetHeight - window.innerHeight;
  if (range <= 0) return 0;
  return clamp(-hero.getBoundingClientRect().top / range, 0, 1);
}

var target = 0, shown = 0, rafId = null, lastTick = 0, lastDraw = 0, amb = 0;
var heroOn = false, docHidden = false, scrubOn = false, heroReady = false;
var skyCtx = null, skyW = 0, skyH = 0;

function drawHero(p, t) {
  if (!skyCtx) return;
  paint(skyCtx, skyW, skyH, p, t);
}

function tick(now) {
  var dt = Math.min(100, now - (lastTick || now));
  lastTick = now;
  shown += (target - shown) * (1 - Math.pow(1 - 0.16, dt / 16.667));
  var converged = Math.abs(target - shown) < 0.0005;
  if (converged) shown = target;

  var live = heroOn && !docHidden && scrubOn;
  if (live) amb += dt / 1000;

  if (loadK < 1) {
    if (!loadStart) loadStart = now;
    loadK = clamp((now - loadStart) / 900, 0, 1);
    loadK = loadK * loadK * (3 - 2 * loadK);
  }

  if (!converged || now - lastDraw > 26) { lastDraw = now; drawHero(shown, amb); }
  updateCaptions(shown);
  updateHud(shown, now);

  if (live || !converged || loadK < 1) rafId = requestAnimationFrame(tick);
  else { rafId = null; lastTick = 0; }
}

function onScroll() {
  target = heroProgress();
  if (rafId === null && heroOn && scrubOn) { lastTick = 0; rafId = requestAnimationFrame(tick); }
}

function initHeroOnce() {
  if (heroReady) return;
  heroReady = true;
  var f = fit(sky);
  if (!f) { skyCtx = null; target = shown = heroProgress(); return; }
  buildTiles();
  skyCtx = f.ctx; skyW = f.w; skyH = f.h;
  target = shown = heroProgress();
  drawHero(shown, 0);
}

/* the five gates, matched character for character with the CSS */
var GATES = [
  '(max-width:720px)',
  '(orientation:portrait) and (max-width:1024px)',
  '(orientation:portrait) and (pointer:coarse)',
  '(orientation:landscape) and (pointer:coarse) and (max-height:560px)',
  '(prefers-reduced-motion:reduce)'
];
var MQLS = GATES.map(function (q) { return window.matchMedia(q); });

function enableScrub() {
  if (scrubOn || !canFit) return;
  scrubOn = true;
  initHeroOnce();
  window.addEventListener('scroll', onScroll, { passive: true });
  bands.forEach(function (B) { B.op = -1; B.k = -1; });
  unpinFinalStates();
  updateCaptions(heroProgress());
  onScroll();
}
function disableScrub() {
  if (!scrubOn) return;
  scrubOn = false;
  window.removeEventListener('scroll', onScroll);
  if (rafId !== null) { cancelAnimationFrame(rafId); rafId = null; }
}
function applyHeroMode() {
  if (!canFit) { document.body.classList.add('no-canvas'); disableScrub(); return; }
  var gated = MQLS.some(function (m) { return m.matches; });
  if (gated) { disableScrub(); drawStill(); requestAnimationFrame(drawStill); }
  else enableScrub();
}
MQLS.forEach(function (m) {
  if (m.addEventListener) m.addEventListener('change', applyHeroMode);
  else if (m.addListener) m.addListener(applyHeroMode);
});

/* the static hero: the same world, painted once at its resting frame */
var still = $('#still');
function drawStill() {
  if (!canFit || !still) return;
  if (!still.offsetParent && still.offsetWidth === 0) return;
  var f = fit(still);
  if (!f) return;
  buildTiles();
  paint(f.ctx, f.w, f.h, 1, 0);
}

if (hero && stage && sky) {
  splitText();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      heroOn = es[0].isIntersecting;
      if (heroOn && scrubOn && rafId === null) { lastTick = 0; rafId = requestAnimationFrame(tick); }
    }, { rootMargin: '10% 0px' }).observe(hero);
  } else { heroOn = true; }
  applyHeroMode();
}

/* ----------------------------------------------------- resize, pause, reduce */

var rz = null;
window.addEventListener('resize', function () {
  clearTimeout(rz);
  rz = setTimeout(function () {
    if (scrubOn && heroReady) {
      var f = fit(sky);
      if (f) { skyCtx = f.ctx; skyW = f.w; skyH = f.h; }
      target = heroProgress();
      drawHero(shown, amb);
      if (rafId === null) { lastTick = 0; rafId = requestAnimationFrame(tick); }
    } else {
      drawStill();
    }
    sizeTest();
  }, 160);
}, { passive: true });

document.addEventListener('visibilitychange', function () {
  docHidden = document.hidden;
  document.body.classList.toggle('paused', docHidden);
  if (!docHidden && scrubOn && heroOn && rafId === null) { lastTick = 0; rafId = requestAnimationFrame(tick); }
});

/* ------------------------------------------------- below the fold, choreography */

var pinned = [];
function observeIn(el, cb) {
  if (!('IntersectionObserver' in window)) { el.classList.add('in', 'done'); if (cb) cb(); return; }
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return;
      el.classList.add('in');
      if (cb) cb();
      setTimeout(function () { el.classList.add('done'); }, 2000);
      io.unobserve(el);
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });
  io.observe(el);
}

$$('.rise, .stack-fig, .steps, .quotes, .roofline, .nums').forEach(function (el) { observeIn(el); });

/* the roofline dividers draw themselves */
$$('.roofline').forEach(function (svg) {
  var path = $('path', svg);
  if (path && path.getTotalLength) {
    var len = Math.ceil(path.getTotalLength());
    svg.style.setProperty('--len', len);
  }
});

/* counters, written only when the string changes */
function runCounters() {
  $$('#nums b[data-count]').forEach(function (el) {
    if (el.dataset.ran) return;
    el.dataset.ran = '1';
    var to = parseFloat(el.dataset.count);
    var dec = el.dataset.dec ? parseInt(el.dataset.dec, 10) : 0;
    var suffix = el.dataset.suffix || '';
    var t0 = 0, last = '';
    if (to === 0) { el.textContent = '0' + suffix; return; }
    function step(now) {
      if (!t0) t0 = now;
      var q = clamp((now - t0) / 1250, 0, 1);
      q = 1 - Math.pow(1 - q, 3);
      var v = (to * q).toFixed(dec);
      var s = (dec ? v : Math.round(to * q).toLocaleString('en-US')) + suffix;
      if (s !== last) { last = s; el.textContent = s; }
      if (q < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
}
var numsEl = $('#nums');
if (numsEl) observeIn(numsEl, runCounters);

/* nav state */
var nav = $('.nav'), navSolid = null;
window.addEventListener('scroll', function () {
  var s = window.scrollY > 40;
  if (s !== navSolid) { navSolid = s; nav.classList.toggle('solid', s); }
}, { passive: true });

/* -------------------------------------------------------------- the storm test */

var testCv = $('#testcv'), holdBtn = $('#hold'), gauge = $('#gaugefill'),
    testOut = $('#testout'), testRead = $('#testread'), testStage = $('#teststage');
var tProg = 0, tHold = false, tRaf = null, tLast = 0, tAmb = 0, tOn = false,
    tDone = false, tCtx = null, tW = 0, tH = 0, tImpacts = 0, lastRead = '', lastReadAt = 0, lastG = -1;
var TR = rng(3312), THAIL = [];
for (i = 0; i < 90; i++) THAIL.push({ x: TR(), y: TR(), d: TR(), s: 0.5 + TR() });

function sizeTest() {
  if (!canFit || !testCv) return;
  var f = fit(testCv);
  if (!f) { tCtx = null; return; }
  tCtx = f.ctx; tW = f.w; tH = f.h;
  paintTest();
}
function paintTest() {
  if (!tCtx) return;
  var W = tW, H = tH, p = tProg;
  var g = tCtx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, '#080C14'); g.addColorStop(1, '#141E2B');
  tCtx.fillStyle = g; tCtx.fillRect(0, 0, W, H);

  var roofTop = H * 0.62, sh = H * 0.38, k = sh / RH;
  if (tiles) {
    for (var L = 0; L < LAYERS.length; L++) {
      tCtx.drawImage(tiles[L], 0, roofTop + LAYER_TOP[L] * RH * k, W, LAYERS[L].th * RH * k + 1);
    }
  } else {
    tCtx.fillStyle = '#242C35'; tCtx.fillRect(0, roofTop, W, sh);
  }

  var dens = 0.22 + 0.78 * p;
  tCtx.lineCap = 'round';
  for (var i2 = 0; i2 < Math.floor(THAIL.length * dens); i2++) {
    var h = THAIL[i2];
    var fall = ((h.y + tAmb * (0.45 + 0.9 * h.s) * (0.6 + p)) % 1 + 1) % 1;
    var hy = fall * roofTop;
    var hx = h.x * W;
    var len = (7 + 20 * h.s) * (0.4 + h.d);
    tCtx.strokeStyle = 'rgba(200,224,252,' + ((0.12 + 0.4 * h.d) * (0.3 + 0.7 * dens)).toFixed(3) + ')';
    tCtx.lineWidth = 0.6 + 1.5 * h.d;
    tCtx.beginPath(); tCtx.moveTo(hx, hy); tCtx.lineTo(hx - len * 0.22, hy - len); tCtx.stroke();
  }

  for (var r2 = 0; r2 < 5; r2++) {
    var ph = ((tAmb * (0.5 + 0.6 * p) + r2 * 0.23) % 1 + 1) % 1;
    var rx = ph * W * 0.2;
    var ra = (1 - ph) * 0.5 * (0.25 + 0.75 * p);
    tCtx.strokeStyle = 'rgba(220,236,255,' + ra.toFixed(3) + ')';
    tCtx.lineWidth = 1.3;
    tCtx.beginPath();
    tCtx.ellipse((0.1 + r2 * 0.2) * W, roofTop + 2, rx, rx * 0.22, 0, 0, Math.PI * 2);
    tCtx.stroke();
  }

  if (p > 0.02) {
    var sg = tCtx.createLinearGradient(0, roofTop - H * 0.2, 0, roofTop);
    sg.addColorStop(0, 'rgba(232,54,79,0)');
    sg.addColorStop(1, 'rgba(232,54,79,' + (0.2 * p).toFixed(3) + ')');
    tCtx.fillStyle = sg; tCtx.fillRect(0, roofTop - H * 0.2, W, H * 0.2);
  }
  tCtx.fillStyle = 'rgba(6,9,14,.34)'; tCtx.fillRect(0, 0, W, H * 0.34);
  var tv = tCtx.createRadialGradient(W * 0.5, H * 0.5, Math.min(W, H) * 0.2, W * 0.5, H * 0.5, Math.max(W, H) * 0.72);
  tv.addColorStop(0, 'rgba(6,9,14,0)');
  tv.addColorStop(1, 'rgba(6,9,14,.6)');
  tCtx.fillStyle = tv; tCtx.fillRect(0, 0, W, H);
}

function testTick(now) {
  var dt = Math.min(90, now - (tLast || now));
  tLast = now;
  if (!docHidden) tAmb += dt / 1000;
  if (tHold) tProg = clamp(tProg + dt / 2300, 0, 1);
  else if (!tDone) tProg = clamp(tProg - dt / 1500, 0, 1);

  if (tHold) {
    tImpacts += dt * 0.055 * (0.4 + tProg);
    var rt = 'Impacts ' + Math.round(tImpacts);
    if (rt !== lastRead && now - lastReadAt > 100) { lastRead = rt; lastReadAt = now; testRead.textContent = rt; }
  }
  var gp = Math.round(tProg * 100);
  if (gp !== lastG) { lastG = gp; gauge.style.width = gp + '%'; }

  if (tProg >= 1 && !tDone) completeTest();
  paintTest();

  if (tOn && !docHidden) tRaf = requestAnimationFrame(testTick);
  else { tRaf = null; tLast = 0; }
}
function startTestLoop() {
  if (tRaf === null && tOn) { tLast = 0; tRaf = requestAnimationFrame(testTick); }
}
function completeTest() {
  tDone = true; tProg = 1;
  testOut.classList.add('on');
  holdBtn.textContent = 'It held';
  holdBtn.setAttribute('aria-pressed', 'false');
  setTimeout(function () { testOut.classList.add('done'); }, 1400);
}

if (testCv && holdBtn) {
  sizeTest();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      tOn = es[0].isIntersecting;
      if (tOn) { sizeTest(); startTestLoop(); }
    }, { rootMargin: '15% 0px' }).observe(testStage);
  } else { tOn = true; startTestLoop(); }

  var press = function (e) {
    if (tDone) return;
    if (e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return;
    if (e.type === 'keydown') e.preventDefault();
    tHold = true;
    holdBtn.setAttribute('aria-pressed', 'true');
    holdBtn.textContent = 'Keep holding';
    startTestLoop();
  };
  var release = function () {
    if (!tHold) return;
    tHold = false;
    holdBtn.setAttribute('aria-pressed', 'false');
    if (!tDone) holdBtn.textContent = 'Hold to bring the hail';
  };
  holdBtn.addEventListener('pointerdown', press);
  holdBtn.addEventListener('keydown', press);
  holdBtn.addEventListener('keyup', release);
  holdBtn.addEventListener('blur', release);
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);
}

/* ---------------------------------------------------------------------- FAQ */

$$('.faq-q').forEach(function (btn) {
  btn.addEventListener('click', function () {
    var item = btn.closest('.faq-item');
    var open = item.classList.toggle('open');
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
});

/* --------------------------------------------------------------------- form */

var form = $('#bookform');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    $$('input[required]', form).forEach(function (f) {
      var ok = f.value.trim().length > 1 && (f.type !== 'email' || /.+@.+\..+/.test(f.value));
      f.setAttribute('aria-invalid', ok ? 'false' : 'true');
      f.style.borderColor = ok ? '' : 'var(--accent)';
      if (!ok && !bad) bad = f;
    });
    if (bad) { bad.focus(); return; }
    form.classList.add('sent-on');
    $$('input,select,textarea,button', form).forEach(function (f) { f.disabled = true; });
    var h = $('.sent h3', form);
    if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
  });
}

/* ------------------------------------------------- reduced motion, both ways */

function pinToFinalStates() {
  pinned = [];
  $$('.rise, .stack-fig, .steps, .quotes, .roofline, .nums').forEach(function (el) {
    if (!el.classList.contains('in')) { pinned.push(el); el.classList.add('in'); }
    el.classList.add('done');
  });
  runCounters();
  if (!tDone && holdBtn) { pinned.push(holdBtn); completeTest(); }
  if (tRaf !== null) { cancelAnimationFrame(tRaf); tRaf = null; }
  tOn = false;
}
function unpinFinalStates() {
  if (!pinned || !pinned.length) return;
  pinned.forEach(function (el) {
    if (el === holdBtn) {
      tDone = false; tProg = 0; tImpacts = 0; lastG = -1;
      testOut.classList.remove('on', 'done');
      holdBtn.textContent = 'Hold to bring the hail';
      tOn = true; startTestLoop();
    } else {
      el.classList.remove('in', 'done');
      observeIn(el, el.id === 'nums' ? runCounters : null);
    }
  });
  pinned = [];
}
var rmq = window.matchMedia('(prefers-reduced-motion:reduce)');
function onReduce(e) {
  if (e.matches) pinToFinalStates();
  else applyHeroMode();
}
if (rmq.addEventListener) rmq.addEventListener('change', onReduce);
else if (rmq.addListener) rmq.addListener(onReduce);
if (rmq.matches) pinToFinalStates();

/* ------------------------------------------------------------------- the lift */

var yr = $('#yr');
if (yr) yr.textContent = new Date().getFullYear();
requestAnimationFrame(function () { document.body.classList.add('lit'); });

})();
