(function () {
  const EASE = 'cubic-bezier(0.2, 0.7, 0.2, 1)';
  const NUM = /^([~+−\-≥]?\s?)(\d{1,3}(?:\.\d{3})+|\d+)(,\d+)?(.*)$/s;
  const fmt = (v, dec) => v.toLocaleString('pt-BR', { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const hasBg = el => { const c = getComputedStyle(el).backgroundColor; return c && c !== 'transparent' && !/rgba\(.*,\s*0\)$/.test(c); };

  class JtMotion extends HTMLElement {
    connectedCallback() {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      this._anims = []; this._timers = [];
      this._on = () => requestAnimationFrame(() => this.run(document.querySelector('section[data-deck-active]')));
      document.addEventListener('slidechange', this._on);
      window.addEventListener('beforeprint', () => this.stop());
      setTimeout(this._on, 400);
    }
    disconnectedCallback() { document.removeEventListener('slidechange', this._on); this.stop(); }
    stop() {
      this._anims.forEach(a => { try { a.finish(); } catch (e) {} });
      this._timers.forEach(clearInterval); this._anims = []; this._timers = [];
      (this._restore || []).forEach(([el, t]) => { el.textContent = t; }); this._restore = [];
    }
    a(el, kf, o) { const an = el.animate(kf, Object.assign({ easing: EASE, fill: 'backwards' }, o)); this._anims.push(an); }
    run(s) {
      if (!s || s === this._last && performance.now() - this._t < 300) return;
      this.stop(); this._last = s; this._t = performance.now();
      const seen = new Set();
      // full-bleed photos: slow push-in
      s.querySelectorAll('img').forEach(im => {
        if (im.offsetHeight >= 1000) { seen.add(im); this.a(im, [{ transform: 'scale(1.07)', opacity: 0.4 }, { transform: 'scale(1)', opacity: 1 }], { duration: 2600, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }); }
      });
      // content blocks: staggered rise
      const blocks = [];
      [...s.children].forEach(fr => {
        let el = fr; while (el.children.length === 1 && !el.matches('img,table,ul')) el = el.children[0];
        [...el.children].forEach(b => {
          if (seen.has(b) || b.offsetWidth >= 1900) return;
          if (b.children.length > 1 && b.children.length <= 4 && b.querySelector('[role="heading"],h1,h2') && !b.matches('table')) [...b.children].forEach(c => blocks.push(c));
          else blocks.push(b);
        });
      });
      blocks.slice(0, 14).forEach((b, i) => this.a(b, [{ opacity: 0, transform: 'translateY(28px)' }, { opacity: 1, transform: 'none' }], { duration: 760, delay: 80 + i * 85 }));
      // bars: grow from base
      let j = 0;
      s.querySelectorAll('div,span').forEach(el => {
        if (el.children.length || el.textContent.trim() || !hasBg(el)) return;
        const w = el.offsetWidth, h = el.offsetHeight;
        if (w < 6 || h < 6 || w > 1500 || h > 900 || w * h < 400) return;
        const v = h > w * 1.4;
        if (!v && w < h * 1.4) return;
        el.style.transformOrigin = v ? '50% 100%' : '0% 50%';
        this.a(el, [{ transform: v ? 'scaleY(0)' : 'scaleX(0)' }, { transform: 'none' }], { duration: 1000, delay: 420 + Math.min(j++, 24) * 45, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' });
      });
      // big numbers: count up
      this._restore = [];
      s.querySelectorAll('div,span,p,h1,h2').forEach(el => {
        if (el.children.length) return;
        const t = el.textContent; const m = t.trim().match(NUM);
        if (!m || parseFloat(getComputedStyle(el).fontSize) < 60) return;
        const dec = m[3] ? m[3].length - 1 : 0;
        const target = parseFloat(m[2].replace(/\./g, '') + (m[3] ? '.' + m[3].slice(1) : ''));
        if (!(target > 1)) return;
        this._restore.push([el, t]);
        const t0 = performance.now(), D = 1300, d0 = 350;
        const id = setInterval(() => {
          const p = Math.min(1, Math.max(0, (performance.now() - t0 - d0) / D));
          const e = 1 - Math.pow(1 - p, 3);
          if (p >= 1) { el.textContent = t; clearInterval(id); return; }
          el.textContent = m[1] + fmt(target * e, dec) + m[4];
        }, 33);
        this._timers.push(id);
      });
    }
  }
  if (!customElements.get('jt-motion')) customElements.define('jt-motion', JtMotion);
})();
