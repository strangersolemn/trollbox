// Trollbox screen: comment source, troll avatars, and the typewriter terminal,
// drawn into a 1024x768 canvas. Shared by index.html (the parent) and cafe.html (the site).
(function () {
// ---------------------------------------------------------------------------
// COMMENT SOURCE — the one swappable piece.
// Demo: sample lines + generated troll faces.
// Live: replace loadComments() with Ob1's shielded comment lookup.
// Each comment: { id, text } — id picks the troll PFP; text = null means switched off.
// ---------------------------------------------------------------------------
const SAMPLE_LINES = [
  "floor is lava and you are the floor",
  "imagine paying gas for that",
  "your roadmap is a screenshot of someone else's roadmap",
  "ngmi. never were. never will be.",
  "dev doxxed himself to his mum and she unfollowed",
  "bought the top. again. it's a lifestyle",
  "this comment is worth more than your bag",
  "who keeps listing at 0.0001. we see you. we don't, actually",
  "gm to everyone except the guy who sold me his jpeg",
  "your art is just a gradient with confidence",
  "alpha: there is no alpha",
  "wen moon? wen job?",
  "i'm not saying who i am but i'm in your discord",
  "rugged by my own group chat",
  "100x incoming (for the person who sold to me)",
  "diamond hands, empty fridge",
  "someone tell the 1/1 collectors it's just a png",
  "the real utility was the friends who dumped on us",
  "touch grass? i inscribed the grass",
  null, // switched off — sold clean, doesn't show
  "you can't see me. that's the point.",
  "shielded and still smarter than your whitelist",
  "best project on bitcoin. i'm biased. i'm also anonymous",
  "devs do something. no, not that",
  "i flipped your mint for a kebab",
  "spaces host talked for 3 hours and said nothing. respect",
  "this is the only honest chat on chain",
  "if you can read this you're already too late",
];
function loadComments() {
  return SAMPLE_LINES.map((text, i) => ({ id: (i * 157 + 23) % 4444, text }));
}

// ---------------------------------------------------------------------------
// Placeholder troll PFPs (until the real trait art drops in).
// Pixel faces on a 16x16 grid, seeded by token id.
// ---------------------------------------------------------------------------
function rng(seed) { let s = seed * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); }
const SKINS = ["#7bd34f", "#5fb7a8", "#c9a24a", "#9b7fd1", "#d9776a", "#88c06a"];
const HAIR  = ["#1c1c1c", "#e8e2c8", "#f2c14e", "#ff5ca8", "#4ad6ff", "#ff7a1a"];
function drawTroll(id, size) {
  const c = document.createElement("canvas"); c.width = c.height = 16;
  const g = c.getContext("2d"), r = rng(id + 1);
  const skin = SKINS[Math.floor(r() * SKINS.length)], hair = HAIR[Math.floor(r() * HAIR.length)];
  g.fillStyle = "#101a10"; g.fillRect(0, 0, 16, 16);
  g.fillStyle = skin; g.fillRect(3, 4, 10, 10); g.fillRect(2, 6, 12, 6);
  // ears
  g.fillRect(1, 7, 1, 3); g.fillRect(14, 7, 1, 3);
  // hair tuft
  g.fillStyle = hair; const h = 2 + Math.floor(r() * 3);
  for (let x = 4; x < 12; x++) if (r() > 0.35) g.fillRect(x, 4 - Math.floor(r() * h), 1, 1 + Math.floor(r() * h));
  // eyes
  g.fillStyle = "#fff"; g.fillRect(5, 7, 2, 2); g.fillRect(9, 7, 2, 2);
  g.fillStyle = "#000"; const look = r() > 0.5 ? 1 : 0; g.fillRect(5 + look, 8, 1, 1); g.fillRect(9 + look, 8, 1, 1);
  // nose
  g.fillStyle = "rgba(0,0,0,.25)"; g.fillRect(7, 9, 2, 2 + Math.floor(r() * 2));
  // grin
  g.fillStyle = "#2a0d0d"; g.fillRect(5, 12, 6, 1);
  g.fillStyle = "#fff"; if (r() > 0.4) g.fillRect(6, 12, 1, 1); if (r() > 0.4) g.fillRect(9, 12, 1, 1);
  const out = document.createElement("canvas"); out.width = out.height = size;
  const o = out.getContext("2d"); o.imageSmoothingEnabled = false; o.drawImage(c, 0, 0, size, size);
  return out;
}

// ---------------------------------------------------------------------------
// The screen: a canvas texture with the scrolling troll log.
// ---------------------------------------------------------------------------
const SW = 1024, SH = 768;
const screen = document.createElement("canvas"); screen.width = SW; screen.height = SH;
const sg = screen.getContext("2d");
const PHOS = "#7dff9a", DIM = "#2f7a44";
const LINE_H = 30, AV = 24, PAD = 40, HEADER = 92, FOOTER = 54;
const FONT = "22px 'Courier New', monospace";

const comments = loadComments().filter(c => c.text);
const avatars = new Map();
comments.forEach(c => avatars.set(c.id, drawTroll(c.id, AV)));
// Real trolls: build each avatar from the trait art (seeded by id), head crop, swapped in once loaded.
// On-chain this becomes the troll's own inscription content; here it reads traits-avif/.
(function realAvatars() {
  const base = (window.TROLLBOX_TRAITS || "traits-avif/") ;
  fetch(base + "manifest.json").then(r => r.json()).then(M => {
    const pickFrom = (list, r) => list[Math.floor(r() * list.length)];
    comments.forEach(c => {
      const r = rng(c.id * 7 + 3);
      const body = pickFrom(M.bodies, r), hood = /hoodie/.test(body);
      const eyes = pickFrom(hood ? M.eyes.filter(e => !/shades|glasses/.test(e)) : M.eyes, r);
      const layers = ["hands/hands-f1.avif", "bodies/" + body, "tv screen/tv-f1.avif", "eyes/" + eyes, "mouths/" + pickFrom(M.mouths, r)];
      if (!hood) layers.push("headwear/" + pickFrom(M.headwear, r));
      Promise.all(layers.map(f => new Promise(res => { const im = new Image(); im.onload = () => res(im); im.onerror = () => res(null); im.src = base + f; })))
        .then(ims => {
          const big = document.createElement("canvas"); big.width = big.height = 1000; const g = big.getContext("2d");
          g.fillStyle = "#1e1e1e"; g.fillRect(0, 0, 1000, 1000);
          ims.forEach(im => im && g.drawImage(im, 0, 0, 1000, 1000));
          const out = document.createElement("canvas"); out.width = out.height = AV * 2; // 2x for crisp texture
          out.getContext("2d").drawImage(big, 300, 0, 520, 520, 0, 0, AV * 2, AV * 2);   // head crop
          avatars.set(c.id, out);
        });
    });
  }).catch(() => {});
})();

// pre-wrap each comment into rows
sg.font = FONT;
const maxW = SW - PAD * 2 - AV - 120;
function wrap(text) {
  const words = text.split(" "), rows = []; let line = "";
  for (const w of words) {
    const t = line ? line + " " + w : w;
    if (sg.measureText(t).width > maxW && line) { rows.push(line); line = w; } else line = t;
  }
  if (line) rows.push(line);
  return rows;
}
const entries = comments.map(c => ({ ...c, rows: wrap(c.text) }));
// ---------------------------------------------------------------------------
// Typewriter: each comment is typed out one character at a time at the bottom,
// then the whole log rolls up a line, like an old terminal.
// ---------------------------------------------------------------------------
const history = entries.slice(-8); // finished entries, oldest first (pre-filled so the screen isn't empty)
let nextIdx = 0, cur = null;   // cur = { e, n, rows, phase, wait }
let shift = 0, lastT = 0;
let onKeystroke = () => {};    // set by whoever owns the keyboard
const entryH = rowsN => rowsN * LINE_H + 12;
const rowsShown = (e, n) => { let left = n, k = 0; for (const r of e.rows) { if (left <= 0) break; k++; left -= r.length + 1; } return Math.max(1, k); };

function startNext() {
  const e = entries[nextIdx++ % entries.length];
  cur = { e, n: 0, rowsN: 1, phase: "arrive", wait: 0.35 };
  shift += entryH(1);          // everything rolls up to make room
}
function stepTyper(dt) {
  if (!cur) startNext();
  cur.wait -= dt;
  if (cur.wait > 0) return;
  if (cur.phase === "arrive") { cur.phase = "type"; cur.wait = 0; }
  if (cur.phase === "type") {
    const total = cur.e.text.length;
    while (cur.wait <= 0 && cur.n < total) {
      cur.n++;
      const ch = cur.e.text[cur.n - 1];
      onKeystroke();
      cur.wait += ch === " " ? 0.07 + Math.random() * 0.06
               : ".,!?".includes(ch) ? 0.18 + Math.random() * 0.12
               : 0.035 + Math.random() * 0.05;
      const rn = rowsShown(cur.e, cur.n);
      if (rn > cur.rowsN) { shift += (rn - cur.rowsN) * LINE_H; cur.rowsN = rn; }
    }
    if (cur.n >= total) { cur.phase = "hold"; cur.wait = 1.1; }
    return;
  }
  if (cur.phase === "hold") {
    history.push(cur.e); if (history.length > 40) history.shift();
    cur = null; startNext();
  }
}

function drawEntry(e, y, n, cursorOn) {
  sg.drawImage(avatars.get(e.id), PAD, y, AV, AV);
  sg.fillStyle = DIM; sg.fillText("#" + String(e.id).padStart(4, "0"), PAD + AV + 12, y + 20);
  sg.fillStyle = PHOS;
  let left = n, cx = PAD + AV + 110, cy = y + 20;
  for (let i = 0; i < e.rows.length; i++) {
    if (left <= 0 && i > 0) break;
    const part = e.rows[i].slice(0, Math.max(0, left));
    cy = y + 20 + i * LINE_H;
    sg.fillText(part, PAD + AV + 110, cy);
    cx = PAD + AV + 110 + sg.measureText(part).width;
    left -= e.rows[i].length + 1;
  }
  if (cursorOn) sg.fillRect(cx + 2, cy - 18, 12, 22);
}

function drawScreen(t) {
  const dt = Math.min(0.1, t - lastT); lastT = t;
  stepTyper(dt);
  shift *= Math.pow(0.0005, dt);   // ease the roll-up

  sg.fillStyle = "#020b05"; sg.fillRect(0, 0, SW, SH);

  // header
  sg.font = "bold 26px 'Courier New', monospace"; sg.fillStyle = PHOS;
  sg.fillText("TROLLBOX v1.0", PAD, 50);
  sg.font = "18px 'Courier New', monospace"; sg.fillStyle = DIM;
  sg.fillText("SHIELDED  ·  " + comments.length + " TROLLS ONLINE  ·  SENDER: UNKNOWN", PAD, 76);
  sg.fillRect(PAD, HEADER - 6, SW - PAD * 2, 2);

  // the log, bottom-anchored, clipped between header and footer
  sg.save();
  sg.beginPath(); sg.rect(0, HEADER, SW, SH - HEADER - FOOTER); sg.clip();
  sg.font = FONT;
  let y = SH - FOOTER - 6 + shift;
  if (cur) {
    y -= entryH(cur.rowsN);
    const blink = cur.phase === "type" || Math.floor(t * 2.5) % 2 === 0;
    drawEntry(cur.e, y, cur.phase === "arrive" ? 0 : cur.n, blink);
  }
  for (let i = history.length - 1; i >= 0 && y > HEADER; i--) {
    const e = history[i];
    y -= entryH(e.rows.length);
    drawEntry(e, y, e.text.length, false);
  }
  sg.restore();

  // footer
  sg.fillStyle = DIM; sg.fillRect(PAD, SH - FOOTER + 2, SW - PAD * 2, 2);
  sg.font = "18px 'Courier New', monospace"; sg.fillStyle = DIM;
  sg.fillText(cur && cur.phase === "type" ? "> someone is typing..." : "> ", PAD, SH - 20);

  // scanlines + vignette
  sg.fillStyle = "rgba(0,0,0,0.28)";
  for (let y = 0; y < SH; y += 3) sg.fillRect(0, y, SW, 1);
  const v = sg.createRadialGradient(SW / 2, SH / 2, SH * 0.3, SW / 2, SH / 2, SH * 0.85);
  v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,0.6)");
  sg.fillStyle = v; sg.fillRect(0, 0, SW, SH);
}


window.TrollboxScreen = {
  canvas: screen,
  draw: drawScreen,
  setKeystroke: fn => { onKeystroke = fn; },
  count: () => comments.length,
  avatars,
};
})();
