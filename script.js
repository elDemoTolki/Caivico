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
          img.alt = `Galería ${i+1}`;
          img.loading = i === 0 ? 'eager' : 'lazy';
          img.onload = () => attachZoomHandler(img);
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

  // === MODAL ===
  function closeModal(){
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  closeBtn && closeBtn.addEventListener('click', closeModal);
  modal && modal.addEventListener('click', function(e){
    if(e.target === this) closeModal();
  });

  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false'){
      closeModal();
    }
  });

  console.log('=== READY ===');
});
