/* Progressive navigation only. Text and month anchors work without JavaScript. */
(() => {
  'use strict';
  const body = document.body;
  const hero = document.querySelector('.editorial-hero, .hero');
  const bar = document.querySelector('.bar');
  let queued = false;
  const updateBar = () => {
    if (bar && hero) bar.classList.toggle('on', hero.getBoundingClientRect().bottom < 60);
    queued = false;
  };
  if (bar) {
    updateBar();
    window.addEventListener('scroll', () => {
      if (!queued) { queued = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    window.addEventListener('resize', updateBar, { passive: true });
  }

  if (body.classList.contains('page-calendar')) {
    document.querySelectorAll('[id^="month-"]').forEach(heading => {
      const section = heading.closest('section');
      const month = Number(heading.id.replace('month-', ''));
      const rows = [...section.querySelectorAll('.cal .rw')];
      const targets = new Map();
      rows.forEach((row, index) => {
        row.id = `day-${month}-${index + 1}`;
        const label = row.querySelector('.dt')?.textContent || '';
        for (const match of label.matchAll(/(\d+)日/g)) {
          const day = Number(match[1]);
          if (!targets.has(day)) targets.set(day, row.id);
        }
      });
      let linked = 0;
      section.querySelectorAll('.cg-d:has(.m)').forEach(cell => {
        const day = Number(cell.querySelector('.n')?.textContent);
        const target = targets.get(day);
        if (!target) return;
        const link = document.createElement('a');
        link.href = `#${target}`;
        link.setAttribute('aria-label', `${month}月${day}日の過ごし方を見る`);
        cell.append(link);
        linked++;
      });
      if (linked) {
        const hint = document.createElement('p');
        hint.className = 'calendar-hint';
        hint.textContent = '色のついた日をタップすると、その日の過ごし方へ進みます。';
        section.querySelector('.cg')?.append(hint);
      }
    });
  }

  const navLinks = [...document.querySelectorAll('.page-nav a')];
  const targets = navLinks.map(link => document.getElementById(link.hash.slice(1))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        navLinks.forEach(link => {
          if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
          else link.removeAttribute('aria-current');
        });
      }
    }, { rootMargin: '-64px 0px -55% 0px', threshold: 0 });
    targets.forEach(target => observer.observe(target));
  }
})();
