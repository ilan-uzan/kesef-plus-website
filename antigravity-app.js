/* ============================================================
   KESEF PLUS — ANTIGRAVITY INTERACTIVITY
   Glow orb, scroll reveals, typewriter, early access & feedback
   ============================================================ */

const SUPABASE_URL = 'https://toilypsnifoieoidgjos.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRvaWx5cHNuaWZvaWVvaWRnam9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4MzU2NDQsImV4cCI6MjA4ODQxMTY0NH0.VsyCs8EtatvUCDBk3CYXTGpnyegn-GDENzKx0Ocp69I';

document.addEventListener('DOMContentLoaded', () => {

  // ─── 1. INTERACTIVE GLOW ORB ──────────────────────────────
  const orb = document.getElementById('glow-orb');
  if (orb) {
    let mx = window.innerWidth / 2, my = window.innerHeight / 2, ox = mx, oy = my;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function tick() {
      ox += (mx - ox) * 0.05;
      oy += (my - oy) * 0.05;
      orb.style.transform = `translate(calc(-50% + ${ox}px), calc(-50% + ${oy}px))`;
      requestAnimationFrame(tick);
    })();
  }

  // ─── 2. SCROLL REVEALS ────────────────────────────────────
  const reveals = document.querySelectorAll('.reveal');
  function checkReveals() {
    const wh = window.innerHeight;
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top < wh - 80) el.classList.add('active');
    });
  }
  checkReveals();
  window.addEventListener('scroll', checkReveals, { passive: true });

  // ─── 3. TYPEWRITER EFFECT ─────────────────────────────────
  document.querySelectorAll('[data-typewriter]').forEach(el => {
    const text = el.getAttribute('data-typewriter');
    const speed = parseInt(el.getAttribute('data-speed') || '50');
    const delay = parseInt(el.getAttribute('data-delay') || '800');
    el.textContent = '';
    el.style.visibility = 'visible';
    
    setTimeout(() => {
      let i = 0;
      const cursor = document.createElement('span');
      cursor.className = 'ag-cursor';
      cursor.textContent = '|';
      cursor.style.cssText = 'animation: blink 0.7s step-end infinite; color: rgba(255,255,255,0.5); font-weight: 300;';
      el.appendChild(cursor);
      
      function type() {
        if (i < text.length) {
          cursor.before(text.charAt(i));
          i++;
          setTimeout(type, speed);
        } else {
          setTimeout(() => cursor.remove(), 2000);
        }
      }
      type();
    }, delay);
  });

  // ─── 4. EARLY ACCESS FORM ─────────────────────────────────
  document.querySelectorAll('[data-early-access]').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const btn = form.querySelector('button');
      const success = form.querySelector('.ag-form-success');
      const error = form.querySelector('.ag-form-error');
      const product = form.getAttribute('data-early-access');
      
      if (!emailInput || !emailInput.value.trim()) return;
      
      // Basic email validation
      const email = emailInput.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        if (error) { error.textContent = 'Please enter a valid email.'; error.classList.add('visible'); }
        return;
      }
      
      // UI: loading
      const origText = btn.textContent;
      btn.textContent = 'Signing up...';
      btn.disabled = true;
      if (error) error.classList.remove('visible');
      
      try {
        const res = await fetch(`${SUPABASE_URL}/rest/v1/early_access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify({ email, product })
        });
        
        if (res.ok || res.status === 201) {
          emailInput.value = '';
          if (success) success.classList.add('visible');
          btn.textContent = 'You\'re in ✓';
          setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 4000);
        } else if (res.status === 409) {
          // Duplicate — already signed up
          if (success) { success.textContent = 'You\'re already on the list!'; success.classList.add('visible'); }
          btn.textContent = origText;
          btn.disabled = false;
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        console.error('Early access error:', err);
        if (error) { error.textContent = 'Something went wrong. Please try again.'; error.classList.add('visible'); }
        btn.textContent = origText;
        btn.disabled = false;
      }
    });
  });

  // ─── 5. FEEDBACK FORM ─────────────────────────────────────
  const feedbackForm = document.getElementById('feedback-form');
  if (feedbackForm) {
    feedbackForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const product = feedbackForm.querySelector('[name="product"]').value;
      const category = feedbackForm.querySelector('[name="category"]').value;
      const message = feedbackForm.querySelector('[name="message"]').value.trim();
      const emailEl = feedbackForm.querySelector('[name="email"]');
      const email = emailEl ? emailEl.value.trim() : null;
      const btn = feedbackForm.querySelector('button[type="submit"]');
      const success = feedbackForm.querySelector('.ag-form-success');
      const error = feedbackForm.querySelector('.ag-form-error');
      
      if (!message) {
        if (error) { error.textContent = 'Please enter your feedback.'; error.classList.add('visible'); }
        return;
      }
      
      const origText = btn.textContent;
      btn.textContent = 'Submitting...';
      btn.disabled = true;
      if (error) error.classList.remove('visible');
      
      try {
        const body = { product, category, message };
        if (email) body.email = email;
        
        const res = await fetch(`${SUPABASE_URL}/rest/v1/website_feedback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=minimal'
          },
          body: JSON.stringify(body)
        });
        
        if (res.ok || res.status === 201) {
          feedbackForm.reset();
          if (success) success.classList.add('visible');
          btn.textContent = 'Sent ✓';
          setTimeout(() => { btn.textContent = origText; btn.disabled = false; }, 4000);
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        console.error('Feedback error:', err);
        if (error) { error.textContent = 'Something went wrong. Please try again.'; error.classList.add('visible'); }
        btn.textContent = origText;
        btn.disabled = false;
      }
    });
  }
});
