
import './main.css';


    (function() {
      'use strict';

      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      /* ========================================================================
         1. SCROLL REVEAL OBSERVER
         ======================================================================== */
      function initScrollReveals() {
        if (prefersReducedMotion) {
          document.querySelectorAll('[data-reveal], [data-reveal-item]').forEach(el => {
            el.classList.add('is-revealed', 'reveal-settled');
          });
          return;
        }

        document.querySelectorAll('[data-reveal-group="stagger"]').forEach(group => {
          group.querySelectorAll('[data-reveal-item]').forEach((item, idx) => {
            item.style.setProperty('--reveal-index', idx);
          });
        });

        const revealObserver = new IntersectionObserver((entries, observer) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              const target = entry.target;
              target.classList.add('is-revealed');
              target.addEventListener('transitionend', () => {
                target.classList.add('reveal-settled');
              }, { once: true });
              observer.unobserve(target);
            }
          });
        }, {
          rootMargin: '0px 0px -50px 0px',
          threshold: 0.1
        });

        document.querySelectorAll('[data-reveal], [data-reveal-group="stagger"]').forEach(el => {
          revealObserver.observe(el);
        });
      }

      /* ========================================================================
         2. THE BARISTA PILL (Scroll Past Hero Floating Dock)
         ======================================================================== */
      function initBaristaDock() {
        const dock = document.getElementById('baristaDock');
        const dismissBtn = document.getElementById('dockDismissBtn');
        const triggerBtn = document.getElementById('dockTriggerBtn');
        const hero = document.getElementById('hero');
        
        if (!dock) return;
        let isDismissed = false;

        const toggleDockVisibility = () => {
          if (isDismissed) return;
          const scrollY = window.scrollY || window.pageYOffset;
          const threshold = hero ? Math.min(hero.offsetTop + hero.offsetHeight * 0.4, 450) : 380;

          if (scrollY > threshold) {
            dock.classList.add('is-dock-visible');
            if (triggerBtn) triggerBtn.hidden = true;
          } else {
            dock.classList.remove('is-dock-visible');
          }
        };

        window.addEventListener('scroll', toggleDockVisibility, { passive: true });
        toggleDockVisibility();

        if (dismissBtn) {
          dismissBtn.addEventListener('click', () => {
            isDismissed = true;
            dock.classList.remove('is-dock-visible');
            if (triggerBtn) triggerBtn.hidden = false;
          });
        }

        if (triggerBtn) {
          triggerBtn.addEventListener('click', () => {
            isDismissed = false;
            triggerBtn.hidden = true;
            dock.classList.add('is-dock-visible');
          });
        }
      }

      /* ========================================================================
         3. BILINGUAL SWITCHER (EN / PL) WITH BUTTERY CROSS-FADE
         ======================================================================== */
      function initLanguageSwitch() {
        const wrap = document.getElementById('langSwitch');
        if (!wrap) return;

        const buttons = wrap.querySelectorAll('.lang-btn');
        const translatableElements = document.querySelectorAll('.lang-translatable');
        const translatedLabels = document.querySelectorAll('[data-en-label]');
        const translatedTitles = document.querySelectorAll('[data-en-title]');
        const translatedAlts = document.querySelectorAll('[data-en-alt]');
        const pageMeta = {
          en: {
            title: 'El Shaddai Indian Cafe & Punkt Ksero | Katowice',
            description: 'El Shaddai Indian Cafe & Punkt Ksero in Katowice (ul. Jagiellońska 22). Authentic South Indian Madras Filter Kaapi, warming regional chai, and student printing desk.'
          },
          pl: {
            title: 'El Shaddai | Indyjska kawiarnia i punkt ksero w Katowicach',
            description: 'El Shaddai przy ul. Jagiellońskiej 22 w Katowicach: południowoindyjska kawa filtrowana, aromatyczne chai oraz szybki druk i ksero dla studentów.'
          }
        };

        function applyLanguage(lang, smooth = true) {
          wrap.setAttribute('data-active', lang);
          document.documentElement.setAttribute('lang', lang);
          document.title = pageMeta[lang].title;
          document.querySelector('meta[name="description"]')?.setAttribute('content', pageMeta[lang].description);

          translatedLabels.forEach(el => {
            const label = el.getAttribute('data-' + lang + '-label');
            if (label) el.setAttribute('aria-label', label);
          });
          translatedTitles.forEach(el => {
            const title = el.getAttribute('data-' + lang + '-title');
            if (title) el.setAttribute('title', title);
          });
          translatedAlts.forEach(el => {
            const alt = el.getAttribute('data-' + lang + '-alt');
            if (alt) el.setAttribute('alt', alt);
          });
          if (typeof setNavToggleLabel === 'function' && navToggle) {
            setNavToggleLabel(navToggle.getAttribute('aria-expanded') === 'true');
          }

          try {
            localStorage.setItem('esh_lang', lang);
          } catch(e) {}

          buttons.forEach(btn => {
            const isActive = btn.getAttribute('data-lang') === lang;
            btn.classList.toggle('is-active', isActive);
            btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
          });

          if (!smooth || prefersReducedMotion) {
            translatableElements.forEach(el => {
              const val = el.getAttribute('data-' + lang);
              if (val) el.innerHTML = val;
            });
            updateWarsawStatus(lang);
            return;
          }

          translatableElements.forEach(el => el.classList.add('is-lang-fading'));

          setTimeout(() => {
            translatableElements.forEach(el => {
              const val = el.getAttribute('data-' + lang);
              if (val) el.innerHTML = val;
              el.classList.remove('is-lang-fading');
            });
            updateWarsawStatus(lang);
            const activeFilter = document.querySelector('.menu-filter-btn.is-active');
            if (activeFilter) updateFilterPillPosition(activeFilter, false);
          }, 120);

        }

        buttons.forEach(btn => {
          btn.addEventListener('click', () => {
            const selectedLang = btn.getAttribute('data-lang');
            applyLanguage(selectedLang, true);
          });
        });

        const urlParam = new URLSearchParams(window.location.search).get('lang');
        const savedLang = urlParam || (function(){ try { return localStorage.getItem('esh_lang'); } catch(e){ return null; } })() || 'en';
        if (savedLang === 'pl') {
          applyLanguage('pl', false);
        }
      }

      /* ========================================================================
         4. EUROPE/WARSAW TIME STATUS ENGINE
         ======================================================================== */
      function updateWarsawStatus(lang) {
        try {
          const now = new Date();
          const formatter = new Intl.DateTimeFormat('en-GB', {
            timeZone: 'Europe/Warsaw',
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
            hourCycle: 'h23'
          });
          const parts = formatter.formatToParts(now);
          let weekday = '', hour = 0, minute = 0;
          for (const p of parts) {
            if (p.type === 'weekday') weekday = p.value;
            if (p.type === 'hour') hour = parseInt(p.value, 10);
            if (p.type === 'minute') minute = parseInt(p.value, 10);
          }
          const currentMins = hour * 60 + minute;

          let isOpen = false;
          let closesAt = '';
          let opensNext = '';

          const isPl = (lang === 'pl');

          if (['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday)) {
            if (currentMins >= 450 && currentMins < 1170) {
              isOpen = true;
              closesAt = '19:30';
            } else if (currentMins < 450) {
              opensNext = isPl ? 'dzisiaj o 07:30' : 'today at 07:30';
            } else {
              opensNext = (weekday === 'Fri')
                ? (isPl ? 'w sobotę o 09:00' : 'Saturday at 09:00')
                : (isPl ? 'jutro o 07:30' : 'tomorrow at 07:30');
            }
          } else if (weekday === 'Sat') {
            if (currentMins >= 540 && currentMins < 1080) {
              isOpen = true;
              closesAt = '18:00';
            } else if (currentMins < 540) {
              opensNext = isPl ? 'dzisiaj o 09:00' : 'today at 09:00';
            } else {
              opensNext = isPl ? 'w niedzielę o 10:00' : 'Sunday at 10:00';
            }
          } else if (weekday === 'Sun') {
            if (currentMins >= 600 && currentMins < 1020) {
              isOpen = true;
              closesAt = '17:00';
            } else if (currentMins < 600) {
              opensNext = isPl ? 'dzisiaj o 10:00' : 'today at 10:00';
            } else {
              opensNext = isPl ? 'w poniedziałek o 07:30' : 'Monday at 07:30';
            }
          }

          const el = document.querySelector("#live-time-status");
          if (el) {
            if (isOpen) {
              el.innerHTML = isPl 
                ? `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span class="font-bold text-emerald-400">OTWARTE</span><span class="text-outline-variant">/</span><span class="text-on-surface">Zamykamy o ${closesAt}</span><span class="text-outline-variant">/</span><span class="text-on-surface-variant">ul. Jagiellońska 22</span>`
                : `<span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span><span class="font-bold text-emerald-400">OPEN NOW</span><span class="text-outline-variant">/</span><span class="text-on-surface">Closes ${closesAt}</span><span class="text-outline-variant">/</span><span class="text-on-surface-variant">ul. Jagiellońska 22</span>`;
            } else {
              el.innerHTML = isPl
                ? `<span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span><span class="font-bold text-amber-300">ZAMKNIĘTE</span><span class="text-outline-variant">/</span><span class="text-on-surface">Otwarcie: ${opensNext}</span><span class="text-outline-variant">/</span><span class="text-on-surface-variant">ul. Jagiellońska 22</span>`
                : `<span class="w-2.5 h-2.5 rounded-full bg-amber-600"></span><span class="font-bold text-amber-300">CLOSED NOW</span><span class="text-outline-variant">/</span><span class="text-on-surface">Opens ${opensNext}</span><span class="text-outline-variant">/</span><span class="text-on-surface-variant">ul. Jagiellońska 22</span>`;
            }
          }
        } catch (err) {
          console.warn("Warsaw time error", err);
        }
      }

      /* ========================================================================
         5. MENU FILTERING & SLIDING PILL HIGHLIGHT
         ======================================================================== */
      function updateFilterPillPosition(activeBtn, smooth = true) {
        const wrap = document.getElementById('menuFiltersWrap');
        const pill = document.getElementById('filterSliderPill');
        if (!wrap || !pill || !activeBtn) return;

        const wrapRect = wrap.getBoundingClientRect();
        const btnRect = activeBtn.getBoundingClientRect();
        const leftOffset = btnRect.left - wrapRect.left;
        const width = btnRect.width;

        if (!smooth || prefersReducedMotion) {
          pill.style.transition = 'none';
        } else {
          pill.style.transition = 'transform 0.32s cubic-bezier(0.16, 1, 0.3, 1), width 0.32s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        pill.style.transform = `translateX(${leftOffset}px)`;
        pill.style.width = `${width}px`;
      }

      window.filterMenu = function(category, event) {
        const allCategories = document.querySelectorAll('.menu-cat');
        allCategories.forEach(cat => {
          if (category === 'all' || cat.getAttribute('data-category') === category) {
            cat.style.display = 'block';
            const grid = cat.querySelector('[data-reveal-group="stagger"]');
            if (grid) grid.classList.add('is-revealed');
          } else {
            cat.style.display = 'none';
          }
        });

        const buttons = document.querySelectorAll('.menu-filter-btn');
        let selectedBtn = null;
        buttons.forEach(btn => {
          const isTarget = (event && btn === event.currentTarget) || (btn.getAttribute('data-category') === category);
          btn.classList.toggle('is-active', isTarget);
          btn.setAttribute('aria-selected', isTarget ? 'true' : 'false');
          if (isTarget) selectedBtn = btn;
        });

        if (selectedBtn) {
          updateFilterPillPosition(selectedBtn, true);
        }
      };

      /* ========================================================================
         6. MOBILE DRAWER NAVIGATION (Preserving user console.log("menu"))
         ======================================================================== */
      const navToggle = document.querySelector("#nav-toggle");
      const navigation = document.querySelector("#navigation");
      const navToggleIcon = document.querySelector("#nav-toggle-icon");

      function setNavToggleLabel(isOpen) {
        const isPolish = document.documentElement.lang === 'pl';
        navToggle.setAttribute(
          "aria-label",
          isOpen
            ? (isPolish ? "Zamknij menu" : "Close navigation")
            : (isPolish ? "Otwórz menu" : "Open navigation")
        );
      }

      function toggleNav() {
        const isHidden = navigation.classList.contains("hidden");
        if (isHidden) {
          navigation.classList.remove("hidden");
          navToggle.setAttribute("aria-expanded", "true");
          setNavToggleLabel(true);
          if (navToggleIcon) navToggleIcon.textContent = "close";
        } else {
          navigation.classList.add("hidden");
          navToggle.setAttribute("aria-expanded", "false");
          setNavToggleLabel(false);
          if (navToggleIcon) navToggleIcon.textContent = "menu";
        }
        console.log("menu");
      }

      function closeNav() {
        if (navigation && !navigation.classList.contains("hidden")) {
          navigation.classList.add("hidden");
          navToggle.setAttribute("aria-expanded", "false");
          setNavToggleLabel(false);
          if (navToggleIcon) navToggleIcon.textContent = "menu";
        }
      }

      if (navToggle) {
        navToggle.addEventListener("click", toggleNav);
      }

      document.querySelectorAll(".mobile-nav-link").forEach(a => {
        a.addEventListener("click", closeNav);
      });

      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeNav();
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth >= 1280) closeNav();
        const activeFilter = document.querySelector('.menu-filter-btn.is-active');
        if (activeFilter) updateFilterPillPosition(activeFilter, false);
      });

      /* ========================================================================
         7. UTILITIES: COPY EMAIL & PRINT GUIDE DIALOG
         ======================================================================== */
      window.copyEmail = function() {
        navigator.clipboard.writeText('elshaddaipunks@gmail.com').then(() => {
          const btn = document.querySelector("#copy-email-btn");
          if (btn) {
            const original = btn.textContent;
            btn.textContent = (document.documentElement.lang === 'pl') ? "Skopiowano!" : "Copied!";
            btn.classList.add("bg-primary", "text-surface-container-lowest");
            setTimeout(() => {
              btn.textContent = original;
              btn.classList.remove("bg-primary", "text-surface-container-lowest");
            }, 2000);
          }
        });
      };

      const guideDialog = document.querySelector("#print-guide");
      const guideOpen = document.querySelector("#guide-open");
      const guideClose = document.querySelector("#guide-close");

      if (guideOpen && guideDialog) {
        guideOpen.addEventListener("click", () => guideDialog.showModal());
      }
      if (guideClose && guideDialog) {
        guideClose.addEventListener("click", () => guideDialog.close());
      }
      if (guideDialog) {
        guideDialog.addEventListener("click", (e) => {
          const rect = guideDialog.getBoundingClientRect();
          if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) {
            guideDialog.close();
          }
        });
      }

      function initMenuFilters() {
        const activeBtn = document.querySelector('.menu-filter-btn.is-active');
        if (activeBtn) {
          updateFilterPillPosition(activeBtn, false);
          setTimeout(() => updateFilterPillPosition(activeBtn, false), 120);
        }
      }

      /* ========================================================================
         8. MAGNETIC BUTTON & HERO HOTSPOT DOCK ENGINE
         ======================================================================== */
      function initMagneticButton() {
        const btn = document.getElementById('heroMagneticBtn');
        if (!btn || prefersReducedMotion) return;

        btn.addEventListener('mousemove', (e) => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.28}px, ${y * 0.28}px) scale(1.02)`;
        });

        btn.addEventListener('mouseleave', () => {
          btn.style.transform = 'translate(0px, 0px) scale(1)';
        });
      }

      function initHeroHotspots() {
        const dock = document.getElementById('heroHotspotDock');
        const video = document.getElementById('heroVideoBg');
        if (!dock || !video) return;

        const defaultSrc = './assets/hero-bg.mp4';
        let currentActiveSrc = defaultSrc;
        let revertTimeout = null;

        const items = dock.querySelectorAll('.hotspot-item');

        function switchMedia(newSrc) {
          if (currentActiveSrc === newSrc) return;
          currentActiveSrc = newSrc;

          video.style.transition = 'opacity 350ms ease';
          video.style.opacity = '0.08';

          setTimeout(() => {
            if (newSrc.endsWith('.mp4')) {
              video.src = newSrc;
              video.load();
              video.play().catch(() => {});
            }
            video.style.opacity = '0.42';
          }, 200);
        }

        items.forEach(item => {
          item.addEventListener('mouseenter', () => {
            if (revertTimeout) clearTimeout(revertTimeout);
            items.forEach(i => i.classList.remove('is-active'));
            item.classList.add('is-active');

            const videoSrc = item.getAttribute('data-video');
            if (videoSrc) {
              switchMedia(videoSrc);
            }
          });
        });

        dock.addEventListener('mouseleave', () => {
          revertTimeout = setTimeout(() => {
            items.forEach(i => i.classList.remove('is-active'));
            switchMedia(defaultSrc);
          }, 300);
        });
      }

      // Initialize all on ready
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
          initScrollReveals();
          initBaristaDock();
          initLanguageSwitch();
          initMenuFilters();
          initMagneticButton();
          initHeroHotspots();
          updateWarsawStatus(document.documentElement.lang === 'pl' ? 'pl' : 'en');
        });
      } else {
        initScrollReveals();
        initBaristaDock();
        initLanguageSwitch();
        initMenuFilters();
        initMagneticButton();
        initHeroHotspots();
        updateWarsawStatus(document.documentElement.lang === 'pl' ? 'pl' : 'en');
      }
    })();
  


let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  const btn = document.getElementById('pwa-install-btn');
  if(btn) {
    btn.classList.remove('hidden');
    btn.addEventListener('click', async () => {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        btn.classList.add('hidden');
      }
      deferredPrompt = null;
    });
  }
});
