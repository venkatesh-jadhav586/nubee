/* ══════════════════════════════════════════
   NubeeNest — script.js
   All interactivity: nav, age filter, reveal,
   memory match, colour match, count & pick,
   balloon pop
══════════════════════════════════════════ */

/* ── Nav Toggle ── */
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('main-nav');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  navToggle.classList.toggle('open', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
});

mainNav.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', false);
    document.body.style.overflow = '';
  });
});

/* ── Age Filter ── */
document.querySelectorAll('.age-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.age-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const age = btn.dataset.age;
    document.querySelectorAll('.product-card').forEach(card => {
      card.classList.toggle('hidden', age !== 'all' && card.dataset.age !== age);
    });
  });
});

/* ── Scroll Reveal ── */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const siblings = [...entry.target.parentElement.querySelectorAll('.reveal')];
    entry.target.style.transitionDelay = (siblings.indexOf(entry.target) * 0.1) + 's';
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.06 });
revealEls.forEach(el => revealObserver.observe(el));

/* ════════════════════════════════
   GAME 1 — MEMORY MATCH
════════════════════════════════ */
const memEmojis = ['🧱','🧩','🚗','🎈','⭐','🌈','🦁','🐸'];
let memCards = [], memFlipped = [], memMatched = 0, memMoves = 0, memLock = false;

function initMemory() {
  const pairs = [...memEmojis, ...memEmojis].sort(() => Math.random() - 0.5);
  memCards = []; memFlipped = []; memMatched = 0; memMoves = 0; memLock = false;
  document.getElementById('mem-moves').textContent = 0;
  document.getElementById('mem-pairs').textContent  = 0;
  const grid = document.getElementById('memGrid');
  grid.innerHTML = '';
  pairs.forEach((em, i) => {
    const btn = document.createElement('button');
    btn.className = 'mem-card';
    btn.dataset.emoji = em;
    btn.dataset.idx   = i;
    btn.textContent   = '';
    btn.setAttribute('aria-label', 'card');
    btn.addEventListener('click', () => flipMem(btn));
    grid.appendChild(btn);
    memCards.push(btn);
  });
}

function flipMem(card) {
  if (memLock || card.classList.contains('flipped') || card.classList.contains('matched')) return;
  card.classList.add('flipped');
  card.textContent = card.dataset.emoji;
  memFlipped.push(card);
  if (memFlipped.length === 2) {
    memLock = true;
    memMoves++;
    document.getElementById('mem-moves').textContent = memMoves;
    if (memFlipped[0].dataset.emoji === memFlipped[1].dataset.emoji) {
      memFlipped[0].classList.add('matched');
      memFlipped[1].classList.add('matched');
      memMatched++;
      document.getElementById('mem-pairs').textContent = memMatched;
      memFlipped = []; memLock = false;
      if (memMatched === 8) setTimeout(() => alert('🎉 You matched all pairs in ' + memMoves + ' moves!'), 200);
    } else {
      setTimeout(() => {
        memFlipped[0].classList.remove('flipped'); memFlipped[0].textContent = '';
        memFlipped[1].classList.remove('flipped'); memFlipped[1].textContent = '';
        memFlipped = []; memLock = false;
      }, 900);
    }
  }
}

initMemory();

/* ════════════════════════════════
   GAME 2 — COLOUR MATCH
════════════════════════════════ */
const colours = [
  { name:'RED',    hex:'#EF4444' },
  { name:'BLUE',   hex:'#3B82F6' },
  { name:'GREEN',  hex:'#22C55E' },
  { name:'PINK',   hex:'#EC4899' },
  { name:'ORANGE', hex:'#F97316' },
  { name:'PURPLE', hex:'#8B5CF6' },
  { name:'YELLOW', hex:'#EAB308' },
  { name:'TEAL',   hex:'#14B8A6' },
];
let colourScore = 0, colourBest = 0, colourCorrect = null, colourLocked = false;

function nextColour() {
  colourLocked = false;
  const word   = colours[Math.floor(Math.random() * colours.length)];
  const inkCol = colours[Math.floor(Math.random() * colours.length)];
  colourCorrect = inkCol.name;
  document.getElementById('colourWord').textContent = word.name;
  document.getElementById('colourWord').style.color = inkCol.hex;
  const pool = colours.filter(c => c.name !== inkCol.name).sort(() => Math.random() - 0.5).slice(0, 3);
  const opts = [inkCol, ...pool].sort(() => Math.random() - 0.5);
  const container = document.getElementById('colourOpts');
  container.innerHTML = '';
  opts.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'colour-opt';
    btn.style.background = c.hex;
    btn.textContent  = c.name;
    btn.dataset.name = c.name;
    btn.addEventListener('click', () => checkColour(btn));
    container.appendChild(btn);
  });
}

