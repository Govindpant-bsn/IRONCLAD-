/* ===================================================================
   IRONCLAD — Interactions
   Vanilla JS only. Organized by feature, each self-contained.
=================================================================== */

/* ---------------------------------------------------------------
   Mobile viewport height fix (iOS Safari address-bar resize)
   Feeds a --vh custom property that .hero uses as a fallback for
   browsers that don't yet support 100dvh.
--------------------------------------------------------------- */
(function initViewportHeightFix() {
  function setVH() {
    document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
  }
  setVH();
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', setVH);
})();

document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initNav();
  initMobileMenu();
  initScrollRail();
  initScrollReveal();
  initCounters();
  initMagneticButtons();
  initRipple();
  initCompareSlider();
  initTestimonialCarousel();
  initFAQAccordion();
  initGalleryLightbox();
  initContactForm();
  initFloatingLabels();
  initBackToTop();
  initActiveNavLink();
});

/* ---------------------------------------------------------------
   Loading Screen
--------------------------------------------------------------- */
function initLoader() {
  const loader = document.getElementById('loader');
  const countEl = document.getElementById('loaderCount');
  if (!loader) return;

  let pct = 0;
  const interval = setInterval(() => {
    pct = Math.min(100, pct + Math.round(Math.random() * 18) + 4);
    countEl.textContent = String(pct).padStart(2, '0');
    if (pct >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        loader.classList.add('is-hidden');
        document.body.style.overflow = '';
      }, 250);
    }
  }, 140);

  document.body.style.overflow = 'hidden';
  // Safety: never block the page for more than ~2.5s
  setTimeout(() => {
    loader.classList.add('is-hidden');
    document.body.style.overflow = '';
  }, 2500);
}

/* ---------------------------------------------------------------
   Custom Cursor
--------------------------------------------------------------- */
function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor || window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
  });

  // Smooth-trailing ring via rAF (dot follows instantly through CSS parent transform,
  // ring lags very slightly using a secondary transform for organic feel)
  const ring = cursor.querySelector('.cursor__ring');
  function animateRing() {
    ringX += (mouseX - ringX) * 0.25;
    ringY += (mouseY - ringY) * 0.25;
    ring.style.transform = `translate(${ringX - mouseX}px, ${ringY - mouseY}px)`;
    requestAnimationFrame(animateRing);
  }
  animateRing();

  document.addEventListener('mousedown', () => cursor.classList.add('is-down'));
  document.addEventListener('mouseup', () => cursor.classList.remove('is-down'));

  const hoverTargets = 'a, button, .magnetic, input, textarea, select, .gallery__item, [data-cursor-hover]';
  document.querySelectorAll(hoverTargets).forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });

  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
}

/* ---------------------------------------------------------------
   Navbar — glass on scroll
--------------------------------------------------------------- */
function initNav() {
  const nav = document.getElementById('nav');
  if (!nav) return;
  const onScroll = () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ---------------------------------------------------------------
   Mobile Menu
--------------------------------------------------------------- */
function initMobileMenu() {
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  function close() {
    menu.classList.remove('is-open');
    burger.setAttribute('aria-expanded', 'false');
    burger.setAttribute('aria-label', 'Open menu');
    document.body.style.overflow = '';
  }
  function open() {
    menu.classList.add('is-open');
    burger.setAttribute('aria-expanded', 'true');
    burger.setAttribute('aria-label', 'Close menu');
    document.body.style.overflow = 'hidden';
  }

  burger.addEventListener('click', () => {
    const isOpen = menu.classList.contains('is-open');
    isOpen ? close() : open();
  });

  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });

  // If a tablet is rotated (or resized) past the desktop nav breakpoint
  // while the mobile menu is open, close it so it doesn't stay stuck
  // over the now-visible desktop nav links.
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 1000 && menu.classList.contains('is-open')) {
      close();
    }
  });
}

/* ---------------------------------------------------------------
   Scroll Progress Rail (lift-bar)
--------------------------------------------------------------- */
function initScrollRail() {
  const fill = document.getElementById('railFill');
  if (!fill) return;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
    fill.style.height = pct + '%';
  };
  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ---------------------------------------------------------------
   Scroll Reveal (fade/slide/blur)
--------------------------------------------------------------- */
function initScrollReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // small stagger for items revealed together
        setTimeout(() => entry.target.classList.add('is-visible'), i * 40);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

  items.forEach(item => observer.observe(item));
}

