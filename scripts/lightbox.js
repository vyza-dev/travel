/* ─────────────────────────────────────────────────────────────
   Story-page enhancements for A Vyza Ventures
   (kept in lightbox.js to avoid a second script tag per page).

   Two features, both ported from the removed homepage modal:
     1. Photo lightbox — click any inline .jp-media img to zoom.
     2. Signoff reveal — sparkle stars + kiss stamp animation
        triggered when the .jp-signoff scrolls into view.

   Self-contained: injects its own CSS + lightbox overlay HTML +
   sparkle-star spans on load. Just link this from any story page:
     <script src="/scripts/lightbox.js" defer></script>
   ───────────────────────────────────────────────────────────── */
(function() {
  'use strict';

  // ── CSS: injected once into <head> ──
  var css = ''
    + '.jp-lightbox{position:fixed;inset:0;background:rgba(20,12,6,0.88);'
    + 'backdrop-filter:blur(8px);-webkit-backdrop-filter:blur(8px);'
    + 'z-index:9999;display:flex;align-items:center;justify-content:center;'
    + 'opacity:0;visibility:hidden;transition:opacity 0.3s ease,visibility 0s linear 0.3s;'
    + 'cursor:zoom-out;padding:24px;}'
    + '.jp-lightbox.is-open{opacity:1;visibility:visible;'
    + 'transition:opacity 0.3s ease,visibility 0s linear 0s;}'
    + '.jp-lightbox-img{max-width:min(92vw,1400px);max-height:88vh;'
    + 'object-fit:contain;box-shadow:0 30px 80px rgba(0,0,0,0.6);'
    + 'border:8px solid #fff;background:#fff;'
    + 'transform:scale(0.94);transition:transform 0.3s ease;}'
    + '.jp-lightbox.is-open .jp-lightbox-img{transform:scale(1);}'
    + '.jp-lightbox-close{position:absolute;top:24px;right:28px;'
    + 'width:44px;height:44px;border-radius:50%;background:rgba(255,255,255,0.15);'
    + 'border:1px solid rgba(255,255,255,0.25);color:#fff;font-size:26px;'
    + 'cursor:pointer;display:flex;align-items:center;justify-content:center;'
    + 'transition:background 0.2s,transform 0.2s;padding:0;line-height:1;}'
    + '.jp-lightbox-close:hover{background:rgba(255,255,255,0.25);transform:scale(1.08);}';

  var style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  // ── HTML: inject the lightbox overlay at end of body ──
  var lb = document.createElement('div');
  lb.className = 'jp-lightbox';
  lb.setAttribute('role', 'dialog');
  lb.setAttribute('aria-modal', 'true');
  lb.setAttribute('aria-label', 'Photo viewer');
  lb.innerHTML = '<button class="jp-lightbox-close" aria-label="Close">×</button>'
               + '<img class="jp-lightbox-img" src="" alt="">';
  document.body.appendChild(lb);

  var lbImg = lb.querySelector('.jp-lightbox-img');
  var lbClose = lb.querySelector('.jp-lightbox-close');

  // ── Wire click-to-zoom on every .jp-media img ──
  // Skip videos and any .jp-reel media (those are decorative loops)
  function wireImages() {
    document.querySelectorAll('.jp-media img').forEach(function(img) {
      var parent = img.closest('.jp-media');
      if (!parent || parent.classList.contains('jp-reel')) return;
      if (parent.dataset.lightboxWired === '1') return; // idempotent
      parent.dataset.lightboxWired = '1';
      parent.style.cursor = 'zoom-in';
      parent.addEventListener('click', function() {
        lbImg.src = img.src;
        lbImg.alt = img.alt || '';
        lb.classList.add('is-open');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  function closeLB() {
    lb.classList.remove('is-open');
    document.body.style.overflow = '';
    // Clear src after transition so a stale image never flashes on next open
    setTimeout(function() { lbImg.src = ''; }, 300);
  }

  lbClose.addEventListener('click', closeLB);
  // Click on the dim backdrop (not on the image itself) closes
  lb.addEventListener('click', function(e) {
    if (e.target === lb) closeLB();
  });
  // ESC to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lb.classList.contains('is-open')) closeLB();
  });

  // Initial wire-up (in case script loads after DOM ready) + safety on DOM-ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireImages);
  } else {
    wireImages();
  }

  // ─────────────────────────────────────────────────────────────
  // Signoff reveal — kiss + sparkle stars + name animation
  // Ported from the removed homepage modal's initSignoffReveal().
  // .jp-kiss starts at opacity:0 in the base CSS; the animation
  // (kiss stamps down, stars scatter, name signs) is triggered by
  // adding .is-signed to the .jp-signoff parent when it scrolls
  // into view.
  // ─────────────────────────────────────────────────────────────
  function initSignoff() {
    var signoffs = document.querySelectorAll('.jp-signoff');
    if (!signoffs.length) return;

    // Inject 6 sparkle stars into each .jp-kiss-wrap (CSS positions and
    // animates them absolutely; without these spans there are no stars).
    signoffs.forEach(function(signoff) {
      var kissWrap = signoff.querySelector('.jp-kiss-wrap');
      if (!kissWrap || kissWrap.dataset.starsInjected === '1') return;
      kissWrap.dataset.starsInjected = '1';
      ['jp-star-1','jp-star-2','jp-star-3','jp-star-4','jp-star-5','jp-star-6'].forEach(function(cls) {
        var star = document.createElement('span');
        star.className = 'jp-star ' + cls;
        star.textContent = '✦'; // ✦
        kissWrap.appendChild(star);
      });
    });

    // Reveal on scroll into view; re-trigger if user scrolls back up
    // and then down again (matches homepage behavior).
    var obs = new IntersectionObserver(function(entries) {
      entries.forEach(function(e) {
        if (e.isIntersecting) {
          e.target.classList.remove('is-signed');
          void e.target.offsetWidth; // force reflow so animation restarts
          e.target.classList.add('is-signed');
        } else {
          e.target.classList.remove('is-signed');
        }
      });
    }, { threshold: 0.25 });
    signoffs.forEach(function(el) { obs.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSignoff);
  } else {
    initSignoff();
  }
})();
