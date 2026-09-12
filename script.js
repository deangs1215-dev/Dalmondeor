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

const teamCarousel = document.querySelector('.team-carousel');
const teamStage = document.querySelector('.team-stage');
const teamCards = [...document.querySelectorAll('.team-card')];
const teamDots = [...document.querySelectorAll('.team-dots button')];
const teamPrev = document.querySelector('.team-prev');
const teamNext = document.querySelector('.team-next');
let teamIndex = 0;
let teamTimer;
let teamPointerStart = 0;
let teamInView = false;
let teamStarted = false;
const teamReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showTeamMember(index) {
  if (!teamCards.length) return;
  teamIndex = (index + teamCards.length) % teamCards.length;
  teamCards.forEach((card, cardIndex) => {
    const position = (cardIndex - teamIndex + teamCards.length) % teamCards.length;
    card.classList.toggle('is-active', position === 0);
    card.classList.toggle('is-next', position === 1);
    card.classList.toggle('is-prev', position === teamCards.length - 1);
    card.setAttribute('aria-current', String(position === 0));
  });
  teamDots.forEach((dot, dotIndex) => {
    const selected = dotIndex === teamIndex;
    dot.classList.toggle('is-active', selected);
    dot.setAttribute('aria-pressed', String(selected));
  });
}

function startTeamCarousel() {
  clearInterval(teamTimer);
  if (teamInView && !teamReducedMotion && teamCards.length > 1) {
    teamTimer = setInterval(() => showTeamMember(teamIndex + 1), 5000);
  }
}

function selectTeamMember(index) {
  showTeamMember(index);
  startTeamCarousel();
}

teamPrev?.addEventListener('click', () => selectTeamMember(teamIndex - 1));
teamNext?.addEventListener('click', () => selectTeamMember(teamIndex + 1));
teamDots.forEach((dot, index) => dot.addEventListener('click', () => selectTeamMember(index)));
teamCards.forEach((card, index) => {
  card.addEventListener('click', () => {
    if (index !== teamIndex) selectTeamMember(index);
  });
  card.addEventListener('keydown', event => {
    if ((event.key === 'Enter' || event.key === ' ') && index !== teamIndex) {
      event.preventDefault();
      selectTeamMember(index);
    }
  });
});
teamCarousel?.addEventListener('mouseenter', () => clearInterval(teamTimer));
teamCarousel?.addEventListener('mouseleave', startTeamCarousel);
teamCarousel?.addEventListener('focusin', () => clearInterval(teamTimer));
teamCarousel?.addEventListener('focusout', event => {
  if (!teamCarousel.contains(event.relatedTarget)) startTeamCarousel();
});
teamStage?.addEventListener('pointerdown', event => {
  teamPointerStart = event.clientX;
});
teamStage?.addEventListener('pointerup', event => {
  const distance = event.clientX - teamPointerStart;
  if (Math.abs(distance) > 45) selectTeamMember(teamIndex + (distance < 0 ? 1 : -1));
});
showTeamMember(0);
if (teamCarousel) {
  const teamObserver = new IntersectionObserver(entries => {
    teamInView = entries[0].isIntersecting;
    if (teamInView) {
      if (!teamStarted) {
        showTeamMember(0);
        teamStarted = true;
      }
      startTeamCarousel();
    } else {
      clearInterval(teamTimer);
    }
  }, { threshold: .35 });
  teamObserver.observe(teamCarousel);
}

const campusVideo = document.querySelector('.campus-video-player');
const campusVideoFrame = document.querySelector('.campus-video-frame');
const campusSoundStart = document.querySelector('.campus-sound-start');

async function playCampusVideoWithSound() {
  if (!campusVideo) return;
  campusVideo.muted = false;
  campusVideo.defaultMuted = false;
  try {
    await campusVideo.play();
    campusVideoFrame?.classList.remove('needs-sound-start');
  } catch {
    campusVideoFrame?.classList.add('needs-sound-start');
  }
}

if (campusVideo) {
  campusVideo.muted = false;
  campusVideo.defaultMuted = false;
  campusVideo.addEventListener('playing', () => campusVideoFrame?.classList.remove('needs-sound-start'));
  playCampusVideoWithSound();
}
campusSoundStart?.addEventListener('click', playCampusVideoWithSound);

const circleCarousel = document.querySelector('.circle-carousel');
const circleShowSlides = [...document.querySelectorAll('.circle-show-slide')];
const circleDots = [...document.querySelectorAll('.circle-dots button')];
const circleCount = document.querySelector('.circle-carousel-count strong');
const circlePrev = document.querySelector('.circle-prev');
const circleNext = document.querySelector('.circle-next');
let circleIndex = 0;
let circleTimer;
let circleInView = false;
let circleCleanupTimer;
const circleReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showCircleSlide(index) {
  if (!circleShowSlides.length) return;
  const nextIndex = (index + circleShowSlides.length) % circleShowSlides.length;
  if (nextIndex === circleIndex && circleShowSlides[nextIndex].classList.contains('is-active')) return;
  const outgoing = circleShowSlides[circleIndex];
  clearTimeout(circleCleanupTimer);
  outgoing?.classList.remove('is-active');
  outgoing?.classList.add('is-leaving');
  outgoing?.setAttribute('aria-hidden', 'true');
  circleIndex = nextIndex;
  const incoming = circleShowSlides[circleIndex];
  incoming.classList.remove('is-leaving');
  incoming.classList.add('is-active');
  incoming.setAttribute('aria-hidden', 'false');
  circleDots.forEach((dot, dotIndex) => {
    const selected = dotIndex === circleIndex;
    dot.classList.toggle('is-active', selected);
    dot.setAttribute('aria-pressed', String(selected));
  });
  if (circleCount) circleCount.textContent = String(circleIndex + 1).padStart(2, '0');
  circleCleanupTimer = setTimeout(() => outgoing?.classList.remove('is-leaving'), circleReducedMotion ? 0 : 1200);
}