/* ---------------------------------------------------------------
   Animated Counters
--------------------------------------------------------------- */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10) || 0;
    const suffix = el.getAttribute('data-suffix') || '';
    const duration = 1600;
    const start = performance.now();

    function tick(now) {
      const progress = Math.min(1, (now - start) / duration);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(eased * target);
      el.textContent = value.toLocaleString() + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });

  counters.forEach(c => observer.observe(c));
}

/* ---------------------------------------------------------------
   Magnetic Buttons
--------------------------------------------------------------- */
function initMagneticButtons() {
  if (window.matchMedia('(hover: none)').matches) return;
  const buttons = document.querySelectorAll('.magnetic');

  buttons.forEach(btn => {
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      btn.style.transform = `translate(${x * 0.25}px, ${y * 0.35}px)`;
    });
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = 'translate(0, 0)';
    });
  });
}

/* ---------------------------------------------------------------
   Button Ripple
--------------------------------------------------------------- */
function initRipple() {
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const rect = btn.getBoundingClientRect();
      btn.style.setProperty('--rx', (e.clientX - rect.left) + 'px');
      btn.style.setProperty('--ry', (e.clientY - rect.top) + 'px');
      btn.classList.remove('is-rippling');
      // restart animation
      void btn.offsetWidth;
      btn.classList.add('is-rippling');
    });
  });
}

/* ---------------------------------------------------------------
   Before/After Compare Slider
--------------------------------------------------------------- */
function initCompareSlider() {
  const wrap = document.getElementById('compareSlider');
  const beforeWrap = document.getElementById('beforeWrap');
  const handle = document.getElementById('compareHandle');
  if (!wrap || !beforeWrap || !handle) return;

  let dragging = false;

  function setPosition(clientX) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(2, Math.min(98, pct));
    beforeWrap.style.width = pct + '%';
    beforeWrap.querySelector('img').style.width = (100 / (pct / 100)) + '%';
    handle.style.left = pct + '%';
  }

  wrap.addEventListener('pointerdown', (e) => {
    dragging = true;
    setPosition(e.clientX);
  });
  window.addEventListener('pointermove', (e) => {
    if (dragging) setPosition(e.clientX);
  });
  window.addEventListener('pointerup', () => { dragging = false; });

  // Touch-friendly default + keyboard support
  handle.setAttribute('tabindex', '0');
  handle.setAttribute('role', 'slider');
  handle.setAttribute('aria-label', 'Drag to compare before and after photos');
  handle.setAttribute('aria-valuemin', '0');
  handle.setAttribute('aria-valuemax', '100');
  handle.setAttribute('aria-valuenow', '55');

  handle.addEventListener('keydown', (e) => {
    const rect = wrap.getBoundingClientRect();
    let current = parseFloat(beforeWrap.style.width) || 55;
    if (e.key === 'ArrowLeft') current -= 5;
    if (e.key === 'ArrowRight') current += 5;
    current = Math.max(2, Math.min(98, current));
    beforeWrap.style.width = current + '%';
    beforeWrap.querySelector('img').style.width = (100 / (current / 100)) + '%';
    handle.style.left = current + '%';
    handle.setAttribute('aria-valuenow', String(Math.round(current)));
  });
}

/* ---------------------------------------------------------------
   Testimonial Carousel (auto-sliding)
--------------------------------------------------------------- */
function initTestimonialCarousel() {
  const track = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  if (!track || !dotsWrap) return;

  const slides = Array.from(track.children);
  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('role', 'tab');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('is-active');
    dot.addEventListener('click', () => goTo(i));
    dotsWrap.appendChild(dot);
  });
  const dots = Array.from(dotsWrap.children);

  function goTo(i) {
    index = (i + slides.length) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    dots.forEach(d => d.classList.remove('is-active'));
    dots[index].classList.add('is-active');
  }

  function startAuto() {
    timer = setInterval(() => goTo(index + 1), 5500);
  }
  function stopAuto() {
    clearInterval(timer);
  }

  track.parentElement.addEventListener('mouseenter', stopAuto);
  track.parentElement.addEventListener('mouseleave', startAuto);

  // Touch swipe support — desktop only has mouseenter/leave to pause,
  // touch devices need their own gesture handling
  const wrap = track.parentElement;
  let touchStartX = 0;
  let touchDeltaX = 0;

  wrap.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchDeltaX = 0;
    stopAuto();
  }, { passive: true });

  wrap.addEventListener('touchmove', (e) => {
    touchDeltaX = e.touches[0].clientX - touchStartX;
  }, { passive: true });

  wrap.addEventListener('touchend', () => {
    if (Math.abs(touchDeltaX) > 40) {
      goTo(touchDeltaX < 0 ? index + 1 : index - 1);
    }
    startAuto();
  });

  startAuto();
}

