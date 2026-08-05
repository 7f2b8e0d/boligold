(function () {
  const STORAGE_KEY = 'boligold_lang';
  const WA = 'https://wa.me/8618831098684';
  const { languages, dict } = window.BOLIGOLD_I18N;
  const products = window.BOLIGOLD_PRODUCTS;

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  function matchBrowserLang() {
    const candidates = [navigator.language, ...(navigator.languages || [])]
      .filter(Boolean)
      .map((l) => l.toLowerCase());

    for (const raw of candidates) {
      if (dict[raw]) return raw;
      const base = raw.split('-')[0];
      if (raw.startsWith('zh-tw') || raw.startsWith('zh-hk') || raw.startsWith('zh-hant')) return 'zh-TW';
      if (base === 'zh') return 'zh';
      if (dict[base]) return base;
    }
    return 'en';
  }

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dict[saved]) return saved;
    return matchBrowserLang();
  }

  let currentLang = getInitialLang();
  let currentCategory = 'ps';
  let currentFilter = 'all';

  function t(key) {
    return (dict[currentLang] && dict[currentLang][key]) || dict.en[key] || key;
  }

  function noteLabel(note) {
    if (!note) return '';
    const map = {
      frosted: 'note_frosted',
      white: 'note_white',
      'clear-lid': 'note_clear_lid',
      'black-lid': 'note_black_lid',
    };
    return map[note] ? t(map[note]) : note;
  }

  function productTitle(p) {
    if (p.titleKey) return t(p.titleKey);
    return p.id;
  }

  function categoryCopy() {
    const map = {
      ps: ['cat_ps_title', 'cat_ps_body'],
      pet: ['cat_pet_title', 'cat_pet_body'],
      pp: ['cat_pp_title', 'cat_pp_body'],
      accessories: ['cat_acc_title', 'cat_acc_body'],
    };
    const keys = map[currentCategory] || map.ps;
    const titleEl = $('#productsTitle');
    const descEl = $('#productsDesc');
    if (titleEl) titleEl.textContent = t(keys[0]);
    if (descEl) descEl.textContent = t(keys[1]);
  }

  function applyI18n() {
    const meta = languages.find((l) => l.code === currentLang) || languages[0];
    document.documentElement.lang = currentLang;
    document.documentElement.dir = meta.dir;
    document.body.classList.toggle('rtl', meta.dir === 'rtl');
    document.title = t('doc_title');

    $$('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      if (key) el.textContent = t(key);
    });

    const langLabel = $('#langCurrent');
    if (langLabel) langLabel.textContent = meta.name;

    $$('#langMenu button').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === currentLang);
    });

    const brandText = $('#brandText');
    if (brandText) {
      const useZh = currentLang === 'zh' || currentLang === 'zh-TW';
      brandText.innerHTML = useZh ? `${t('brandZh')}` : 'Boli<span>gold</span>';
    }

    categoryCopy();
    renderProducts();
  }

  function setLang(code) {
    if (!dict[code]) return;
    currentLang = code;
    localStorage.setItem(STORAGE_KEY, code);
    applyI18n();
    closeLang();
  }

  function buildLangMenu() {
    const menu = $('#langMenu');
    if (!menu) return;
    menu.innerHTML = languages
      .map(
        (l) =>
          `<button type="button" data-lang="${l.code}" ${l.code === currentLang ? 'class="active"' : ''}>${l.name}</button>`
      )
      .join('');
    menu.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-lang]');
      if (btn) setLang(btn.dataset.lang);
    });
  }

  function closeLang() {
    $('#langSwitcher')?.classList.remove('open');
  }

  function renderProducts() {
    const grid = $('#productGrid');
    if (!grid) return;

    const list = products.filter((p) => p.category === currentCategory);

    grid.innerHTML = list
      .map((p) => {
        const note = noteLabel(p.note);
        const shapeHidden = currentFilter !== 'all' && p.shape !== currentFilter;
        const tone = /\/ps\//.test(p.img) ? 'product--light' : '';
        const showMm = p.size !== '—' && !String(p.weight).includes('ml') && p.category !== 'accessories';
        return `
          <article class="product ${tone} ${shapeHidden ? 'hidden' : ''}" data-shape="${p.shape}" data-cat="${p.category}">
            <div class="product__media">
              <img src="${p.img}" alt="${productTitle(p)}" loading="lazy" width="900" height="900">
              <span class="product__cat">${t('cat_' + (p.category === 'accessories' ? 'acc_short' : p.category + '_short'))}</span>
              ${note ? `<span class="product__badge">${note}</span>` : ''}
            </div>
            <div class="product__body">
              <div class="product__head">
                <h3 class="product__id">${productTitle(p)}</h3>
                <a class="product__ask" data-wa href="${WA}">${t('nav_inquiry')}</a>
              </div>
              <div class="product__specs" role="list">
                <div class="product__spec" role="listitem">
                  <span class="product__spec-label">${t('meta_size')}</span>
                  <span class="product__spec-value">${p.size}${showMm ? '<small> mm</small>' : ''}</span>
                </div>
                <div class="product__spec" role="listitem">
                  <span class="product__spec-label">${p.category === 'pp' ? t('meta_capacity') : t('meta_weight')}</span>
                  <span class="product__spec-value">${p.weight}</span>
                </div>
                <div class="product__spec" role="listitem">
                  <span class="product__spec-label">${t('meta_qty')}</span>
                  <span class="product__spec-value">${p.qty}</span>
                </div>
              </div>
            </div>
          </article>`;
      })
      .join('');

    setupWhatsApp();
  }

  function setupCategories() {
    const rail = $('.material-rail');
    if (!rail) return;
    rail.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-cat]');
      if (!btn) return;
      currentCategory = btn.dataset.cat;
      currentFilter = 'all';
      $$('.material-card').forEach((b) => b.classList.toggle('active', b === btn));
      $$('#productFilters button').forEach((b) => b.classList.toggle('active', b.dataset.filter === 'all'));
      categoryCopy();
      renderProducts();
      $('#products')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function setupFilters() {
    const box = $('#productFilters');
    if (!box) return;
    box.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-filter]');
      if (!btn) return;
      currentFilter = btn.dataset.filter;
      $$('#productFilters button').forEach((b) => b.classList.toggle('active', b === btn));
      renderProducts();
    });
  }

  function setupNav() {
    const nav = $('#siteNav');
    const toggle = $('#navToggle');
    const links = $('#navLinks');

    window.addEventListener(
      'scroll',
      () => {
        nav?.classList.toggle('scrolled', window.scrollY > 24);
      },
      { passive: true }
    );

    toggle?.addEventListener('click', () => links?.classList.toggle('open'));
    links?.addEventListener('click', (e) => {
      if (e.target.closest('a')) links.classList.remove('open');
    });

    $('#langBtn')?.addEventListener('click', (e) => {
      e.stopPropagation();
      $('#langSwitcher')?.classList.toggle('open');
    });

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#langSwitcher')) closeLang();
    });
  }

  function setupReveal() {
    const els = $$('.reveal');
    if (!('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach((el) => io.observe(el));
  }

  function setupWhatsApp() {
    $$('[data-wa]').forEach((el) => {
      el.setAttribute('href', WA);
      el.setAttribute('target', '_blank');
      el.setAttribute('rel', 'noopener noreferrer');
    });
  }

  function setupLiveChat() {
    $('#openChat')?.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
        window.Tawk_API.maximize();
      } else {
        window.open(WA, '_blank', 'noopener,noreferrer');
      }
    });
  }

  buildLangMenu();
  setupNav();
  setupCategories();
  setupFilters();
  setupWhatsApp();
  setupLiveChat();
  applyI18n();
  setupReveal();
})();
