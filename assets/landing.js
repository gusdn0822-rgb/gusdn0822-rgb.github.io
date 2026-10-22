// 남현우 포트폴리오 — 랜딩 움직임 (2026-10-23)
// 스크롤에 나타나기 · 이야기 단계마다 폰 화면 바꾸기 · 숫자가 바뀌어 가기 · 맨 위 진행 줄.
// 라이브러리 없이. 자바스크립트가 꺼져 있어도 내용은 처음부터 다 보인다(.js 일 때만 숨김).
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // 맨 위 진행 줄 · 머리줄 밑줄
  const bar = document.querySelector('.progress');
  const top = document.querySelector('.top');
  const onScroll = () => {
    const max = root.scrollHeight - innerHeight;
    if (bar) bar.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
    if (top) top.classList.toggle('scrolled', scrollY > 8);
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // 나타나기
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { rootMargin: '0px 0px -10% 0px' });
  $$('.reveal').forEach(el => reduce ? el.classList.add('in') : io.observe(el));

  // 이야기 단계 — 화면 가운데 띠에 들어온 단계가 '지금'
  const steps = $$('.step');
  const shots = $$('.sticky-phone .screen img');
  const dots = $$('.sticky-phone .dots i');
  const setStep = i => {
    steps.forEach((s, k) => s.classList.toggle('on', k === i));
    shots.forEach((s, k) => s.classList.toggle('on', k === i));
    dots.forEach((s, k) => s.classList.toggle('on', k === i));
  };
  if (steps.length) {
    setStep(0);
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) setStep(steps.indexOf(e.target));
    }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => so.observe(s));
  }

  // 일하는 방식 — 가운데에 온 줄만 밝게
  const lines = $$('.lines li');
  if (lines.length) {
    if (reduce) lines.forEach(l => l.classList.add('on'));
    else {
      const lo = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('on', e.isIntersecting)),
        { rootMargin: '-35% 0px -35% 0px' });
      lines.forEach(l => lo.observe(l));
    }
  }

  // 숫자 — data-from → data-to 로 1.4초 동안 (소수 자리 data-dec)
  const fmt = (v, dec) => v.toFixed(dec);
  const run = el => {
    const from = +el.dataset.from, to = +el.dataset.to, dec = +(el.dataset.dec || 0);
    const out = el.querySelector('.n');
    if (reduce) { out.textContent = fmt(to, dec); return; }
    const t0 = performance.now(), dur = 1400;
    const tick = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      out.textContent = fmt(from + (to - from) * e, dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  const co = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { run(e.target); co.unobserve(e.target); }
  }), { threshold: .6 });
  $$('[data-to]').forEach(el => {
    // 처음엔 시작값을 보여 둔다 — 최종값이 보였다가 시작값으로 튀지 않게(자바스크립트 없으면 HTML 의 최종값 그대로)
    if (!reduce) el.querySelector('.n').textContent = fmt(+el.dataset.from, +(el.dataset.dec || 0));
    co.observe(el);
  });
})();
