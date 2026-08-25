/* ─────────────────────────────────────────────────────────────
   Photo lightbox for A Vyza Ventures story pages
   Ported from the removed homepage modal's initPhotoLightbox().
   Self-contained: injects its own CSS + overlay HTML on load,
   then wires click-to-zoom on every .jp-media img (not video, not reel).
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
})();
