// Portfolio Lightbox Gallery
  const galleryImages = Array.from({ length: 20 }, (_, i) =>
    `Images/gallery/slide-${String(i + 1).padStart(2, '0')}.png`
  );
  let currentSlide = 0;
  const lightbox = document.getElementById('portfolioLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCounter = document.getElementById('lightboxCounter');

  function openGallery(index) {
    currentSlide = index;
    updateLightboxImage();
    lightbox.classList.add('open');
    document.body.classList.add('no-scroll');
    document.documentElement.classList.add('no-scroll');
  }

  function closeGallery() {
    lightbox.classList.remove('open');
    document.body.classList.remove('no-scroll');
    document.documentElement.classList.remove('no-scroll');
  }

  function galleryNav(dir) {
    currentSlide = (currentSlide + dir + galleryImages.length) % galleryImages.length;
    updateLightboxImage();
  }

  function updateLightboxImage() {
    lightboxImg.src = galleryImages[currentSlide];
    lightboxCounter.textContent = `${currentSlide + 1} / ${galleryImages.length}`;
  }

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeGallery();
    if (e.key === 'ArrowRight') galleryNav(1);
    if (e.key === 'ArrowLeft') galleryNav(-1);
  });

  // Reviews Carousel
  let currentReview = 0;
  const track = document.getElementById('reviewsTrack');
  const cards = track ? track.querySelectorAll('.review-card') : [];
  const dotsContainer = document.getElementById('reviewsDots');

  function getVisible() {
    return window.innerWidth >= 1024 ? 3 : window.innerWidth >= 640 ? 2 : 1;
  }

  function buildDots() {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    const total = Math.ceil(cards.length / getVisible());
    for (let i = 0; i < total; i++) {
      const d = document.createElement('span');
      d.className = 'rev-dot' + (i === 0 ? ' active' : '');
      d.onclick = () => goToReview(i);
      dotsContainer.appendChild(d);
    }
  }

  function goToReview(index) {
    const visible = getVisible();
    const max = Math.ceil(cards.length / visible) - 1;
    currentReview = Math.max(0, Math.min(index, max));
    const cardWidth = cards[0].offsetWidth + 24;
    track.style.transform = `translateX(-${currentReview * visible * cardWidth}px)`;
    document.querySelectorAll('.rev-dot').forEach((d, i) => {
      d.classList.toggle('active', i === currentReview);
    });
  }

  function moveReviews(dir) {
    goToReview(currentReview + dir);
  }

  window.addEventListener('load', buildDots);
  window.addEventListener('resize', () => { buildDots(); goToReview(0); });

  function togglePricing(card) {
    if (window.innerWidth >= 1024) return;
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.pricing-card').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  }

  function toggleMenu(){
      document.getElementById("sidebar").classList.toggle('open');
      document.getElementById("hamburger").classList.toggle('open');
      document.getElementById("overlay").classList.toggle('open');

      document.body.classList.toggle('no-scroll');
      document.documentElement.classList.toggle('no-scroll');
    }
  function sendPackage(name, price) {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('overlay').classList.remove('open');
    document.getElementById('hamburger').classList.remove('open');
    const messages = {
      'Starter': `مرحبا Med Ali! 

حابب نبدأ بالباكاج *Starter* بـ ${price} دينار.

 *شنو يتضمن:*
- Logo design (concept واحد)
- PNG + SVG formats
- نسخة فاتحة وداكنة

⏱ المدة: 3-4 أيام
 التعديلات: 2 revisions
 الدفع: ${parseInt(price)/2} دينار مقدماً + ${parseInt(price)/2} عند التسليم

جاهز نبدأ؟ `,
      'Brand Core': `مرحبا Med Ali! 

حابب نبدأ بالباكاج *Brand Core* بـ ${price} دينار.

 *شنو يتضمن:*
- Logo design (2 concepts)
- PNG + SVG + PDF formats
- نسخة فاتحة وداكنة
- Color palette
- Typography system

⏱ المدة: 5-7 أيام
 التعديلات: 3 revisions
 الدفع: ${parseInt(price)/2} دينار مقدماً + ${parseInt(price)/2} عند التسليم

جاهز نبدأ؟ `,
      'Full Identity': `مرحبا Med Ali! 

حابب نبدأ بالباكاج *Full Identity* بـ ${price} دينار.

 *شنو يتضمن:*
- Logo design (3 concepts)
- جميع الـ formats (PNG/SVG/PDF/AI)
- نسخة فاتحة وداكنة
- Full color palette
- Typography system
- Brand guide PDF
- 2 mockups

⏱ المدة: 10-14 يوم
 التعديلات: 5 revisions
 الدفع: ${parseInt(price)/2} دينار مقدماً + ${parseInt(price)/2} عند التسليم

جاهز نبدأ؟ `
    };
    setTimeout(() => {
      window.open(`https://wa.me/21692131604?text=${encodeURIComponent(messages[name])}`, '_blank');
    }, 100);
  }

  function checkService() {
    const select = document.getElementById('serviceSelect');
    const alert = document.getElementById('serviceAlert');
    alert.classList.remove('show');
   }
  
  function sendWhatsApp() {
    const select = document.getElementById('serviceSelect');
    
    const name = document.querySelector('input[placeholder="Name"]').value;
    const email = document.querySelector('input[placeholder="Email"]').value;
    const message = document.querySelector('textarea').value;
    const text = `Service: ${select.value}%0AName: ${name}%0AEmail: ${email}%0AMessage: ${message}`;
    window.open(`https://wa.me/21692131604?text=${text}`, '_blank');
  }

  // Fade in on scroll
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('section, .brand-divider').forEach(el => {
  observer.observe(el);
});