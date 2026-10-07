// Trollbox scene: a troll pops up behind the Trollbox monitor, types its line onto the screen, drops away,
// the next one pops up.  Used as the hero of mint.html and full-screen in scene.html (for the video).
//   mountScene(container, {lines, speed})  -> returns {stop}
// Needs recolor.js + troll-sprites.js loaded. Styles are injected once.
window.mountScene = (() => {
  const CSS = `
.tbs{position:relative;overflow:hidden;background:#fbf7f1 radial-gradient(circle,#d9d3c8 1.4px,transparent 1.6px) 0 0/26px 26px;font-family:"Courier New",monospace;color:#0b0b0b;container-type:inline-size}
.tbs *{box-sizing:border-box}
.tbs .ghost{position:absolute;left:50%;top:44%;transform:translate(-50%,-50%);font-family:Georgia,serif;font-size:24cqw;letter-spacing:-.04em;opacity:.07;white-space:nowrap;pointer-events:none}
.tbs .box{position:absolute;left:50%;bottom:14%;width:min(48cqw,70cqh);aspect-ratio:1.5;transform:translateX(-50%);z-index:1}
.tbs .monitor{position:absolute;inset:auto 0 0 0;height:62%;background:#e9e2d2;border:.9cqw solid #0b0b0b;border-radius:3cqw 3cqw 1.2cqw 1.2cqw;box-shadow:1.8cqw 1.8cqw 0 #0b0b0b;z-index:2}
.tbs .screen{position:absolute;left:7%;right:7%;top:8%;bottom:20%;background:#06110a;border:.7cqw solid #0b0b0b;border-radius:1cqw;overflow:hidden;color:#6cff8a;font:bold 1.55cqw/1.55 "Courier New",monospace;padding:1.2cqw 1.6cqw;display:flex;flex-direction:column;justify-content:flex-end}
.tbs .screen::after{content:"";position:absolute;inset:0;background:repeating-linear-gradient(transparent 0 2px,rgba(0,0,0,.22) 2px 4px);pointer-events:none}
.tbs .screen .l{white-space:pre-wrap;word-break:break-word}
.tbs .screen .l b{color:#b8ffc6;font-weight:bold}
.tbs .screen .cur{display:inline-block;width:.9cqw;height:1.5cqw;background:#6cff8a;vertical-align:-.2cqw;animation:tbsblink 1s steps(2) infinite}
.tbs .led{position:absolute;right:6%;bottom:6%;width:1.4cqw;height:1.4cqw;border-radius:50%;background:#2f9a52;box-shadow:0 0 1cqw #6cff8a}
.tbs .troll{position:absolute;left:50%;bottom:38%;width:64%;aspect-ratio:1;transform:translate(-50%,130%) rotate(4deg);transition:transform .9s cubic-bezier(.2,1.15,.3,1);z-index:1}
.tbs .troll.up{transform:translate(-50%,0) rotate(-2deg)}
.tbs .troll.down{transition-timing-function:cubic-bezier(.6,-.3,.8,.6);transition-duration:.6s}
.tbs .troll canvas{width:100%;height:100%;display:block;border:.9cqw solid #0b0b0b;box-shadow:1.8cqw 1.8cqw 0 #0b0b0b;background:#c9ccff}
.tbs .floor{position:absolute;left:0;right:0;bottom:0;height:14%;border-top:.7cqw dashed #0b0b0b}
.tbs .bit{position:absolute;z-index:0;width:2.4cqw;height:2.4cqw;border:.4cqw solid #0b0b0b;animation:tbsfloat var(--d) ease-in-out var(--dl) infinite alternate}
.tbs .bit.r{border-radius:50%}
@keyframes tbsfloat{0%{transform:translateY(0) rotate(0)}100%{transform:translateY(-4cqw) rotate(60deg)}}
@keyframes tbsblink{50%{opacity:0}}
`;
  const PAL = ['#c9ccff', '#c9b4ec', '#e9c3f2', '#ffc5c5', '#c7efd9', '#fbe7a1', '#bfe3f7', '#e2194b'];
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  return function mountScene(el, o = {}) {
    if (!document.getElementById('tbs-css')) { const s = document.createElement('style'); s.id = 'tbs-css'; s.textContent = CSS; document.head.appendChild(s); }
    el.classList.add('tbs');
    el.innerHTML = `<div class="ghost">TROLLBOX</div><div class="box"><div class="troll"><canvas width="512" height="512"></canvas></div>
      <div class="monitor"><div class="screen"></div><div class="led"></div></div></div><div class="floor"></div>`;
    for (let i = 0; i < (o.bits ?? 22); i++) { const b = document.createElement('i'); b.className = 'bit' + (i % 3 ? '' : ' r');
      b.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 80}%;background:${PAL[i % PAL.length]};--d:${2 + Math.random() * 3}s;--dl:${-Math.random() * 4}s;transform:rotate(${Math.random() * 90}deg)`; el.appendChild(b); }
    const screen = el.querySelector('.screen'), trollEl = el.querySelector('.troll'), canvas = el.querySelector('canvas'), g = canvas.getContext('2d');
    const lines = o.lines || ['hello from the trollbox'], speed = o.speed || 1;
    const log = [];
    const render = (cur) => {
      const rows = log.slice(-(o.rows || 5)).map(l => `<div class="l"><b>#${l.id}</b> ${l.text}</div>`);
      if (cur) rows.push(`<div class="l"><b>#${cur.id}</b> ${cur.text}<i class="cur"></i></div>`);
      screen.innerHTML = rows.join('');
    };
    let stopped = false, sp = null, hf = 0, tf = 0, typing = false;
    const frame = setInterval(() => { if (!sp) return; tf++; if (typing) hf++; TrollSpritesDraw(); }, 120);
    const TrollSpritesDraw = () => T && T.draw(g, sp, 0, 0, 512, hf, tf);
    let T = null;
    (async () => {
      T = await TrollSprites.load({ size: 512 });
      const picks = T.diverse(lines.length, o.seed || 7);
      render(null);
      let i = 0;
      while (!stopped) {
        const t = picks[i % picks.length], text = lines[i % lines.length];
        const id = String(t.id).padStart(4, '0');
        sp = await T.sprite(t); typing = false; TrollSpritesDraw();
        trollEl.classList.remove('down'); trollEl.classList.add('up');      // pop up
        await sleep(1000 / speed);
        typing = true; let typed = '';
        for (const ch of text) { if (stopped) return; typed += ch; render({ id, text: typed });
          await sleep((/[.,!?]/.test(ch) ? 260 : ch === ' ' ? 110 : 45 + Math.random() * 40) / speed); }
        typing = false;
        await sleep(900 / speed);
        log.push({ id, text }); render(null);
        trollEl.classList.add('down'); trollEl.classList.remove('up');     // drop
        await sleep(700 / speed);
        i++;
      }
    })();
    return { stop() { stopped = true; clearInterval(frame); } };
  };
})();
