// Trollbox site v2 helpers (home.html, roll.html). Needs recolor.js + troll-sprites.js first.
//   TB.load(size)                      → TrollSprites instance (cached per size)
//   TB.draw(g, T, sp, x, y, w, hf, tf) → one troll, glitch backgrounds included
//   TB.face(n)                         → canvas: troll n's head, for the Trollbox screen avatars
window.TB = (() => {
  // GL1TCH C0DE backgrounds, redrawn in plain canvas from the on-chain p5 sketches (glitch/gc02, gc03.sketch.js)
  const GLITCH = {
    ec19445f6994cf2ff7bd3582a3ad474442f5fe75a3034474f3846f74856b612di0: { bg: "rgb(20,20,20)", fg: "#fff", n: 20000, s: 4 },
    "0f34b3b81c9580926694378e22e267cd234802b44cfc10517d70675378e83eaai0": { bg: "rgb(10,10,27)", fg: "rgb(255,54,0)", n: 25000, s: 5 },
  };
  function glitch(g, id, x, y, w) {
    const k = GLITCH[id] || GLITCH.ec19445f6994cf2ff7bd3582a3ad474442f5fe75a3034474f3846f74856b612di0, f = w / 1000;
    g.fillStyle = k.bg; g.fillRect(x, y, w, w); g.fillStyle = k.fg;
    const n = Math.round(k.n * f * f) || 1, s = Math.max(1, k.s * f);
    for (let i = 0; i < n; i++) g.fillRect(x + Math.random() * w, y + Math.random() * w, s, s);
  }
  const cache = {};
  // the TV screen is a red master with a per-troll colour (troll.screen_color); recoloured once per colour, then cached
  function tv(T, col) {
    T._tv = T._tv || {}; if (!col || col === "red") return T.TV;
    return T._tv[col] || (T._tv[col] = T.TV.map((im, i) => { const m = T.M._meta["tv screen/" + T.M["tv screen"][i]]; return recolor(im, T.M._palette[col], m.hue, m.val_mul); }));
  }
  const TB = {
    load: (size = 256) => cache[size] || (cache[size] = TrollSprites.load({ size })),
    draw(g, T, sp, x, y, w, hf = 0, tf = 0) {
      if (sp.t.background_glitch) glitch(g, sp.t.background_glitch, x, y, w);
      else { g.fillStyle = sp.bg; g.fillRect(x, y, w, w); }
      g.drawImage(T.HANDS[hf % T.HANDS.length], x, y, w, w); g.drawImage(sp.A, x, y, w, w);
      const TV = tv(T, sp.t.screen_color); g.drawImage(TV[tf % TV.length], x, y, w, w); g.drawImage(sp.B, x, y, w, w);
    },
    // a canvas that keeps one troll typing in bursts; returns stop()
    animate(canvas, T, sp) {
      const g = canvas.getContext("2d"); let hf = 0, tf = 0, typing = Math.random() < .6, until = 0;
      const tick = () => { const n = Date.now(); if (n > until) { typing = !typing; until = n + (typing ? 900 + Math.random() * 2200 : 900 + Math.random() * 3200); }
        tf++; if (typing) hf++; TB.draw(g, T, sp, 0, 0, canvas.width, hf, tf); };
      tick(); const id = setInterval(tick, 120); return () => clearInterval(id);
    },
    async face(n) {
      const T = await TB.load(256), t = T.trolls[(n - 1) % T.trolls.length]; if (!t) return null;
      const sp = await T.sprite(t), c = document.createElement("canvas"); c.width = c.height = 256;
      TB.draw(c.getContext("2d"), T, sp, 0, 0, 256);
      const out = document.createElement("canvas"); out.width = out.height = 64;
      out.getContext("2d").drawImage(c, 77, 0, 133, 133, 0, 0, 64, 64);   // head crop, same box as the screen's own (300,0,520 of 1000)
      return out;
    },
  };
  return TB;
})();
