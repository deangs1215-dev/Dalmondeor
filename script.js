const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  menuButton.setAttribute('aria-label', open ? 'Open navigation' : 'Close navigation');
  nav.classList.toggle('open', !open);
  document.body.classList.toggle('menu-open', !open);
});

nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  nav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  document.body.classList.remove('menu-open');
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1 });
document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

const phaseData = {
  foundation: { number: 'R–3', label: 'Foundation Phase • Grade R–3', title: 'Strong foundations,<br>joyfully built.', copy: 'Playful, structured learning develops early literacy, numeracy, confidence and positive classroom habits.', points: ['Language', 'Numbers', 'Life skills'], color: '#ff8d62', icons: ['ABC', '123', '✎'] },
  intermediate: { number: '4–6', label: 'Intermediate Phase • Grade 4–6', title: 'Curiosity becomes<br>independence.', copy: 'Learners deepen subject knowledge, practise critical thinking and take greater ownership of their learning.', points: ['Languages', 'Mathematics', 'Natural sciences'], color: '#56c7a9', icons: ['WHY?', '÷ ×', '⚗'] },
  senior: { number: '07', label: 'Senior Primary • Grade 7', title: 'Ready for the<br>next big step.', copy: 'Purposeful preparation for high school grows leadership, resilience, responsibility and academic confidence.', points: ['Leadership', 'Study skills', 'High-school readiness'], color: '#086fc2', icons: ['LEAD', '07', '★'] }
};

const phasePanel = document.querySelector('.phase-panel');
document.querySelectorAll('.phase-tab').forEach(tab => tab.addEventListener('click', () => {
  const data = phaseData[tab.dataset.phase];
  document.querySelectorAll('.phase-tab').forEach(item => { item.classList.remove('active'); item.setAttribute('aria-selected', 'false'); });
  tab.classList.add('active');
  tab.setAttribute('aria-selected', 'true');
  phasePanel.classList.add('switching');
  setTimeout(() => {
    const art = phasePanel.querySelector('.phase-art');
    art.style.background = data.color;
    art.querySelector('.phase-number').textContent = data.number;
    art.querySelectorAll('i').forEach((item, i) => item.textContent = data.icons[i]);
    phasePanel.querySelector('.phase-label').textContent = data.label;
    phasePanel.querySelector('h3').innerHTML = data.title;
    phasePanel.querySelector('.phase-content > p:not(.phase-label)').textContent = data.copy;
    phasePanel.querySelector('.phase-points').innerHTML = data.points.map(point => `<span>${point}</span>`).join('');
    phasePanel.classList.remove('switching');
  }, 180);
}));

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.count);
    const start = performance.now();
    const run = now => {
      const progress = Math.min((now - start) / 900, 1);
      entry.target.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))) + (target === 100 ? '+' : '');
      if (progress < 1) requestAnimationFrame(run);
    };
    requestAnimationFrame(run);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: .5 });
document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

const quotes = [...document.querySelectorAll('.quote')];
const dotsHost = document.querySelector('.quote-dots');
let quoteIndex = 0;
let quoteTimer;

quotes.forEach((_, index) => {
  const dot = document.createElement('button');
  dot.type = 'button';
  dot.setAttribute('aria-label', `Show message ${index + 1}`);
  dot.addEventListener('click', () => showQuote(index));
  dotsHost.appendChild(dot);
});

function showQuote(index) {
  quoteIndex = (index + quotes.length) % quotes.length;
  quotes.forEach((quote, i) => quote.classList.toggle('active', i === quoteIndex));
  [...dotsHost.children].forEach((dot, i) => dot.classList.toggle('active', i === quoteIndex));
  clearInterval(quoteTimer);
  quoteTimer = setInterval(() => showQuote(quoteIndex + 1), 6500);
}

document.querySelector('.carousel-prev')?.addEventListener('click', () => showQuote(quoteIndex - 1));
document.querySelector('.carousel-next')?.addEventListener('click', () => showQuote(quoteIndex + 1));
showQuote(0);

let progressQueued = false;
window.addEventListener('scroll', () => {
  if (progressQueued) return;
  progressQueued = true;
  requestAnimationFrame(() => {
    const max = document.documentElement.scrollHeight - innerHeight;
    document.querySelector('.scroll-progress').style.width = `${max > 0 ? scrollY / max * 100 : 0}%`;
    progressQueued = false;
  });
}, { passive: true });

document.querySelectorAll('details').forEach(item => item.addEventListener('toggle', () => {
  if (!item.open) return;
  const group = item.parentElement;
  [...group.children].filter(other => other.tagName === 'DETAILS' && other !== item).forEach(other => other.open = false);
}));

