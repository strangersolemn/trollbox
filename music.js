// Trollbox site music (2026-10-14, Solemn: "play right away, always a floating button to turn it off").
// Solemn's 2nd track (~/Projects/trollz/Strange Café new .m4a → audio/trollbox-track.m4a, AAC 128k), looped.
// 2026-10-15, Solemn: "turn off the music" → it never starts on its own; the floating button starts/stops it.
(() => {
  const SRC = (document.currentScript && document.currentScript.dataset.src) || "audio/trollbox-track.m4a";
  let off = true;
  const a = new Audio(SRC); a.loop = true; a.volume = 0.6; a.preload = "none";   // nothing downloads until someone presses the button
  const css = document.createElement("style");
  css.textContent = `#tbMusic{position:fixed;right:16px;bottom:16px;z-index:9999;display:flex;align-items:center;gap:8px;font:20px/1 "Mansalva","Comic Sans MS",cursive;
    padding:10px 14px 8px;background:#fbe7a1;color:#0b0b0b;border:4px solid #0b0b0b;box-shadow:5px 5px 0 #0b0b0b;cursor:pointer;user-select:none;transition:transform .12s,box-shadow .12s}
    #tbMusic:hover{transform:translate(-2px,-2px);box-shadow:7px 7px 0 #0b0b0b}#tbMusic:active{transform:translate(3px,3px);box-shadow:2px 2px 0 #0b0b0b}
    #tbMusic.off{background:#fff}#tbMusic svg{width:20px;height:20px;display:block}
    #tbMusic .bars{display:flex;gap:2px;align-items:flex-end;height:16px}#tbMusic .bars i{width:3px;background:#0b0b0b;animation:tbm 0.9s ease-in-out infinite}
    #tbMusic .bars i:nth-child(2){animation-delay:-.3s}#tbMusic .bars i:nth-child(3){animation-delay:-.6s}#tbMusic.off .bars i,#tbMusic.wait .bars i{animation:none;height:4px}
    @keyframes tbm{0%,100%{height:4px}50%{height:16px}}@media(max-width:600px){#tbMusic{right:12px;bottom:12px;font-size:17px;padding:8px 11px 6px}}`;
  document.head.appendChild(css);
  const b = document.createElement("button"); b.id = "tbMusic"; b.type = "button";
  b.innerHTML = '<span class="bars"><i></i><i></i><i></i></span><span class="t"></span>';
  const show = () => { b.classList.toggle("off", off); b.classList.toggle("wait", !off && a.paused); b.querySelector(".t").textContent = off ? "sound off" : "sound on";
    b.setAttribute("aria-label", off ? "turn the music on" : "turn the music off"); b.setAttribute("aria-pressed", String(!off)); };
  const play = () => { if (off) return; a.play().then(show, show); };
  b.addEventListener("click", e => {
    e.stopPropagation(); off = !off;
    if (off) a.pause(); else play(); show();
  });
  a.addEventListener("playing", show); a.addEventListener("pause", show);
  // data-autoplay (collab page, 2026-10-15, Solemn: "make it play"): sound starts on its own, or on the first tap / key / scroll if the browser blocks it
  const auto = document.currentScript && document.currentScript.dataset.autoplay != null;
  const start = () => { if (!off) return; off = false; a.play().then(show, () => { off = true; show(); }); };
  if (auto) {
    a.preload = "auto";
    const first = e => { if (e && e.target && e.target.closest && e.target.closest("#tbMusic")) return;  ["pointerdown", "keydown", "touchstart", "wheel", "scroll"].forEach(ev => removeEventListener(ev, first, true)); start(); };
    ["pointerdown", "keydown", "touchstart", "wheel", "scroll"].forEach(ev => addEventListener(ev, first, { capture: true, passive: true }));
    off = false; a.play().then(() => { ["pointerdown", "keydown", "touchstart", "wheel", "scroll"].forEach(ev => removeEventListener(ev, first, true)); show(); }, () => { off = true; show(); });
  }
  const mount = () => { document.body.appendChild(b); show(); };
  document.body ? mount() : addEventListener("DOMContentLoaded", mount);
})();
