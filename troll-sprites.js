// Trollbox troll sprites for the site pages: composes rolled trolls (build/trolls.json) from the masters in
// traits-avif/ with the colours applied in code (recolor.js must be loaded first).
//   const T = await TrollSprites.load({size: 512});          // manifest + trolls + hands/tv frames
//   const sp = await T.sprite(troll);                         // {A, B, bg}  A = body (under tv)  B = eyes+mouth+hat
//   T.draw(ctx, sp, x, y, w, handFrame, tvFrame)              // draws one troll
//   T.animated(canvas, troll)                                  // runs a typing troll inside a canvas, returns stop()
window.TrollSprites = (() => {
  const load = src => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.onerror = () => r(i); i.src = src; });
  const small = (im, n) => { const k = document.createElement('canvas'); k.width = k.height = n; k.getContext('2d').drawImage(im, 0, 0, n, n); return k; };
  return {
    async load(o = {}) {
      const base = o.base || 'traits-avif/', R = o.size || 512, bust = '?' + Date.now();
      const [M, trolls] = await Promise.all([fetch(base + 'manifest.json' + bust).then(r => r.json()), fetch((o.trolls || 'build/trolls.json') + bust).then(r => r.json())]);
      const cache = {}, master = async (g, f) => cache[g + f] || (cache[g + f] = small(await load(base + g + '/' + f), R));
      const HANDS = await Promise.all(M.hands.map(f => master('hands', f))), TV = await Promise.all(M['tv screen'].map(f => master('tv screen', f)));
      const layer = async (g, f, col) => { const im = await master(g, f); if (!col) return im; const m = M._meta[g + '/' + f]; return recolor(im, M._palette[col], m.hue, m.val_mul); };
      const T = {
        M, trolls, HANDS, TV, R,
        flats: trolls.filter(t => !t.background_glitch),
        async sprite(t) {
          const A = document.createElement('canvas'); A.width = A.height = R; const B = document.createElement('canvas'); B.width = B.height = R;
          A.getContext('2d').drawImage(await layer('bodies', t.body_file, t.body_color), 0, 0);
          const gb = B.getContext('2d'); gb.drawImage(await layer('eyes', t.eyes_file, t.eyes_color), 0, 0); gb.drawImage(await layer('mouths', t.mouth_file), 0, 0);
          if (t.headwear_file) gb.drawImage(await layer('headwear', t.headwear_file, t.headwear_color), 0, 0);
          return { A, B, bg: t.background_hex || '#1e1e1e', t };
        },
        draw(g, sp, x, y, w, hf, tf) {
          if (sp.bg === 'none') g.clearRect(x, y, w, w); else { g.fillStyle = sp.bg; g.fillRect(x, y, w, w); }
          g.drawImage(HANDS[hf % HANDS.length], x, y, w, w); g.drawImage(sp.A, x, y, w, w); g.drawImage(TV[tf % TV.length], x, y, w, w); g.drawImage(sp.B, x, y, w, w);
        },
        // one troll typing in bursts inside a canvas; returns a stop function
        animated(canvas, sp) {
          const g = canvas.getContext('2d'); let hf = 0, tf = 0, typing = true, until = Date.now() + 1500, id;
          const tick = () => { const n = Date.now(); if (n > until) { typing = !typing; until = n + (typing ? 1000 + Math.random() * 2000 : 1000 + Math.random() * 3000); }
            tf++; if (typing) hf++; T.draw(g, sp, 0, 0, canvas.width, hf, tf); };
          tick(); id = setInterval(tick, 120); return () => clearInterval(id);
        },
        // a diverse pick: neighbours differ in body colour, hat and background
        diverse(n, seed = 1) {
          let s = seed * 9301 + 49297; const rnd = () => (s = (s * 9301 + 49297) % 233280) / 233280;
          const pool = T.flats.slice().sort(() => rnd() - .5), out = [];
          for (const t of pool) { if (out.length >= n) break; const u = out[out.length - 1];
            if (u && ((u.body_color || u.body_file) === (t.body_color || t.body_file) || u.background === t.background || (u.headwear_file && u.headwear_file === t.headwear_file))) continue; out.push(t); }
          return out;
        }
      };
      return T;
    }
  };
})();