const sportsSlider = document.querySelector('.sports-slider');
const sportsSlides = [...document.querySelectorAll('.sports-slide')];
const sportsDots = [...document.querySelectorAll('.sports-dots button')];
const cultureSlides = [...document.querySelectorAll('.culture-slide:not(.leadership-slide)')];
const leadershipSlides = [...document.querySelectorAll('.leadership-slide')];
const activityKicker = document.getElementById('activity-kicker');
const activityTitle = document.getElementById('activity-title');
const activityTriggers = [...document.querySelectorAll('.activity-trigger')];
let sportsIndex = 0;
let cultureIndex = 0;
let leadershipIndex = 0;
let activitySequenceIndex = 0;
let activityTimer;
const activitySequence = [];
let cultureSequenceIndex = 0;
let leadershipSequenceIndex = 0;

// Keep the rhythm at two sports photos followed by one culture or leadership photo,
// while ensuring every sports image gets an equal turn in the rotation.
for (let group = 0; group < sportsSlides.length * 2; group += 1) {
  const firstSportsIndex = (group * 2) % sportsSlides.length;
  const interlude = group % 2 === 0
    ? { mode: 'culture', cultureIndex: cultureSequenceIndex++ % cultureSlides.length }
    : { mode: 'leadership', leadershipIndex: leadershipSequenceIndex++ % leadershipSlides.length };
  activitySequence.push(
    { mode: 'sports', sportsIndex: firstSportsIndex },
    { mode: 'sports', sportsIndex: (firstSportsIndex + 1) % sportsSlides.length },
    interlude
  );
}

function showSportsSlide(index) {
  sportsIndex = (index + sportsSlides.length) % sportsSlides.length;
  sportsSlides.forEach((slide, i) => slide.classList.toggle('active', i === sportsIndex));
  sportsDots.forEach((dot, i) => {
    dot.classList.toggle('active', i === sportsIndex);
    dot.setAttribute('aria-pressed', String(i === sportsIndex));
  });
}

function highlightActivity(mode) {
  activityTriggers.forEach(trigger => {
    const selected = trigger.dataset.activityMode === mode;
    trigger.classList.toggle('is-active', selected);
    trigger.setAttribute('aria-pressed', String(selected));
  });
}

function showActivityMode(mode, selectedSportsIndex = sportsIndex, selectedLeadershipIndex = leadershipIndex, selectedCultureIndex = cultureIndex) {
  const showCulture = mode === 'culture';
  const showLeadership = mode === 'leadership';
  const showSports = mode === 'sports';
  sportsSlider?.classList.toggle('culture-mode', !showSports);
  if (showCulture && cultureSlides.length) {
    cultureIndex = (selectedCultureIndex + cultureSlides.length) % cultureSlides.length;
  }
  cultureSlides.forEach((slide, index) => slide.classList.toggle('active', showCulture && index === cultureIndex));
  if (showLeadership && leadershipSlides.length) {
    leadershipIndex = (selectedLeadershipIndex + leadershipSlides.length) % leadershipSlides.length;
  }
  leadershipSlides.forEach((slide, index) => slide.classList.toggle('active', showLeadership && index === leadershipIndex));
  highlightActivity(mode);

  if (!showSports) {
    sportsSlides.forEach(slide => slide.classList.remove('active'));
    if (activityKicker) activityKicker.textContent = showCulture ? 'Sing together' : 'Lead together';
    if (activityTitle) activityTitle.textContent = showCulture ? 'Music & culture' : 'Service & leadership';
    return;
  }

  if (activityKicker) activityKicker.textContent = 'Move together';
  if (activityTitle) activityTitle.textContent = 'Sports';
  showSportsSlide(selectedSportsIndex);
}

function showActivitySequenceStep(index) {
  activitySequenceIndex = (index + activitySequence.length) % activitySequence.length;
  const step = activitySequence[activitySequenceIndex];
  showActivityMode(step.mode, step.sportsIndex, step.leadershipIndex, step.cultureIndex);
}

function startActivityRotation() {
  clearInterval(activityTimer);
  activityTimer = setInterval(() => showActivitySequenceStep(activitySequenceIndex + 1), 4000);
}

sportsDots.forEach((dot, index) => dot.addEventListener('click', () => {
  const matchingStep = activitySequence.findIndex(step => step.mode === 'sports' && step.sportsIndex === index);
  if (matchingStep >= 0) activitySequenceIndex = matchingStep;
  showActivityMode('sports', index);
  startActivityRotation();
}));
sportsSlider?.addEventListener('mouseenter', () => clearInterval(activityTimer));
sportsSlider?.addEventListener('mouseleave', startActivityRotation);
sportsSlider?.addEventListener('focusin', () => clearInterval(activityTimer));
sportsSlider?.addEventListener('focusout', startActivityRotation);
activityTriggers.forEach(trigger => {
  const mode = trigger.dataset.activityMode;
  const showSelectedMode = () => {
    clearInterval(activityTimer);
    showActivityMode(mode);
  };
  trigger.addEventListener('mouseenter', showSelectedMode);
  trigger.addEventListener('focusin', showSelectedMode);
  trigger.addEventListener('mouseleave', startActivityRotation);
  trigger.addEventListener('focusout', startActivityRotation);
});
showActivitySequenceStep(0);
startActivityRotation();

document.getElementById('year').textContent = new Date().getFullYear();
