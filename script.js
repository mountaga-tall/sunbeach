(() => {
  const reveals = document.querySelectorAll('.reveal');
  const backTop = document.querySelector('.back-top');
  const glow = document.querySelector('.cursor-glow');

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      obs.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px' });

  reveals.forEach((el, index) => {
    el.style.transitionDelay = `${Math.min(index % 6, 5) * 70}ms`;
    observer.observe(el);
  });

  const onScroll = () => backTop.classList.toggle('show', window.scrollY > 700);
  window.addEventListener('scroll', onScroll, { passive: true });
  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  if (window.matchMedia('(pointer: fine)').matches) {
    window.addEventListener('pointermove', (event) => {
      glow.style.left = `${event.clientX}px`;
      glow.style.top = `${event.clientY}px`;
    }, { passive: true });
  } else {
    glow.remove();
  }

  document.querySelectorAll('.category-card').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      if (!window.matchMedia('(pointer: fine)').matches) return;
      const rect = card.getBoundingClientRect();
      const x = ((event.clientX - rect.left) / rect.width) * 100;
      const y = ((event.clientY - rect.top) / rect.height) * 100;
      card.style.background = `radial-gradient(circle at ${x}% ${y}%, rgba(240,177,111,.10), transparent 35%), linear-gradient(145deg, rgba(67,29,13,.66), rgba(30,12,7,.72))`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.background = '';
    });
  });
})();