(function () {
  const res = u => { if (!u) return ''; const r = (window.__resources || {})[u]; if (typeof r === 'string' && r) return r; const b = (window.__resourceBlobs || {})[u]; return b instanceof Blob ? URL.createObjectURL(b) : u; };
  class JtVideo extends HTMLElement {
    connectedCallback() {
      if (this._v) return;
      this.style.cssText += ';display:block;position:relative;width:100%;height:100%;overflow:hidden;border-radius:inherit';
      const v = document.createElement('video');
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = 'metadata';
      v.setAttribute('muted', ''); v.setAttribute('playsinline', '');
      v.poster = res(this.getAttribute('poster'));
      v.src = res(this.getAttribute('src'));
      v.setAttribute('aria-label', this.getAttribute('alt') || '');
      v.style.cssText = 'position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;border-radius:inherit;background:transparent';
      this.appendChild(v); this._v = v;
      this._sec = this.closest('section');
      const sync = () => {
        const on = !this._sec || this._sec.hasAttribute('data-deck-active');
        if (on && !matchMedia('(prefers-reduced-motion: reduce)').matches) { v.currentTime = 0; v.play().catch(() => {}); }
        else v.pause();
      };
      if (this._sec) { this._mo = new MutationObserver(sync); this._mo.observe(this._sec, { attributes: true, attributeFilter: ['data-deck-active'] }); }
      window.addEventListener('beforeprint', () => v.pause());
      sync();
    }
    disconnectedCallback() { if (this._mo) this._mo.disconnect(); if (this._v) this._v.pause(); }
  }
  if (!customElements.get('jt-video')) customElements.define('jt-video', JtVideo);
})();
