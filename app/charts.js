'use strict';
/* Hearth & Ledger — small canvas charts. No libraries, no network. */

const HLCharts = {
  /* Donut: entries = [{label, value, color}]. Draws slices and a centre label. */
  donut: function (canvas, entries, centerLabel, centerValue) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) / 2 - 8, inner = r * 0.62;
    ctx.clearRect(0, 0, w, h);
    const total = entries.reduce(function (s, e) { return s + e.value; }, 0);
    if (total <= 0) {
      ctx.fillStyle = '#6b6257';
      ctx.font = '14px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('No spending yet', cx, cy);
      return;
    }
    let angle = -Math.PI / 2;
    entries.forEach(function (e) {
      const sweep = (e.value / total) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, r, angle, angle + sweep);
      ctx.closePath();
      ctx.fillStyle = e.color;
      ctx.fill();
      angle += sweep;
    });
    /* Hole + centre text. */
    ctx.beginPath();
    ctx.arc(cx, cy, inner, 0, Math.PI * 2);
    ctx.fillStyle = '#fffdf8';
    ctx.fill();
    ctx.fillStyle = '#2b2620';
    ctx.textAlign = 'center';
    ctx.font = '700 22px Georgia, serif';
    ctx.fillText(centerValue, cx, cy - 2);
    ctx.fillStyle = '#6b6257';
    ctx.font = '12px system-ui, sans-serif';
    ctx.fillText(centerLabel, cx, cy + 18);
  },

  /* Horizontal bars: entries = [{label, value, color, max}]. */
  bars: function (canvas, entries, moneyFmt) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    if (!entries.length) return;
    const max = Math.max.apply(null, entries.map(function (e) { return e.max || e.value; }));
    const rowH = h / entries.length;
    const labelW = 118, valueW = 86, gap = 10;
    const barX = labelW, barW = w - labelW - valueW - gap;
    ctx.font = '13px system-ui, sans-serif';
    entries.forEach(function (e, i) {
      const y = i * rowH + rowH / 2;
      const bw = Math.max(2, (e.value / max) * barW);
      ctx.fillStyle = '#2b2620';
      ctx.textAlign = 'right';
      ctx.fillText(e.label, labelW - gap, y + 4);
      ctx.fillStyle = '#efe6d3';
      ctx.fillRect(barX, y - 9, barW, 18);
      ctx.fillStyle = e.color;
      ctx.fillRect(barX, y - 9, bw, 18);
      ctx.fillStyle = '#2b2620';
      ctx.textAlign = 'left';
      ctx.fillText(moneyFmt(e.value), barX + bw + gap, y + 4);
    });
  },

  /* Grouped vertical bars for month comparison: series = [{label, a, b, colorA, colorB}]. */
  compare: function (canvas, groups, labels, colors) {
    if (!canvas || !canvas.getContext) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const all = [];
    groups.forEach(function (g) { all.push(g.a, g.b); });
    const max = Math.max.apply(null, all.concat([1]));
    const padTop = 46, padBottom = 30, padLeft = 8, padRight = 8;
    const plotH = h - padTop - padBottom, plotW = w - padLeft - padRight;
    const groupW = plotW / groups.length;
    const barW = Math.min(46, groupW / 3);
    ctx.font = '12px system-ui, sans-serif';
    groups.forEach(function (g, gi) {
      const gx = padLeft + gi * groupW;
      const cxA = gx + groupW / 2 - barW - 3;
      const cxB = gx + groupW / 2 + 3;
      const hA = (g.a / max) * plotH, hB = (g.b / max) * plotH;
      ctx.fillStyle = colors[0];
      ctx.fillRect(cxA, padTop + plotH - hA, barW, hA);
      ctx.fillStyle = colors[1];
      ctx.fillRect(cxB, padTop + plotH - hB, barW, hB);
      ctx.fillStyle = '#2b2620';
      ctx.textAlign = 'center';
      ctx.fillText('$' + Math.round(g.a).toLocaleString('en-US'), cxA + barW / 2, padTop + plotH - hA - 6);
      ctx.fillText('$' + Math.round(g.b).toLocaleString('en-US'), cxB + barW / 2, padTop + plotH - hB - 6);
      ctx.fillStyle = '#6b6257';
      ctx.fillText(g.label, gx + groupW / 2, h - 10);
    });
    ctx.fillStyle = '#2b2620';
    ctx.textAlign = 'left';
    ctx.fillStyle = colors[0];
    ctx.fillRect(padLeft, 6, 12, 12);
    ctx.fillStyle = '#2b2620';
    ctx.fillText(labels[0], padLeft + 18, 16);
    const lx = padLeft + 118;
    ctx.fillStyle = colors[1];
    ctx.fillRect(lx, 6, 12, 12);
    ctx.fillStyle = '#2b2620';
    ctx.fillText(labels[1], lx + 18, 16);
  }
};
