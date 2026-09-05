/* Progressive navigation only. Text and month anchors work without JavaScript. */
(() => {
  'use strict';
  const body = document.body;
  const hero = document.querySelector('.editorial-hero, .hero');
  const bar = document.querySelector('.bar');
  const progress = document.getElementById('pg');
  const navLinks = [...document.querySelectorAll('.page-nav a')];
  const navTargets = navLinks.map(link => ({ link, target: document.getElementById(link.hash.slice(1)) })).filter(item => item.target);
  if (bar) bar.dataset.enhanced = 'true';
  let queued = false;
  const updatePosition = () => {
    if (bar && hero) {
      const visible = hero.getBoundingClientRect().bottom < 60;
      bar.classList.toggle('on', visible);
      bar.inert = !visible;
      bar.setAttribute('aria-hidden', String(!visible));
    }
    if (progress) {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      const percent = distance > 0 ? Math.min(100, Math.max(0, window.scrollY / distance * 100)) : 0;
      progress.style.width = `${percent}%`;
    }
    let current;
    navTargets.forEach(item => { if (item.target.getBoundingClientRect().top <= 100) current = item.link; });
    navLinks.forEach(link => {
      if (link === current) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    queued = false;
  };
  const scheduleUpdate = () => {
    if (!queued) { queued = true; requestAnimationFrame(updatePosition); }
  };
  window.addEventListener('scroll', scheduleUpdate, { passive: true });
  window.addEventListener('resize', scheduleUpdate, { passive: true });
  window.addEventListener('pageshow', scheduleUpdate);
  window.addEventListener('load', scheduleUpdate);

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
      section.querySelectorAll('.cg-d').forEach(cell => {
        if (!cell.querySelector('.m')) return;
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

  updatePosition();
})();
