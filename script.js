(() => {
  'use strict';

  const qs = (selector, root = document) => root.querySelector(selector);
  const qsa = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;

  // Entrance loader
  window.addEventListener('load', () => {
    const loader = qs('.page-loader');
    if (!loader) return;
    window.setTimeout(() => loader.classList.add('is-done'), reduceMotion ? 0 : 450);
  });

  // Scroll progress + header state
  const progress = qs('.scroll-progress i');
  const header = qs('.site-header');
  const backTop = qs('.back-top');

  const updateScrollUI = () => {
    const scrollable = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
    if (progress) progress.style.width = (ratio * 100) + '%';
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    if (backTop) backTop.classList.toggle('show', window.scrollY > 700);
  };

  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    window.requestAnimationFrame(() => {
      updateScrollUI();
      scrollTick = false;
    });
  }, { passive: true });
  updateScrollUI();

  // Mobile navigation
  const toggle = qs('.menu-toggle');
  const mobileNav = qs('.mobile-nav');

  const closeMobileNav = () => {
    if (!toggle || !mobileNav) return;
    toggle.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    mobileNav.classList.remove('is-open');
    mobileNav.setAttribute('aria-hidden', 'true');
  };

  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = !toggle.classList.contains('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      mobileNav.classList.toggle('is-open', open);
      mobileNav.setAttribute('aria-hidden', String(!open));
    });

    qsa('a', mobileNav).forEach((link) => link.addEventListener('click', closeMobileNav));
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMobileNav();
    });
  }

  // Reveal animation
  const reveals = qsa('.reveal');
  if (!reduceMotion && 'IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -35px' });

    reveals.forEach((el, index) => {
      el.style.transitionDelay = Math.min(index % 7, 6) * 65 + 'ms';
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-visible'));
  }

  // Active experience pills
  const pills = qsa('.experience-pill');
  const sections = [qs('#food'), qs('#drinks'), qs('#contact')].filter(Boolean);

  if ('IntersectionObserver' in window && sections.length && pills.length) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        pills.forEach((pill) => pill.classList.toggle('active', pill.getAttribute('href') === '#' + id));
      });
    }, { threshold: 0.38, rootMargin: '-18% 0px -52% 0px' });

    sections.forEach((section) => sectionObserver.observe(section));
  }

  // Back to top
  if (backTop) {
    backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  }

  // Smooth anchor navigation
  qsa('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = qs(targetId);
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    });
  });

  // Cursor atmosphere
  const glow = qs('.cursor-glow');
  if (glow && finePointer && !reduceMotion) {
    let gx = window.innerWidth / 2;
    let gy = window.innerHeight / 2;
    let tx = gx;
    let ty = gy;

    window.addEventListener('pointermove', (event) => {
      tx = event.clientX;
      ty = event.clientY;
    }, { passive: true });

    const animateGlow = () => {
      gx += (tx - gx) * 0.16;
      gy += (ty - gy) * 0.16;
      glow.style.left = gx + 'px';
      glow.style.top = gy + 'px';
      requestAnimationFrame(animateGlow);
    };
    animateGlow();
  } else if (glow) {
    glow.remove();
  }

  // Hero depth / parallax
  const hero = qs('.hero');
  const heroCopy = qs('.hero-copy');
  const heroStamp = qs('.hero-stamp');
  const heroLogo = qs('.hero-logo');

  if (hero && finePointer && !reduceMotion) {
    hero.addEventListener('pointermove', (event) => {
      const rect = hero.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width - 0.5;
      const py = (event.clientY - rect.top) / rect.height - 0.5;
      if (heroCopy) heroCopy.style.transform = `translate3d(${px * 7}px, ${py * 7}px, 0)`;
      if (heroStamp) heroStamp.style.margin = `${py * -10}px ${px * -10}px`;
      if (heroLogo) heroLogo.style.transform = `translate3d(${px * -10}px, ${py * -7}px, 0)`;
    });
    hero.addEventListener('pointerleave', () => {
      if (heroCopy) heroCopy.style.transform = '';
      if (heroStamp) heroStamp.style.margin = '';
      if (heroLogo) heroLogo.style.transform = '';
    });
  }

  // Premium 3D menu cards
  if (finePointer && !reduceMotion) {
    qsa('.category-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        const ry = (x - 0.5) * 8;
        const rx = (0.5 - y) * 8;

        card.style.setProperty('--rx', rx.toFixed(2) + 'deg');
        card.style.setProperty('--ry', ry.toFixed(2) + 'deg');
        card.style.setProperty('--spot-x', (x * 100).toFixed(1) + '%');
        card.style.setProperty('--spot-y', (y * 100).toFixed(1) + '%');
      });

      card.addEventListener('pointerleave', () => {
        card.style.setProperty('--rx', '0deg');
        card.style.setProperty('--ry', '0deg');
        card.style.setProperty('--spot-x', '50%');
        card.style.setProperty('--spot-y', '50%');
      });
    });
  }

  // Magnetic buttons
  if (finePointer && !reduceMotion) {
    qsa('.button, .header-cta, .footer-social-card, .floating-wa').forEach((el) => {
      el.addEventListener('pointermove', (event) => {
        const rect = el.getBoundingClientRect();
        const dx = (event.clientX - (rect.left + rect.width / 2)) / rect.width;
        const dy = (event.clientY - (rect.top + rect.height / 2)) / rect.height;
        el.style.transform = `translate(${dx * 7}px, ${dy * 7}px)`;
      });
      el.addEventListener('pointerleave', () => {
        el.style.transform = '';
      });
    });
  }

  // Micro shine on interactive elements
  if (finePointer && !reduceMotion) {
    qsa('.category-card, .footer-social-card, .button').forEach((el) => {
      el.addEventListener('pointerenter', () => el.classList.add('is-hovered'));
      el.addEventListener('pointerleave', () => el.classList.remove('is-hovered'));
    });
  }
})();