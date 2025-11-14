// Simple accessible lightbox for images across the site
(function() {
  function createLightbox() {
    const overlay = document.createElement('div');
    overlay.id = 'lightbox-overlay';
    overlay.className = 'lightbox-overlay';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Image preview');

    const content = document.createElement('div');
    content.className = 'lightbox-content';

    const btn = document.createElement('button');
    btn.className = 'lightbox-close';
    btn.setAttribute('aria-label', 'Close');
    btn.innerHTML = '\u00D7';

    const img = document.createElement('img');
    img.alt = '';
    img.decoding = 'async';

    const cap = document.createElement('div');
    cap.className = 'lightbox-caption';

    content.appendChild(btn);
    content.appendChild(img);
    content.appendChild(cap);
    overlay.appendChild(content);

    function close() {
      overlay.classList.remove('open');
      overlay.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }

    btn.addEventListener('click', close);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    document.addEventListener('keydown', (e) => {
      if (overlay.classList.contains('open') && e.key === 'Escape') {
        close();
      }
    });

    document.body.appendChild(overlay);
    return { overlay, img, cap };
  }

  function isZoomableImage(img) {
    if (!(img instanceof HTMLImageElement)) return false;
    if (img.classList.contains('site-logo')) return false;
    if (img.classList.contains('no-zoom')) return false;
    // Only images within the main content are zoomable by default
    return img.closest('main') !== null;
  }

  function setup() {
    const lb = createLightbox();
    const images = Array.from(document.querySelectorAll('img'))
      .filter(isZoomableImage);

    images.forEach((img) => {
      img.classList.add('zoomable');
      img.addEventListener('click', () => {
        lb.img.src = img.currentSrc || img.src;
        lb.img.alt = img.alt || '';
        lb.cap.textContent = img.alt || '';
        lb.overlay.classList.add('open');
        lb.overlay.removeAttribute('aria-hidden');
        document.body.style.overflow = 'hidden';
      });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup);
  } else {
    setup();
  }
})();


