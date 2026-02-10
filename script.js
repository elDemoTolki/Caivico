// script.js - Complete site interactivity
document.addEventListener('DOMContentLoaded', function(){
  console.log('=== INIT ===');
  
  // Get DOM elements
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('.nav-list');
  const header = document.querySelector('.site-header');
  const modal = document.getElementById('galleryModal');
  const modalImage = document.getElementById('modalImage');
  const closeBtn = document.querySelector('.modal-close');
  const galleryGrid = document.querySelector('.gallery-grid');

  console.log('Gallery grid:', !!galleryGrid);

  // Menu toggle - Abrir/Cerrar
  if(hamburger){
    hamburger.addEventListener('click', function(){
      const expanded = this.getAttribute('aria-expanded') === 'true';
      this.setAttribute('aria-expanded', String(!expanded));
      nav && nav.classList.toggle('open');
    });
  }

  // Cerrar menú al hacer clic en un enlace del menú
  if(nav){
    const navLinks = nav.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', function(){
        nav.classList.remove('open');
        hamburger && hamburger.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // Cerrar menú al hacer clic fuera
  document.addEventListener('click', function(e){
    const isClickInsideNav = nav && nav.contains(e.target);
    const isClickOnHamburger = hamburger && hamburger.contains(e.target);
    
    if(!isClickInsideNav && !isClickOnHamburger && nav && nav.classList.contains('open')){
      nav.classList.remove('open');
      hamburger && hamburger.setAttribute('aria-expanded', 'false');
    }
  });

  // Sticky header shadow
  window.addEventListener('scroll', function(){
    if(window.scrollY > 10){
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // Smooth scroll links
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', function(e){
      const target = document.querySelector(this.getAttribute('href'));
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    });
  });

  // === GALLERY LOADER (HOME) ===
  // Carga 6 imágenes aleatorias desde assets/gallery.json
  if(!galleryGrid){
    console.warn('Gallery grid NOT found — skipping gallery initialization');
  } else {
    (async function(){
      try {
        const res = await fetch('/assets/gallery.json');
        if(!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        const all = Array.isArray(data.images) ? data.images : [];
        if(all.length === 0){
          console.warn('No images in gallery.json');
          return;
        }

        // pick 6 unique random images
        const pick = [];
        const used = new Set();
        const count = Math.min(6, all.length);
        while(pick.length < count){
          const idx = Math.floor(Math.random() * all.length);
          if(!used.has(idx)){
            used.add(idx);
            pick.push(all[idx]);
          }
        }

        function attachZoomHandler(img){
          img.style.cursor = 'zoom-in';
          img.addEventListener('click', function(e){
            e.stopPropagation();
            const rect = img.getBoundingClientRect();
            const clone = img.cloneNode(true);
            clone.style.position = 'fixed';
            clone.style.left = rect.left + 'px';
            clone.style.top = rect.top + 'px';
            clone.style.width = rect.width + 'px';
            clone.style.height = rect.height + 'px';
            clone.style.transition = 'all 360ms ease';
            clone.style.zIndex = 9999;
            clone.style.borderRadius = '12px';
            clone.style.objectFit = 'cover';
            document.body.appendChild(clone);

            requestAnimationFrame(() => {
              const zoomW = Math.min(window.innerWidth * 0.8, 900);
              const zoomH = zoomW * (rect.height / rect.width);
              clone.style.left = ((window.innerWidth - zoomW) / 2) + 'px';
              clone.style.top = ((window.innerHeight - zoomH) / 2) + 'px';
              clone.style.width = zoomW + 'px';
              clone.style.height = zoomH + 'px';
            });

            function closeZoom(){
              clone.style.transition = 'all 360ms ease';
              clone.style.left = rect.left + 'px';
              clone.style.top = rect.top + 'px';
              clone.style.width = rect.width + 'px';
              clone.style.height = rect.height + 'px';
              setTimeout(() => clone.remove(), 360);
            }

            clone.addEventListener('click', closeZoom);
            const escapeHandler = (e) => {
              if(e.key === 'Escape'){
                closeZoom();
                document.removeEventListener('keydown', escapeHandler);
              }
            };
            document.addEventListener('keydown', escapeHandler);
          });
        }

        pick.forEach((p, i) => {
          const img = document.createElement('img');
          img.src = p;
          img.alt = `Imagen de galería ${i+1}`;
          img.loading = i === 0 ? 'eager' : 'lazy';
          img.tabIndex = 0; // make thumbnails keyboard-focusable
          img.setAttribute('data-src-index', i);
          img.addEventListener('load', () => attachZoomHandler(img));
          galleryGrid.appendChild(img);
        });

        // Add link to full gallery
        const linkWrap = document.createElement('div');
        linkWrap.style.gridColumn = '1 / -1';
        linkWrap.style.textAlign = 'center';
        linkWrap.style.marginTop = '1rem';
        const link = document.createElement('a');
        link.href = '/galeria/';
        link.className = 'btn primary';
        link.textContent = 'Ver galería completa';
        linkWrap.appendChild(link);
        galleryGrid.after(linkWrap);
      } catch(err){
        console.error('Error loading home gallery:', err);
      }
    })();
  }

  // === LIGHTBOX / ACCESSIBLE MODAL ===
  // Handles open/close, keyboard navigation, focus trap and delegation
  let galleryIndexCache = null;
  async function fetchGalleryIndex(){
    if(galleryIndexCache) return galleryIndexCache;
    try{
      const res = await fetch('/assets/gallery.json');
      if(!res.ok) throw new Error('HTTP ' + res.status);
      const data = await res.json();
      galleryIndexCache = Array.isArray(data.images) ? data.images : [];
      return galleryIndexCache;
    }catch(err){
      console.warn('Could not load gallery index for lightbox', err);
      return [];
    }
  }

  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lightboxImage');
  const lbClose = lightbox && lightbox.querySelector('.modal-close');
  const lbPrev = lightbox && lightbox.querySelector('.nav.prev');
  const lbNext = lightbox && lightbox.querySelector('.nav.next');
  const lbCounter = lightbox && lightbox.querySelector('.counter');
  let lbOpen = false;
  let lbCurrent = 0;
  let lbImages = [];
  let lastTrigger = null;

  function updateCounter(){
    if(!lbCounter) return;
    lbCounter.textContent = (lbImages.length>0) ? `${lbCurrent+1} / ${lbImages.length}` : '';
  }

  function focusableIn(node){
    return [...node.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(el => !el.hasAttribute('disabled'));
  }

  function trapTabKey(e){
    if(!lbOpen) return;
    const focusables = focusableIn(lightbox);
    if(focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if(e.key === 'Tab'){
      if(e.shiftKey){
        if(document.activeElement === first){
          e.preventDefault();
          last.focus();
        }
      } else {
        if(document.activeElement === last){
          e.preventDefault();
          first.focus();
        }
      }
    }
  }

  function showImage(idx){
    if(!lbImage) return;
    if(lbImages.length === 0) return;
    lbCurrent = ((idx % lbImages.length) + lbImages.length) % lbImages.length; // wrap
    const src = lbImages[lbCurrent];
    lbImage.src = src;
    lbImage.alt = `Imagen de galería ${lbCurrent+1}`;
    updateCounter();
  }

  async function openLightbox(idx, trigger){
    lbImages = await fetchGalleryIndex();
    if(lbImages.length === 0) return;
    lastTrigger = trigger || null;
    showImage(idx);
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
    lbOpen = true;
    // focus first control
    setTimeout(()=>{
      if(lbClose) lbClose.focus();
    }, 60);
    document.addEventListener('keydown', onDocumentKey);
    document.addEventListener('keydown', trapTabKey);
  }

  function closeLightbox(){
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('no-scroll');
    lbOpen = false;
    document.removeEventListener('keydown', onDocumentKey);
    document.removeEventListener('keydown', trapTabKey);
    // restore focus to trigger
    if(lastTrigger && typeof lastTrigger.focus === 'function') lastTrigger.focus();
  }

  function onDocumentKey(e){
    if(!lbOpen) return;
    if(e.key === 'Escape'){
      e.preventDefault();
      closeLightbox();
      return;
    }
    if(e.key === 'ArrowLeft'){
      e.preventDefault();
      showImage(lbCurrent - 1);
      return;
    }
    if(e.key === 'ArrowRight'){
      e.preventDefault();
      showImage(lbCurrent + 1);
      return;
    }
  }

  // Button handlers
  lbClose && lbClose.addEventListener('click', closeLightbox);
  lbPrev && lbPrev.addEventListener('click', () => showImage(lbCurrent - 1));
  lbNext && lbNext.addEventListener('click', () => showImage(lbCurrent + 1));
  // backdrop click closes
  lightbox && lightbox.addEventListener('click', function(e){ if(e.target === this) closeLightbox(); });

  // Delegated activation: clicks and keyboard (Enter/Space) on thumbnails
  document.addEventListener('click', async function(e){
    const img = e.target.closest && e.target.closest('.gallery-grid img, #gallery-full-grid img');
    if(!img) return;
    e.preventDefault();
    // determine index in gallery.json
    const imgs = await fetchGalleryIndex();
    const src = img.getAttribute('src') || img.getAttribute('data-src') || img.dataset.src || img.currentSrc;
    const idx = imgs.indexOf(src);
    openLightbox(idx >= 0 ? idx : 0, img);
  });

  // Keyboard activation on thumbnails
  document.addEventListener('keydown', async function(e){
    if(e.key !== 'Enter' && e.key !== ' ') return;
    const el = document.activeElement;
    if(!el) return;
    if(el.matches && el.matches('.gallery-grid img, #gallery-full-grid img')){
      e.preventDefault();
      const imgs = await fetchGalleryIndex();
      const src = el.getAttribute('src') || el.getAttribute('data-src') || el.dataset.src || el.currentSrc;
      const idx = imgs.indexOf(src);
      openLightbox(idx >= 0 ? idx : 0, el);
    }
  });

  console.log('=== READY ===');
});
