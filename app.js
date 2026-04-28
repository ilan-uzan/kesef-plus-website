/* ============================================================
   KESEF STUDIO — app.js
   Sticky nav, scroll reveal, swipe demo, sprint timer,
   waitlist form logic
   ============================================================ */

'use strict';

/* ─── THEME TOGGLE (Light/Dark) ──────────────────────────────── */
const THEME_KEY = 'kesef_theme';
const htmlElement = document.documentElement;

// Initialize theme from storage or system preference
const savedTheme = localStorage.getItem(THEME_KEY);
if (savedTheme) {
  htmlElement.setAttribute('data-theme', savedTheme);
}

function toggleTheme() {
  const currentTheme = htmlElement.getAttribute('data-theme');
  let newTheme = 'light';
  
  if (currentTheme === 'light') {
    newTheme = 'dark';
  } else if (currentTheme === 'dark') {
    newTheme = 'light';
  } else {
    // Determine based on system preference if no explicit attribute is set yet
    const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    newTheme = systemPrefersDark ? 'light' : 'dark';
  }
  
  htmlElement.setAttribute('data-theme', newTheme);
  localStorage.setItem(THEME_KEY, newTheme);
}

document.addEventListener('DOMContentLoaded', () => {
  const themeBtn = document.getElementById('theme-toggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', toggleTheme);
  }
});

/* ─── NAV: scroll state ─────────────────────────────────────── */
const nav = document.getElementById('main-nav');
const onScroll = () => {
  nav?.classList.toggle('scrolled', window.scrollY > 20);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ─── SMOOTH SCROLL for nav links ──────────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

/* ─── SCROLL REVEAL ─────────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal-card').forEach(el => revealObserver.observe(el));

/* ─── SWIPE DECK DEMO ───────────────────────────────────────── */
const profiles = [
  { name: 'Priya Raghavan', role: 'Growth & Marketing · Series A veteran', skills: ['Growth','B2B SaaS'], avatar: 'assets/avatar-priya.png' },
  { name: 'James Kim',      role: 'Full-Stack Engineer · Ex-FAANG',         skills: ['React','iOS'],      avatar: 'assets/avatar-james.png' },
  { name: 'Sara Lopez',     role: 'Product Designer · Fintech focus',       skills: ['Figma','UX'],       avatar: 'assets/avatar-sara.png' },
  { name: 'Daniel Wu',      role: 'ML Engineer · Computer vision',          skills: ['Python','PyTorch'],  avatar: 'assets/avatar-daniel.png' },
  { name: 'Lena Müller',    role: 'Business Dev · EU markets',              skills: ['Sales','BD'],        avatar: 'assets/avatar-lena.png' },
];

let deckIdx = 0;

function buildSwipeCard(p) {
  return `
    <img class="sc-ava-img" src="${p.avatar}" alt="${p.name}" />
    <div class="sc-info">
      <strong>${p.name}</strong>
      <span>${p.role}</span>
      <div class="sc-skills">
        ${p.skills.map(s => `<span class="chip chip-sm">${s}</span>`).join('')}
      </div>
    </div>`;
}

function animateSwipe(direction) {
  const c1 = document.getElementById('swipe-card-1');
  const c2 = document.getElementById('swipe-card-2');
  const c3 = document.getElementById('swipe-card-3');
  if (!c1) return;

  c1.classList.add(direction === 'left' ? 'swiping-left' : 'swiping-right');

  setTimeout(() => {
    deckIdx = (deckIdx + 1) % profiles.length;
    c1.classList.remove('swiping-left', 'swiping-right');
    c1.innerHTML = buildSwipeCard(profiles[deckIdx]);

    // Advance others
    const next2 = profiles[(deckIdx + 1) % profiles.length];
    const next3 = profiles[(deckIdx + 2) % profiles.length];
    if (c2) c2.innerHTML = buildSwipeCard(next2);
    if (c3) c3.innerHTML = buildSwipeCard(next3);
  }, 360);
}

document.getElementById('demo-pass')?.addEventListener('click', () => animateSwipe('left'));
document.getElementById('demo-connect')?.addEventListener('click', () => animateSwipe('right'));

// Keyboard swipe for accessibility
document.getElementById('swipe-stack')?.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  animateSwipe('left');
  if (e.key === 'ArrowRight') animateSwipe('right');
});

