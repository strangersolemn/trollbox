// Trollbox recolour — the same maths as recolor() in pipeline.py, for the browser.
// Only the red master of a trait is inscribed; this turns it into any palette colour at view time.
//   recolor(img, palette[colour], masterHue, valMul) -> <canvas> the same size as the image
//   p = {hue: 220|"grey"|null, sat: multiplier, val: [a, b]}  ->  v' = a + b*v*valMul
// Pixels within 20° of the master hue with saturation > .3 and value > .1 are changed; ink lines, whites
// and everything else stay as drawn.  Inlined (minified) into every troll HTML by generate.py.
function recolor(img, p, hue0, vmul) {
  var w = img.naturalWidth || img.width, h = img.naturalHeight || img.height;
  var c = document.createElement('canvas'); c.width = w; c.height = h;
  var g = c.getContext('2d'); g.drawImage(img, 0, 0, w, h);
  if (p.hue !== 'grey' && Math.abs(p.hue - hue0) < 1 && (vmul || 1) === 1) return c;   // the master's own colour
  var d = g.getImageData(0, 0, w, h), a = d.data, vm = vmul || 1;
  for (var i = 0; i < a.length; i += 4) {
    if (!a[i + 3]) continue;
    var r = a[i] / 255, gg = a[i + 1] / 255, b = a[i + 2] / 255;
    var mx = Math.max(r, gg, b), mn = Math.min(r, gg, b), v = mx, s = mx ? (mx - mn) / mx : 0;
    if (s <= .3 || v <= .1) continue;
    var dd = mx - mn, hh = mx === r ? ((gg - b) / dd) % 6 : mx === gg ? (b - r) / dd + 2 : (r - gg) / dd + 4;
    hh *= 60; if (hh < 0) hh += 360;
    if (Math.abs(((hh - hue0) + 540) % 360 - 180) > 20) continue;
    var grey = p.hue === 'grey', h2 = grey ? hh : p.hue, s2 = grey ? 0 : Math.min(1, s * p.sat);
    var v2 = Math.min(1, p.val[0] + p.val[1] * v * vm);
    var C = v2 * s2, X = C * (1 - Math.abs((h2 / 60) % 2 - 1)), m = v2 - C, k = (h2 / 60) | 0;
    var R = [C, X, 0, 0, X, C][k], G = [X, C, C, X, 0, 0][k], B = [0, 0, X, C, C, X][k];
    a[i] = (R + m) * 255; a[i + 1] = (G + m) * 255; a[i + 2] = (B + m) * 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}
if (typeof module !== 'undefined') module.exports = recolor;
