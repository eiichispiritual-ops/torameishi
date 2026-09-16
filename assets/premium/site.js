(() => {
  'use strict';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const revealElements = [...document.querySelectorAll('.reveal')];
  let revealObserver;
  if ('IntersectionObserver' in window && !reduceMotion.matches) {
    document.documentElement.classList.add('motion-ready');
    revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px 30px 0px' });
    revealElements.forEach(element => revealObserver.observe(element));
  }
  reduceMotion.addEventListener('change', event => {
    if (event.matches) {
      revealObserver?.disconnect();
      document.documentElement.classList.remove('motion-ready');
    }
  });
  const progress = document.querySelector('.reading-progress');
  const bar = document.querySelector('.purchase-bar');
  const hero = document.querySelector('.hero');
  const order = document.querySelector('#order');
  let ticking = false;
  let visible = false;
  function updateScroll() {
    const range = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${range > 0 ? Math.min(1, Math.max(0, window.scrollY / range)) : 0})`;
    const orderBox = order.getBoundingClientRect();
    const orderIsVisible = orderBox.top < window.innerHeight * .65 && orderBox.bottom > window.innerHeight * .35;
    const shouldShow = window.scrollY > hero.offsetHeight * .8 && !orderIsVisible;
    if (shouldShow !== visible) {
      visible = shouldShow;
      if (visible) {
        bar.hidden = false;
        requestAnimationFrame(() => { if (visible) bar.classList.add('visible'); });
      } else {
        bar.classList.remove('visible');
        bar.hidden = true;
      }
    }
    ticking = false;
  }
  function scheduleUpdate() {
    if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); }
  }
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate);
  document.querySelectorAll('details').forEach(element => element.addEventListener('toggle', scheduleUpdate));
  updateScroll();

  const mainImage = document.querySelector('#gallery-image');
  const caption = document.querySelector('#gallery-caption');
  const galleryButtons = [...document.querySelectorAll('[data-image]')];
  let imageRequest = 0;
  galleryButtons.forEach(button => {
    button.addEventListener('click', () => {
      if (button.getAttribute('aria-pressed') === 'true') return;
      const request = ++imageRequest;
      const next = new Image();
      next.onload = () => {
        if (request !== imageRequest) return;
        mainImage.src = button.dataset.image;
        mainImage.alt = button.dataset.alt;
        caption.textContent = button.dataset.caption;
        galleryButtons.forEach(item => {
          const selected = item === button;
          item.classList.toggle('selected', selected);
          item.setAttribute('aria-pressed', String(selected));
        });
        mainImage.classList.remove('changing');
      };
      next.onerror = () => {
        if (request === imageRequest) mainImage.classList.remove('changing');
      };
      mainImage.classList.add('changing');
      next.src = button.dataset.image;
    });
  });
})();
