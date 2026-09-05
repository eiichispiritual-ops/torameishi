/* Finite, progressive motion: visible base styles, no scroll hijacking or dependencies. */
(() => {
 'use strict';
 if (!window.matchMedia || typeof Element.prototype.animate !== 'function') return;
 const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
 const active = new Set();
 const seen = new WeakSet();
 const sales = document.body.classList.contains('page-sales');
 const duration = sales ? 880 : 600;
 const easing = 'cubic-bezier(.22,.68,.2,1)';
 let observer;
 const play = (element, frames, options = {}) => {
  if (!element || preference.matches || document.hidden) return;
  try {
   const animation = element.animate(frames, { duration, easing, fill:'none', ...options });
   active.add(animation);
   animation.onfinish = animation.oncancel = () => active.delete(animation);
  } catch (_) { /* Unsupported animation never hides or blocks content. */ }
 };
 const cancel = () => { [...active].forEach(animation => animation.cancel()); active.clear(); };
 const reveal = element => {
  if (seen.has(element)) return;
  seen.add(element);
  if (element.matches('.phb, .phw')) {
   play(element, [{opacity:.55,transform:'translateY(22px)'},{opacity:1,transform:'none'}]);
   play(element.querySelector('img'), [{transform:'scale(1.045)'},{transform:'scale(1)'}], {duration:sales ? 1700 : 1000});
  } else if (element.matches('.rl')) {
   play(element, [{transform:'scaleX(.2)',opacity:.4},{transform:'scaleX(1)',opacity:1}], {duration:1000});
  } else {
   play(element, [{opacity:.55,transform:'translateY(16px)'},{opacity:1,transform:'none'}]);
  }
 };
 const watch = () => {
  observer?.disconnect();
  if (preference.matches || !window.IntersectionObserver) return;
  observer = new IntersectionObserver(entries => {
   entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    reveal(entry.target);
    observer.unobserve(entry.target);
   });
  }, {threshold:0.08});
  document.querySelectorAll('section h2, section .phb, section .phw, .fb .in, section .rl, .guide-first li, .cg, .cal .rw').forEach(element => {
   if (!seen.has(element)) observer.observe(element);
  });
 };
 // Hero text is always available. Price and purchasing controls are never animated in.
 if (!preference.matches) {
  const image = document.querySelector('.hero-image-window img, .guide-photo img');
  const animateImage = () => play(image,[{opacity:.75,transform:'scale(1.055)'},{opacity:1,transform:'scale(1)'}],{duration:2200});
  if (image?.complete) animateImage();
  else image?.addEventListener('load',animateImage,{once:true});
  document.querySelectorAll('.hero-copy > *, .calendar-hero .ym, .calendar-hero h1, .calendar-hero .ul2, .calendar-hero .chip').forEach((element,index) => {
   play(element,[{opacity:.6,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:900,delay:Math.min(index*100,500)});
  });
 }
 watch();
 const preferenceChanged = () => { cancel(); watch(); };
 if (preference.addEventListener) preference.addEventListener('change',preferenceChanged);
 else preference.addListener?.(preferenceChanged);
 document.addEventListener('visibilitychange',() => { if (document.hidden) cancel(); });
 window.addEventListener('pagehide',cancel);
})();
