/* ─────────────────────────────────────────────────────────────
   Story-page enhancements for A Vyza Ventures
   (all kept in lightbox.js so story pages only need one script tag).

   Three features, all ported from the removed homepage modal:
     1. Photo lightbox — click any inline .jp-media img to zoom.
     2. Signoff reveal — sparkle stars + kiss stamp animation
        triggered when the .jp-signoff scrolls into view.
     3. Video controls — mute/unmute + play/pause + restart-on-first-
        unmute for .jp-reel and .jp-gif-reel videos (audio you tap
        to hear on biking/festival/etc. clips).

   Self-contained: injects its own CSS + lightbox overlay HTML +
   sparkle spans + video control buttons on load. Just link:
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

  // ─────────────────────────────────────────────────────────────
  // Video controls — mute/unmute + play/pause + restart-on-unmute
  // Ported from the removed homepage modal's initJournalVideos().
  //
  // Two flavors of video wrapper, both handled here:
  //   .jp-reel     — larger reels with a fullscreen expand button
  //                  and a volume icon that already exists in the DOM
  //   .jp-gif-reel — smaller GIF-style loops that get a sound button
  //                  injected next to them (banos biking, tomorrowland
  //                  festival, yacht-week Day 6, etc.)
  //
  // Both share the same UX contract: the loop autoplays muted; on the
  // FIRST tap of the sound button, the clip restarts from 0 so the
  // audio makes sense from the start of the story. Subsequent taps
  // just toggle mute in place.
  // ─────────────────────────────────────────────────────────────
  var SVG_MUTED = '<svg viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>';
  var SVG_UNMUTED = '<svg viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>';
  var SVG_PLAY = '<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>';
  var SVG_EXPAND = '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>';

  function wireReel(wrap) {
    if (wrap.dataset.reelWired === '1') return;
    wrap.dataset.reelWired = '1';
    var video = wrap.querySelector('video');
    if (!video) return;

    var ppOverlay = document.createElement('div');
    ppOverlay.className = 'jp-reel-playpause';
    ppOverlay.innerHTML = SVG_PLAY;
    wrap.appendChild(ppOverlay);

    var expandBtn = document.createElement('div');
    expandBtn.className = 'jp-reel-expand';
    expandBtn.title = 'Fullscreen';
    expandBtn.innerHTML = SVG_EXPAND;
    wrap.appendChild(expandBtn);

    var hint = document.createElement('div');
    hint.className = 'jp-reel-muted-hint';
    hint.textContent = 'tap for sound';
    wrap.appendChild(hint);

    var hasUnmuted = false;
    var volIcon = wrap.querySelector('.jp-reel-icon');

    function updateVolIcon() {
      if (!volIcon) return;
      volIcon.innerHTML = video.muted ? SVG_MUTED : SVG_UNMUTED;
    }
    updateVolIcon();

    function unmute() {
      if (!hasUnmuted) { video.currentTime = 0; hasUnmuted = true; }
      video.muted = false;
      video.volume = 1.0;
      if (video.paused) video.play().catch(function(){});
      updateVolIcon();
      hint.style.opacity = '0';
      wrap.classList.remove('is-paused');
    }

    if (volIcon) {
      volIcon.addEventListener('click', function(e) {
        e.stopPropagation();
        if (video.muted) { unmute(); }
        else { video.muted = true; updateVolIcon(); hint.style.opacity = ''; }
      });
    }

    expandBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (video.requestFullscreen) video.requestFullscreen();
      else if (video.webkitRequestFullscreen) video.webkitRequestFullscreen();
      else if (video.mozRequestFullScreen) video.mozRequestFullScreen();
    });

    wrap.addEventListener('click', function(e) {
      if (e.target.closest('.jp-reel-icon') || e.target.closest('.jp-reel-expand')) return;
      e.preventDefault();
      if (video.muted) { unmute(); return; }
      if (video.paused) {
        video.play().catch(function(){});
        wrap.classList.remove('is-paused');
        wrap.classList.add('play-flash');
        setTimeout(function() { wrap.classList.remove('play-flash'); }, 400);
      } else {
        video.pause();
        wrap.classList.add('is-paused');
      }
    });

    video.addEventListener('pause', function() { wrap.classList.add('is-paused'); });
    video.addEventListener('play',  function() { wrap.classList.remove('is-paused'); });
  }

  function wireGifReel(wrap) {
    if (wrap.dataset.gifReelWired === '1') return;
    wrap.dataset.gifReelWired = '1';
    var video = wrap.querySelector('video');
    if (!video) return;

    var ppBtn = document.createElement('div');
    ppBtn.className = 'jp-reel-playpause';
    ppBtn.innerHTML = SVG_PLAY;
    wrap.appendChild(ppBtn);

    var sndBtn = document.createElement('button');
    sndBtn.className = 'jp-d4-sound-btn';
    sndBtn.setAttribute('type', 'button');
    sndBtn.setAttribute('aria-label', 'Toggle sound');
    sndBtn.innerHTML = SVG_MUTED;

    var hint = document.createElement('div');
    hint.className = 'jp-d4-hint';
    hint.textContent = 'tap for sound';

    function updateIcon() {
      sndBtn.innerHTML = video.muted ? SVG_MUTED : SVG_UNMUTED;
      hint.style.opacity = video.muted ? '1' : '0';
    }

    var hasUnmuted = false;
    sndBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      if (video.muted) {
        if (!hasUnmuted) { video.currentTime = 0; hasUnmuted = true; }
        video.muted = false;
        video.volume = 1.0;
        if (video.paused) video.play().catch(function(){});
        wrap.classList.remove('is-paused');
      } else {
        video.muted = true;
      }
      updateIcon();
    });

    wrap.addEventListener('click', function(e) {
      if (e.target.closest('.jp-d4-sound-btn')) return;
      e.preventDefault();
      if (video.paused) {
        video.play().catch(function(){});
        wrap.classList.remove('is-paused');
      } else {
        video.pause();
        wrap.classList.add('is-paused');
      }
    });

    video.addEventListener('pause', function() { wrap.classList.add('is-paused'); });
    video.addEventListener('play',  function() { wrap.classList.remove('is-paused'); });

    wrap.appendChild(sndBtn);
    wrap.appendChild(hint);
  }

  function initVideos() {
    document.querySelectorAll('.jp-reel').forEach(wireReel);
    document.querySelectorAll('.jp-gif-reel').forEach(wireGifReel);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVideos);
  } else {
    initVideos();
  }
})();
