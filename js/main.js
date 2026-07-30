document.addEventListener('DOMContentLoaded', () => {

  // Mobile nav drawer
  const hamburger = document.querySelector('.hamburger');
  const nav = document.querySelector('header nav');
  if (hamburger && nav) {
    const openNav = () => {
      nav.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
    };
    const closeNav = () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    hamburger.addEventListener('click', () => {
      nav.classList.contains('open') ? closeNav() : openNav();
    });

    // Close when clicking the overlay (left of drawer)
    nav.addEventListener('click', e => {
      if (e.target === nav) closeNav();
    });

    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') closeNav();
    });

    // Close when a nav link is tapped
    nav.querySelectorAll('a:not(.nav-dropdown > a)').forEach(a => {
      a.addEventListener('click', closeNav);
    });

    // Mobile dropdown toggles
    document.querySelectorAll('.nav-dropdown > a').forEach(link => {
      link.addEventListener('click', e => {
        if (window.innerWidth <= 768) {
          e.preventDefault();
          link.parentElement.classList.toggle('open');
        }
      });
    });
  }

  // Active nav link
  const currentPath = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('nav a').forEach(a => {
    const href = a.getAttribute('href') || '';
    if (href && (currentPath.endsWith(href) || (href !== 'index.html' && href !== '/' && currentPath.includes(href.replace('.html', ''))))) {
      a.classList.add('active');
    }
  });

  // FAQ accordion
  document.querySelectorAll('.faq-question').forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';
      // Close all
      document.querySelectorAll('.faq-question').forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        b.nextElementSibling.classList.remove('open');
      });
      // Open clicked if was closed
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        answer.classList.add('open');
      }
    });
  });

  // Lightbox
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxClose = document.getElementById('lightbox-close');
  if (lightbox && lightboxImg) {
    const openLightbox = (src, alt) => {
      lightboxImg.src = src;
      lightboxImg.alt = alt;
      lightbox.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeLightbox = () => {
      lightbox.classList.remove('open');
      document.body.style.overflow = '';
      lightboxImg.src = '';
    };
    document.querySelectorAll('.lightbox-trigger').forEach(btn => {
      btn.addEventListener('click', () => {
        const img = btn.querySelector('img');
        openLightbox(img.src, img.alt);
      });
    });
    lightbox.addEventListener('click', e => { if (e.target === lightbox) closeLightbox(); });
    lightboxClose.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
  }

  // Contact form (Web3Forms)
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', async e => {
      e.preventDefault();
      const btn = contactForm.querySelector('button[type="submit"]');
      btn.disabled = true;
      btn.textContent = 'Sending…';
      const data = new FormData(contactForm);
      try {
        const res = await fetch('https://api.web3forms.com/submit', { method: 'POST', body: data });
        const json = await res.json();
        if (json.success) {
          contactForm.style.display = 'none';
          document.getElementById('form-success').style.display = 'block';
        } else {
          btn.disabled = false;
          btn.textContent = 'Send Message';
          alert('Something went wrong. Please try again.');
        }
      } catch {
        btn.disabled = false;
        btn.textContent = 'Send Message';
        alert('Network error. Please try again.');
      }
    });
  }

});