/* ─── SPRINT COUNTDOWN TIMER ────────────────────────────────── */
const timerEl = document.getElementById('sprint-timer');
if (timerEl) {
  // Target: next Sunday midnight UTC
  const now = new Date();
  const nextSunday = new Date(now);
  nextSunday.setDate(now.getDate() + (7 - now.getDay()));
  nextSunday.setHours(0, 0, 0, 0);

  function updateTimer() {
    const diff = Math.max(0, nextSunday - Date.now());
    const h = Math.floor(diff / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    const s = Math.floor((diff % 60000) / 1000);
    timerEl.textContent = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }
  updateTimer();
  setInterval(updateTimer, 1000);
}

/* ─── STEVE TYPING LOOP (performance-optimized) ────────────── */
const steveFollowups = [
  "What does your onboarding look like for those who stayed?",
  "Have you talked to the churned users? That data is gold.",
  "Focus on activation, not features. What's your 'aha moment'?",
  "What metric best captures value delivered to your user?",
];
let steveIdx = 0;
const steverMessages = document.getElementById('steve-messages');
const MAX_STEVE_MSGS = 8; // Cap to prevent infinite DOM growth
let steveInterval = null;

function addSteveMessage() {
  if (!steverMessages) return;
  const typing = steverMessages.querySelector('.typing');
  if (typing) typing.remove();

  const newMsg = document.createElement('div');
  newMsg.className = 'msg msg-steve steve-msg-new';
  newMsg.textContent = steveFollowups[steveIdx % steveFollowups.length];
  steverMessages.appendChild(newMsg);

  // Remove old messages to cap DOM size
  const allMsgs = steverMessages.querySelectorAll('.msg');
  if (allMsgs.length > MAX_STEVE_MSGS) {
    allMsgs[0].remove();
  }

  steverMessages.scrollTop = steverMessages.scrollHeight;
  steveIdx++;

  // Add typing indicator again after a delay
  setTimeout(() => {
    if (!steverMessages) return;
    const t = document.createElement('div');
    t.className = 'msg msg-steve typing';
    t.innerHTML = '<span></span><span></span><span></span>';
    steverMessages.appendChild(t);
    steverMessages.scrollTop = steverMessages.scrollHeight;
  }, 2400);
}

// Only run the Steve loop when section is visible
const steveSection = document.getElementById('steve');
if (steveSection && steverMessages) {
  const steveObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !steveInterval) {
        steveInterval = setInterval(addSteveMessage, 4500);
      } else if (!entry.isIntersecting && steveInterval) {
        clearInterval(steveInterval);
        steveInterval = null;
      }
    });
  }, { threshold: 0.1 });
  steveObserver.observe(steveSection);
}

/* ─── SUPABASE CLIENT ──────────────────────────────────────── */
const SUPABASE_URL = 'https://hrvihdmvrvdeeqfvjvvj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhydmloZG12cnZkZWVxZnZqdnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxOTE2MTUsImV4cCI6MjA5MDc2NzYxNX0.ebXUHhk8ZHaqDx9IXydFNXiNVaiHz5tLuXIMEylIqSY';

async function supabaseInsert(table, data) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal'
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Signup failed');
  }
  return { success: true };
}

/* ─── WAITLIST FORM ─────────────────────────────────────────── */
const form    = document.getElementById('waitlist-form');
const success = document.getElementById('waitlist-success');
const count   = document.getElementById('signup-count');

if (form) {
  form.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('wl-submit');

    const name  = document.getElementById('wl-name');
    const email = document.getElementById('wl-email');
    const role  = document.getElementById('wl-role');
    const stage = document.getElementById('wl-stage');
    const testflight = document.getElementById('wl-testflight');
    let valid = true;

    // Simple validation
    [name, email].forEach(el => el.classList.remove('error'));
    if (!name.value.trim()) { name.classList.add('error'); valid = false; }
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { email.classList.add('error'); valid = false; }

    if (!valid) {
      form.classList.add('form-shake');
      setTimeout(() => form.classList.remove('form-shake'), 500);
      return;
    }

    btn.textContent = 'Reserving…';
    btn.disabled = true;

    try {
      await supabaseInsert('waitlist_leads', {
        name: name.value.trim(),
        email: email.value.trim().toLowerCase(),
        role: role.value || null,
        stage: stage.value || null,
        testflight: testflight?.checked || false
      });

      form.hidden = true;
      success.hidden = false;
      success.classList.add('success-pop');
      if (count) count.textContent = Math.floor(240 + Math.random() * 30);
      launchConfetti();
    } catch (err) {
      // Handle duplicate email
      if (err.message && err.message.includes('duplicate')) {
        btn.textContent = 'Already registered!';
        setTimeout(() => {
          btn.textContent = 'Reserve My Spot';
          btn.disabled = false;
        }, 2500);
      } else {
        btn.textContent = 'Reserve My Spot';
        btn.disabled = false;
        console.error('Waitlist error:', err);
      }
    }
  });
}

/* ─── CONFETTI ──────────────────────────────────────────────── */
const CONFETTI_COLORS = ['#0071e3','#34aadc','#30d158','#ff9f0a','#ff3b30','#fff'];

function launchConfetti() {
  for (let i = 0; i < 64; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}vw;
      background: ${CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]};
      animation-duration: ${1.8 + Math.random() * 1.4}s;
      animation-delay: ${Math.random() * 0.6}s;
      width: ${6 + Math.random() * 6}px;
      height: ${10 + Math.random() * 10}px;
      border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
    `;
    document.body.appendChild(el);
    el.addEventListener('animationend', () => el.remove());
  }
}

/* ─── iMAC CAROUSEL ─────────────────────────────────────────── */
const imacCarousel = document.getElementById('imac-carousel');
const imacDots = document.getElementById('imac-dots');

if (imacCarousel && imacDots) {
  const slides = imacCarousel.querySelectorAll('.imac-slide');
  const dots = imacDots.querySelectorAll('.imac-dot');
  let currentSlide = 0;
  let carouselInterval;

  function goToSlide(idx) {
    slides.forEach(s => s.classList.remove('imac-slide-active'));
    dots.forEach(d => d.classList.remove('imac-dot-active'));
    const target = slides[idx];
    target.classList.add('imac-slide-active');
    // Force animation replay
    target.style.animation = 'none';
    target.offsetHeight; // trigger reflow
    target.style.animation = '';
    dots[idx].classList.add('imac-dot-active');
    currentSlide = idx;
  }

  function nextSlide() {
    goToSlide((currentSlide + 1) % slides.length);
  }

  // Auto-advance every 4 seconds
  function startAutoplay() {
    carouselInterval = setInterval(nextSlide, 4000);
  }
  startAutoplay();

  // Dot clicks
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      clearInterval(carouselInterval);
      goToSlide(Number(dot.dataset.dot));
      startAutoplay();
    });
  });
}