function checkColour(btn) {
  if (colourLocked) return;
  colourLocked = true;
  if (btn.dataset.name === colourCorrect) {
    btn.classList.add('correct');
    colourScore++;
    if (colourScore > colourBest) colourBest = colourScore;
    document.getElementById('colourScore').textContent = colourScore;
    document.getElementById('colourBest').textContent  = colourBest;
    setTimeout(nextColour, 700);
  } else {
    btn.classList.add('wrong');
    colourScore = 0;
    document.getElementById('colourScore').textContent = colourScore;
    setTimeout(nextColour, 900);
  }
}

nextColour();

/* ════════════════════════════════
   GAME 3 — COUNT & PICK
════════════════════════════════ */
const countItems = ['🌟','🍎','🐸','🚗','🧩','🎈','🦁','🌈'];
let countScore = 0, countLocked = false;

function nextCount() {
  countLocked = false;
  document.getElementById('countResult').textContent = '';
  const n  = Math.floor(Math.random() * 9) + 1;
  const em = countItems[Math.floor(Math.random() * countItems.length)];
  document.getElementById('countEmojis').textContent = em.repeat(n);
  document.getElementById('countQ').textContent = 'How many ' + em + ' are there?';
  const wrongs = new Set([n]);
  while (wrongs.size < 4) wrongs.add(Math.floor(Math.random() * 12) + 1);
  const container = document.getElementById('countOpts');
  container.innerHTML = '';
  [...wrongs].sort(() => Math.random() - 0.5).forEach(num => {
    const btn = document.createElement('button');
    btn.className   = 'count-opt';
    btn.textContent = num;
    btn.addEventListener('click', () => checkCount(btn, num, n));
    container.appendChild(btn);
  });
}

function checkCount(btn, chosen, correct) {
  if (countLocked) return;
  countLocked = true;
  const result = document.getElementById('countResult');
  if (chosen === correct) {
    btn.classList.add('correct');
    result.innerHTML  = '🎉 Correct! Great counting!';
    result.style.color = '#059669';
    countScore++;
    document.getElementById('countScore').textContent = countScore;
    setTimeout(nextCount, 1200);
  } else {
    btn.classList.add('wrong');
    result.innerHTML  = '❌ Oops! It was <strong>' + correct + '</strong>. Try again!';
    result.style.color = '#EF4444';
    countScore = Math.max(0, countScore - 1);
    document.getElementById('countScore').textContent = countScore;
    setTimeout(nextCount, 1400);
  }
}

nextCount();

/* ════════════════════════════════
   GAME 4 — BALLOON POP
════════════════════════════════ */
const balloonEmojis = ['🎈','🎀','⭐','🌟','💛','🧡','❤️','💜','💚','💙'];
let balloonPopped = 0, balloonCombo = 0, balloonTimers = [];

function initBalloons() {
  const area = document.getElementById('balloonArea');
  area.innerHTML    = '';
  balloonPopped     = 0;
  balloonCombo      = 0;
  balloonTimers.forEach(clearTimeout);
  balloonTimers     = [];
  document.getElementById('balloonCount').textContent = 0;
  document.getElementById('balloonCombo').style.display = 'none';
  spawnBalloons(6);
}

function spawnBalloons(n) {
  const area = document.getElementById('balloonArea');
  for (let i = 0; i < n; i++) {
    (delay => {
      const t = setTimeout(() => {
        const b   = document.createElement('button');
        b.className   = 'balloon';
        b.textContent = balloonEmojis[Math.floor(Math.random() * balloonEmojis.length)];
        const dur  = (3 + Math.random() * 4).toFixed(1);
        const left = (5 + Math.random() * 85).toFixed(0);
        b.style.left              = left + '%';
        b.style.animationDuration = dur + 's';
        b.style.animationDelay    = '0s';
        b.addEventListener('click', () => popBalloon(b));
        area.appendChild(b);
        const rem = setTimeout(() => {
          if (b.parentNode) {
            b.remove();
            balloonCombo = 0;
            document.getElementById('balloonCombo').style.display = 'none';
          }
        }, parseFloat(dur) * 1000 + 200);
        balloonTimers.push(rem);
      }, delay);
      balloonTimers.push(t);
    })(i * 400);
  }
  const loop = setTimeout(() => spawnBalloons(3), n * 400 + 1000);
  balloonTimers.push(loop);
}

function popBalloon(btn) {
  btn.style.transform = 'scale(1.6)';
  btn.style.opacity   = '0';
  setTimeout(() => { if (btn.parentNode) btn.remove(); }, 180);
  balloonPopped++;
  balloonCombo++;
  document.getElementById('balloonCount').textContent = balloonPopped;
  if (balloonCombo > 1) {
    document.getElementById('balloonCombo').style.display = 'inline-block';
    document.getElementById('comboNum').textContent       = balloonCombo;
  }
}

initBalloons();
