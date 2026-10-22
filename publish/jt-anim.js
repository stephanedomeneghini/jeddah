(function () {
  const C = { bg: '#161826', text: '#e9e9ed', n300: '#cfd3e5', n500: '#9397ab', n600: '#75798c', n700: '#595d6c', n800: '#3f424d', acc: '#9184d9', a300: '#d2cefd', a600: '#796cbf' };
  const TAU = Math.PI * 2;
  const r = n => Math.round(n * 10) / 10;
  const S = (t, T, ph = 0) => Math.sin(TAU * t / T + ph);
  const LAG = -Math.PI / 2;

  class Base extends HTMLElement {
    connectedCallback() {
      if (!this.shadowRoot) {
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML = '<style>:host{display:block;width:100%;height:100%}svg{display:block;width:100%;height:100%}</style>' + this.svg();
        this.$ = s => root.querySelector(s);
        this.$$ = s => [...root.querySelectorAll(s)];
        this.frame(0);
      }
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || this._raf) return;
      const t0 = performance.now();
      const loop = now => { this.frame((now - t0) / 1000); this._raf = requestAnimationFrame(loop); };
      this._raf = requestAnimationFrame(loop);
    }
    disconnectedCallback() { cancelAnimationFrame(this._raf); this._raf = null; }
  }

  // Slide 34 — oscilação do topo, versão 1 x atual
  const o1 = dx => `M360,600 C360,430 ${r(392 + 0.45 * dx)},250 ${r(420 + dx)},90 C${r(448 + 0.45 * dx)},250 480,430 480,600 Z`;
  const o2 = dx => `M1180,600 C1180,430 ${r(1212 + 0.45 * dx)},250 ${r(1240 + dx)},90 C${r(1268 + 0.45 * dx)},250 1300,430 1300,600 Z`;
  const OD = [[213, 1210, 60, 45, 9], [343, 1198, 84, 22, 11], [473, 1188, 104, 6, 11]];
  class JtOscilacao extends Base {
    svg() {
      const damp = OD.map(([y, x0, w]) => `<g class="d"><rect x="${x0}" y="${y - 13}" width="${w}" height="26" rx="5" fill="${C.bg}" stroke="${C.a300}" stroke-width="2.5"/><rect class="m" x="${x0 + 15}" y="${y - 8}" width="${w - 30}" height="16" rx="3" fill="${C.text}"/></g>`).join('');
      return `<svg viewBox="0 0 1664 640">
<g stroke-width="3" stroke-dasharray="8 8" fill="none" stroke="${C.n700}"><line x1="273" y1="93" x2="375" y2="320"/><line x1="567" y1="93" x2="465" y2="320"/><line x1="1165" y1="93" x2="1205" y2="253"/><line x1="1315" y1="93" x2="1275" y2="253"/></g>
<g stroke-width="3" fill="none"><g stroke="${C.n600}"><line x1="270" y1="40" x2="570" y2="40"/><line x1="270" y1="26" x2="270" y2="54"/><line x1="570" y1="26" x2="570" y2="54"/></g><g stroke="${C.acc}"><line x1="1165" y1="40" x2="1315" y2="40"/><line x1="1165" y1="26" x2="1165" y2="54"/><line x1="1315" y1="26" x2="1315" y2="54"/></g></g>
<g stroke="${C.n500}" stroke-width="2" stroke-dasharray="4 3"><line x1="420" y1="68" x2="420" y2="86"/><line x1="1240" y1="68" x2="1240" y2="86"/></g>
<path class="p1" fill="${C.n700}"/><path class="p2" fill="${C.a600}"/>${damp}
<rect x="270" y="600" width="300" height="14" fill="${C.n800}"/><rect x="1090" y="600" width="300" height="14" fill="${C.n800}"/></svg>`;
    }
    frame(t) {
      const T = 4, s = S(t, T), l = S(t, T, LAG);
      this.$('.p1').setAttribute('d', o1(147 * s));
      this.$('.p2').setAttribute('d', o2(74 * s));
      const g = this.$$('.d'), m = this.$$('.m');
      OD.forEach(([, , , amp, tr], i) => { g[i].setAttribute('transform', `translate(${r(amp * s)},0)`); m[i].setAttribute('transform', `translate(${r(tr * l)},0)`); });
    }
  }

  // Slide 36 — como um TMD trabalha
  const td = dx => `M210,660 C212,420 ${r(226 + 0.4 * dx)},230 ${r(250 + dx)},60 L${r(410 + dx)},60 C${r(434 + 0.4 * dx)},230 448,420 450,660 Z`;
  const curve = f => { let p = ''; for (let i = 0; i <= 96; i++) p += `${r(640 + 240 * i / 96)},${r(f(TAU * i / 96))} `; return p.trim(); };
  class JtTmd extends Base {
    svg() {
      return `<svg viewBox="0 0 900 700">
<line x1="330" y1="34" x2="330" y2="56" stroke="${C.n600}" stroke-width="2" stroke-dasharray="4 4"/>
<path class="tw" fill="${C.n700}"/>
<g class="h"><rect x="235" y="150" width="190" height="60" rx="6" fill="${C.bg}" stroke="${C.acc}" stroke-width="4"/><rect class="m" x="277" y="155" width="106" height="50" rx="4" fill="${C.acc}"/></g>
<rect x="130" y="660" width="400" height="16" fill="${C.n800}"/>
<line x1="640" y1="176" x2="640" y2="324" stroke="${C.n600}" stroke-width="2"/><line x1="640" y1="250" x2="880" y2="250" stroke="${C.n700}" stroke-width="2"/>
<line class="cur" x1="640" y1="180" x2="640" y2="320" stroke="${C.n600}" stroke-width="1.5" opacity="0.6"/>
<polyline points="${curve(a => 250 - 60 * Math.sin(a))}" fill="none" stroke="${C.text}" stroke-width="4" stroke-linejoin="round"/>
<polyline points="${curve(a => 250 + 60 * Math.cos(a))}" fill="none" stroke="${C.acc}" stroke-width="4" stroke-linejoin="round"/>
<circle class="dt" r="8" fill="${C.text}" stroke="${C.bg}" stroke-width="3"/><circle class="dm" r="8" fill="${C.acc}" stroke="${C.bg}" stroke-width="3"/></svg>`;
    }
    frame(t) {
      const T = 3.2, f = (t / T) % 1, a = TAU * f, s = Math.sin(a), l = -Math.cos(a), x = r(640 + 240 * f);
      this.$('.tw').setAttribute('d', td(40 * s));
      this.$('.h').setAttribute('transform', `translate(${r(25 * s)},0)`);
      this.$('.m').setAttribute('transform', `translate(${r(34 * l)},0)`);
      const c = this.$('.cur'); c.setAttribute('x1', x); c.setAttribute('x2', x);
      const dt = this.$('.dt'), dm = this.$('.dm');
      dt.setAttribute('cx', x); dt.setAttribute('cy', r(250 - 60 * s));
      dm.setAttribute('cx', x); dm.setAttribute('cy', r(250 - 60 * l));
    }
  }

  // Slide 44 — mesma escala, onde cada torre controla o movimento
  const bz = (t, a, b, c, d) => (1 - t) ** 3 * a + 3 * (1 - t) ** 2 * t * b + 3 * (1 - t) * t * t * c + t ** 3 * d;
  const hwAt = y => { let best = 0, bd = 1e9; for (let i = 0; i <= 400; i++) { const t = i / 400, yy = bz(t, 0, -180, -380, -600); if (Math.abs(yy - y) < bd) { bd = Math.abs(yy - y); best = -bz(t, -70, -70, -30, 0); } } return best; };
  const JDMP = [[-523, 32], [-487, 38], [-452, 44]];
  class JtEscala extends Base {
    svg() {
      const jBars = [-379, -325, -271, -217, -163, -109, -55].map(y => { const hw = hwAt(y) - 3; return `<rect x="${r(-hw)}" y="${y - 3.5}" width="${r(2 * hw)}" height="7" fill="${C.a300}"/>`; }).join('');
      const jDamp = JDMP.map(([y, w]) => `<rect x="${-w / 2}" y="${y - 8}" width="${w}" height="16" rx="5" fill="${C.n700}" stroke="${C.a300}" stroke-width="2.5"/><rect class="jm" x="-5" y="${y - 3}" width="10" height="6" rx="3" fill="${C.a300}"/>`).join('');
      const sBars = [-270, -239, -206, -174, -141, -109, -77, -45].map(y => { const hw = 42 - 6 * (-y / 330) - 1; return `<rect x="${r(-hw)}" y="${y - 3.5}" width="${r(2 * hw)}" height="7" fill="${C.bg}"/>`; }).join('');
      const sTmd = [-17, 17].map(cx => `<rect x="${cx - 16}" y="-297" width="32" height="24" rx="5" fill="${C.bg}"/><circle class="sm" cx="${cx}" cy="-285" r="4.5" fill="${C.text}"/>`).join('');
      return `<svg viewBox="0 0 1664 660">
<g transform="translate(470,630)"><g class="j"><line x1="0" y1="-600" x2="0" y2="-614" stroke="${C.n500}" stroke-width="2"/><path d="M-70,0 C-70,-180 -30,-380 0,-600 C30,-380 70,-180 70,0 Z" fill="${C.n700}"/>${jBars}${jDamp}</g></g>
<g transform="translate(1200,630)"><g class="s"><line x1="0" y1="-330" x2="0" y2="-344" stroke="${C.n500}" stroke-width="2"/><path d="M-42,0 L-36,-330 L36,-330 L42,0 Z" fill="${C.a600}"/><rect x="-35" y="-328" width="70" height="26" fill="${C.n300}"/>${sTmd}${sBars}</g></g>
<rect x="200" y="630" width="1300" height="14" fill="${C.n800}"/></svg>`;
    }
    frame(t) {
      const TJ = 6, TS = 4.4;
      this.$('.j').setAttribute('transform', `skewX(${r(1.1 * S(t, TJ) * 100) / 100})`);
      this.$('.s').setAttribute('transform', `skewX(${r(1.1 * S(t, TS) * 100) / 100})`);
      const lj = S(t, TJ, LAG), ls = S(t, TS, LAG);
      this.$$('.jm').forEach((el, i) => el.setAttribute('transform', `translate(${r((JDMP[i][1] / 2 - 9) * lj)},0)`));
      this.$$('.sm').forEach(el => el.setAttribute('transform', `translate(${r(8 * ls)},0)`));
    }
  }

  if (!customElements.get('jt-oscilacao')) customElements.define('jt-oscilacao', JtOscilacao);
  if (!customElements.get('jt-tmd')) customElements.define('jt-tmd', JtTmd);
  if (!customElements.get('jt-escala')) customElements.define('jt-escala', JtEscala);
})();