/* ---------------------------------------------------------------
   FAQ Accordion
--------------------------------------------------------------- */
function initFAQAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach(item => {
    const btn = item.querySelector('.faq-item__q');
    const answer = item.querySelector('.faq-item__a');

    btn.addEventListener('click', () => {
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // close others
      items.forEach(other => {
        if (other !== item) {
          other.querySelector('.faq-item__q').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-item__a').style.maxHeight = '0px';
        }
      });

      btn.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '0px' : answer.scrollHeight + 'px';
    });
  });

  // Rotating the phone reflows text and changes scrollHeight; without
  // this the open answer's fixed max-height would clip the new layout
  window.addEventListener('resize', () => {
    const openBtn = document.querySelector('.faq-item__q[aria-expanded="true"]');
    if (openBtn) {
      const openAnswer = openBtn.closest('.faq-item').querySelector('.faq-item__a');
      openAnswer.style.maxHeight = openAnswer.scrollHeight + 'px';
    }
  });
}

/* ---------------------------------------------------------------
   Gallery Lightbox
--------------------------------------------------------------- */
function initGalleryLightbox() {
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn = document.getElementById('lightboxClose');
  const items = document.querySelectorAll('.gallery__item');
  if (!lightbox || !items.length) return;

  function open(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  items.forEach(item => {
    item.addEventListener('click', () => {
      const full = item.getAttribute('data-full');
      const alt = item.querySelector('img').alt;
      open(full, alt);
    });
  });

  closeBtn.addEventListener('click', close);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}

/* ---------------------------------------------------------------
   Contact Form (front-end simulation)
--------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('.contact__form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (form.classList.contains('is-submitting')) return;

    form.classList.add('is-submitting');
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;

    setTimeout(() => {
      form.classList.remove('is-submitting');
      btn.disabled = false;
      const label = btn.querySelector('.btn__label');
      const original = label.textContent;
      label.textContent = 'Request sent ✓';
      form.reset();
      form.querySelectorAll('.form-field select').forEach(s => s.classList.remove('has-value'));
      setTimeout(() => { label.textContent = original; }, 2600);
    }, 1300);
  });

  // newsletter form (footer) — same lightweight simulation
  const newsletter = document.querySelector('.footer__form');
  if (newsletter) {
    newsletter.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = newsletter.querySelector('input');
      const original = input.placeholder;
      input.value = '';
      input.placeholder = 'Subscribed ✓';
      setTimeout(() => { input.placeholder = original; }, 2400);
    });
  }
}

/* ---------------------------------------------------------------
   Floating Labels (select needs manual "has value" class)
--------------------------------------------------------------- */
function initFloatingLabels() {
  document.querySelectorAll('.form-field select').forEach(select => {
    select.addEventListener('change', () => {
      select.classList.toggle('has-value', select.value !== '');
    });
  });
}

/* ---------------------------------------------------------------
   Back to Top
--------------------------------------------------------------- */
function initBackToTop() {
  const btn = document.getElementById('toTop');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('is-visible', window.scrollY > 700);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ---------------------------------------------------------------
   Active Nav Link on Scroll
--------------------------------------------------------------- */
function initActiveNavLink() {
  const sections = document.querySelectorAll('main > section[id]');
  const links = document.querySelectorAll('.nav__link');
  if (!sections.length || !links.length) return;

  const map = new Map();
  links.forEach(link => {
    const id = link.getAttribute('href').replace('#', '');
    map.set(id, link);
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = map.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        links.forEach(l => l.classList.remove('is-active'));
        link.classList.add('is-active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => observer.observe(s));
}

/* ---------------------------------------------------------------
   Hero parallax (subtle image drift on scroll)
--------------------------------------------------------------- */
(function initHeroParallax() {
  const img = document.querySelector('.hero__img');
  if (!img || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    if (y < window.innerHeight) {
      img.style.transform = `scale(1.1) translateY(${y * 0.15}px)`;
    }
  }, { passive: true });
})();
