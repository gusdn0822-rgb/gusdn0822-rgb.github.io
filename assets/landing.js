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

  // ── 2판 (2026-10-23) ──────────────────────────────────────────────

  // 큰 문장 — 낱말로 쪼개 두고, 문장이 화면을 지나는 만큼 앞에서부터 진하게 (Linear·Apple)
  $$('.statement').forEach(st => {
    const words = [];
    const walk = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) { frag.append(part); return; }
          const s = document.createElement('span'); s.className = 'w'; s.textContent = part; words.push(s); frag.append(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) walk(n);
    });
    walk(st);
    if (reduce) { words.forEach(w => w.classList.add('lit')); return; }
    const paint = () => {
      const r = st.getBoundingClientRect();
      // 문장 윗선이 화면 85% 에 올 때 0, 아랫선이 화면 45% 를 지날 때 1
      const p = Math.min(1, Math.max(0, (innerHeight * .85 - r.top) / (r.height + innerHeight * .4)));
      const k = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle('lit', i < k));
    };
    addEventListener('scroll', paint, { passive: true });
    paint();
  });

  // 마우스를 따라 비추는 빛
  $$('.spot').forEach(el => el.addEventListener('pointermove', e => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    el.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }));

  // 데모 ① 한국어 찾기 — 그대로 · 초성 · 영문 자판 오타(두벌식). 이름은 모두 시연용.
  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const JUNG = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ';
  const JONG = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ', 'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ', 'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
  const KEYS = { q: 'ㅂ', w: 'ㅈ', e: 'ㄷ', r: 'ㄱ', t: 'ㅅ', y: 'ㅛ', u: 'ㅕ', i: 'ㅑ', o: 'ㅐ', p: 'ㅔ', a: 'ㅁ', s: 'ㄴ', d: 'ㅇ', f: 'ㄹ', g: 'ㅎ', h: 'ㅗ', j: 'ㅓ', k: 'ㅏ', l: 'ㅣ', z: 'ㅋ', x: 'ㅌ', c: 'ㅊ', v: 'ㅍ', b: 'ㅠ', n: 'ㅜ', m: 'ㅡ', Q: 'ㅃ', W: 'ㅉ', E: 'ㄸ', R: 'ㄲ', T: 'ㅆ', O: 'ㅒ', P: 'ㅖ' };
  const VV = { 'ㅗㅏ': 'ㅘ', 'ㅗㅐ': 'ㅙ', 'ㅗㅣ': 'ㅚ', 'ㅜㅓ': 'ㅝ', 'ㅜㅔ': 'ㅞ', 'ㅜㅣ': 'ㅟ', 'ㅡㅣ': 'ㅢ' };
  const CC = { 'ㄱㅅ': 'ㄳ', 'ㄴㅈ': 'ㄵ', 'ㄴㅎ': 'ㄶ', 'ㄹㄱ': 'ㄺ', 'ㄹㅁ': 'ㄻ', 'ㄹㅂ': 'ㄼ', 'ㄹㅅ': 'ㄽ', 'ㄹㅌ': 'ㄾ', 'ㄹㅍ': 'ㄿ', 'ㄹㅎ': 'ㅀ', 'ㅂㅅ': 'ㅄ' };
  const choseong = s => [...s].map(ch => { const c = ch.charCodeAt(0) - 0xAC00; return c >= 0 && c < 11172 ? CHO[Math.floor(c / 588)] : ch; }).join('');
  const engToKo = s => {
    let out = '', cho = '', jung = '', jong = '';
    const flush = () => { out += cho && jung ? String.fromCharCode(0xAC00 + CHO.indexOf(cho) * 588 + JUNG.indexOf(jung) * 28 + JONG.indexOf(jong)) : cho + jung + jong; cho = jung = jong = ''; };
    for (const j of [...s].map(ch => KEYS[ch] || KEYS[ch.toLowerCase()] || ch)) {
      const isV = JUNG.includes(j);
      if (!isV && !CHO.includes(j) && !JONG.includes(j)) { flush(); out += j; continue; }
      if (isV) {
        if (jong) { const pair = Object.entries(CC).find(([, v]) => v === jong); const [keep, move] = pair ? [pair[0][0], pair[0][1]] : ['', jong]; jong = keep; flush(); cho = move; jung = j; }
        else if (jung && VV[jung + j]) jung = VV[jung + j];
        else if (cho && !jung) jung = j;
        else { flush(); jung = j; }
      } else if (!cho && !jung) cho = j;
      else if (cho && !jung) { flush(); cho = j; }
      else if (jung && !jong && JONG.includes(j)) jong = j;
      else if (jong && CC[jong + j]) jong = CC[jong + j];
      else { flush(); cho = j; }
    }
    flush(); return out;
  };
  const why = (name, q) => {
    const raw = q.trim().toLowerCase();
    if (!raw) return '';
    if (name.toLowerCase().includes(raw)) return '그대로';
    if (/^[ㄱ-ㅎ\s]+$/.test(raw)) return name.split(/\s+/).some(w => choseong(w).includes(raw.replace(/\s/g, ''))) ? '초성' : null;
    if (/^[a-z\s]+$/i.test(raw)) { const k = engToKo(q.trim()); return k && name.includes(k) ? `한영 오타 → ${k}` : null; }
    return null;
  };
  $$('.palette').forEach(pal => {
    const people = JSON.parse(pal.dataset.people);
    const input = pal.querySelector('input'), list = pal.querySelector('ul');
    const draw = () => {
      const q = input.value;
      const rows = people.map(p => ({ ...p, w: why(p.n, q) })).filter(p => q.trim() === '' || p.w);
      // 비어 있을 땐 넷만 — 열 명을 다 보이면 칸 안에 스크롤바가 생겨 '쳐 보라'는 칸처럼 안 보인다
      list.innerHTML = rows.length ? rows.slice(0, q.trim() ? 6 : 4).map(p =>
        `<li><span class="av">${p.n[0]}</span><span><span class="nm">${p.n}</span><br><span class="sub2">${p.s}</span></span>${p.w ? `<span class="why">${p.w}</span>` : ''}</li>`).join('')
        : '<li class="empty">맞는 사람이 없어요</li>';
    };
    input.addEventListener('input', draw);
    pal.parentElement.querySelectorAll('.tries button').forEach(b => b.addEventListener('click', () => { input.value = b.dataset.q; draw(); input.focus(); }));
    draw();
  });

  // 데모 ② AI 상담원 대화 — 화면에 들어오면 한 줄씩, 끝나면 잠시 쉬고 다시
  $$('.chat').forEach(chat => {
    if (reduce) return;
    chat.classList.add('play');
    const bubs = $$('.bub', chat);
    let timer = null, playing = false;
    const play = () => {
      if (playing) return; playing = true;
      bubs.forEach(b => b.classList.remove('show'));
      let i = 0;
      const next = () => {
        if (i < bubs.length) { bubs[i++].classList.add('show'); timer = setTimeout(next, i === 1 ? 500 : 1300); }
        else timer = setTimeout(() => { playing = false; play(); }, 4500);
      };
      next();
    };
    new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) play(); else { clearTimeout(timer); playing = false; }
    }), { threshold: .4 }).observe(chat);
  });

  // 데모 ③ 전화 한 통의 길 — 움직임 줄이기면 멈춘다(SVG 애니메이션은 CSS 로 못 멈춘다)
  if (reduce) $$('.flow svg').forEach(s => s.pauseAnimations && s.pauseAnimations());

  // 지금 어느 구획인지 — 왼쪽 작은 줄
  const rail = document.querySelector('.rail');
  if (rail) {
    const secs = $$('[data-rail]');
    rail.innerHTML = secs.map(s => `<a href="#${s.id}"><i></i><span>${s.dataset.rail}</span></a>`).join('');
    const links = $$('a', rail);
    const ro = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const k = secs.indexOf(e.target);
      links.forEach((a, i) => a.classList.toggle('on', i === k));
      // 어두운 구획(첫 화면 카드·일하는 방식 띠) 위에선 흰 여백과 어두운 카드에 반씩 걸쳐 보기 흉해서 잠시 숨긴다
      rail.classList.toggle('hide', e.target.classList.contains('dark-band') || e.target.classList.contains('hero-l'));
    }), { rootMargin: '-50% 0px -50% 0px' });
    secs.forEach(s => ro.observe(s));
  }
})();