function startCircleCarousel() {
  clearInterval(circleTimer);
  if (circleInView && !circleReducedMotion && circleShowSlides.length > 1) {
    circleTimer = setInterval(() => showCircleSlide(circleIndex + 1), 5000);
  }
}

function selectCircleSlide(index) {
  showCircleSlide(index);
  startCircleCarousel();
}

circlePrev?.addEventListener('click', () => selectCircleSlide(circleIndex - 1));
circleNext?.addEventListener('click', () => selectCircleSlide(circleIndex + 1));
circleDots.forEach((dot, index) => dot.addEventListener('click', () => selectCircleSlide(index)));
circleCarousel?.addEventListener('mouseenter', () => clearInterval(circleTimer));
circleCarousel?.addEventListener('mouseleave', startCircleCarousel);
circleCarousel?.addEventListener('focusin', () => clearInterval(circleTimer));
circleCarousel?.addEventListener('focusout', event => {
  if (!circleCarousel.contains(event.relatedTarget)) startCircleCarousel();
});
circleCarousel?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') selectCircleSlide(circleIndex - 1);
  if (event.key === 'ArrowRight') selectCircleSlide(circleIndex + 1);
});
if (circleCarousel) {
  const circleObserver = new IntersectionObserver(entries => {
    circleInView = entries[0].isIntersecting;
    if (circleInView) startCircleCarousel();
    else clearInterval(circleTimer);
  }, { threshold: .3 });
  circleObserver.observe(circleCarousel);
}

const aboutImageCarousel = document.querySelector('.about-image-carousel');
const aboutImageSlides = [...document.querySelectorAll('.about-image-slide')];
const aboutImageDots = [...document.querySelectorAll('.about-image-dots button')];
let aboutImageIndex = 0;
let aboutImageTimer;
let aboutImageInView = false;
let aboutImageCleanupTimer;
const aboutImageReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showAboutImage(index) {
  if (!aboutImageSlides.length) return;
  const nextIndex = (index + aboutImageSlides.length) % aboutImageSlides.length;
  if (nextIndex === aboutImageIndex && aboutImageSlides[nextIndex].classList.contains('is-active')) return;
  const outgoing = aboutImageSlides[aboutImageIndex];
  clearTimeout(aboutImageCleanupTimer);
  outgoing?.classList.remove('is-active');
  outgoing?.classList.add('is-leaving');
  outgoing?.setAttribute('aria-hidden', 'true');
  aboutImageIndex = nextIndex;
  const incoming = aboutImageSlides[aboutImageIndex];
  incoming.classList.remove('is-leaving');
  incoming.classList.add('is-active');
  incoming.setAttribute('aria-hidden', 'false');
  aboutImageDots.forEach((dot, dotIndex) => {
    const selected = dotIndex === aboutImageIndex;
    dot.classList.toggle('is-active', selected);
    dot.setAttribute('aria-pressed', String(selected));
  });
  aboutImageCleanupTimer = setTimeout(() => outgoing?.classList.remove('is-leaving'), aboutImageReducedMotion ? 0 : 1100);
}

function startAboutImageCarousel() {
  clearInterval(aboutImageTimer);
  if (aboutImageInView && !aboutImageReducedMotion && aboutImageSlides.length > 1) {
    aboutImageTimer = setInterval(() => showAboutImage(aboutImageIndex + 1), 4500);
  }
}

aboutImageDots.forEach((dot, index) => dot.addEventListener('click', () => {
  showAboutImage(index);
  startAboutImageCarousel();
}));
aboutImageCarousel?.addEventListener('mouseenter', () => clearInterval(aboutImageTimer));
aboutImageCarousel?.addEventListener('mouseleave', startAboutImageCarousel);
aboutImageCarousel?.addEventListener('focusin', () => clearInterval(aboutImageTimer));
aboutImageCarousel?.addEventListener('focusout', event => {
  if (!aboutImageCarousel.contains(event.relatedTarget)) startAboutImageCarousel();
});
aboutImageCarousel?.addEventListener('keydown', event => {
  if (event.key === 'ArrowLeft') showAboutImage(aboutImageIndex - 1);
  if (event.key === 'ArrowRight') showAboutImage(aboutImageIndex + 1);
});
if (aboutImageCarousel) {
  const aboutImageObserver = new IntersectionObserver(entries => {
    aboutImageInView = entries[0].isIntersecting;
    if (aboutImageInView) startAboutImageCarousel();
    else clearInterval(aboutImageTimer);
  }, { threshold: .35 });
  aboutImageObserver.observe(aboutImageCarousel);
}

const contactCards = [...document.querySelectorAll('.contact-card')];
const contactReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!contactReducedMotion) {
  contactCards.forEach(card => {
    card.addEventListener('pointermove', event => {
      const bounds = card.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      card.style.setProperty('--tilt-x', `${(0.5 - y) * 6}deg`);
      card.style.setProperty('--tilt-y', `${(x - 0.5) * 7}deg`);
      card.style.setProperty('--glow-x', `${x * 100}%`);
      card.style.setProperty('--glow-y', `${y * 100}%`);
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--tilt-x', '0deg');
      card.style.setProperty('--tilt-y', '0deg');
      card.style.setProperty('--glow-x', '50%');
      card.style.setProperty('--glow-y', '50%');
    });
  });
}

document.getElementById('year').textContent = new Date().getFullYear();
