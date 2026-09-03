// Portfolio Lightbox Gallery
// 20 slides = original Logofolio2026 PDF export.
// 21-32 = Accessoires Plus — Packaging (new, separate export).
// Bump this number whenever you add more slides for a future project.
const galleryImages = Array.from(
  { length: 22 },
  (_, i) => `Images/gallery/slide-${String(i + 1).padStart(2, "0")}.png`,
);

// Work section — `projects` comes from JS/projects-data.js (loaded
// before this file). Add a new case study there, not here.
// Only this many project cards show by default; the rest reveal on
// "View More Projects" so the section doesn't keep growing taller
// every time a new case study is added. Mobile shows fewer since
// each card takes a full row there (1 column vs 3 on desktop).
const VISIBLE_PROJECTS_DESKTOP = 5;
const VISIBLE_PROJECTS_MOBILE = 3;
const MOBILE_BREAKPOINT = 768; // matches the site's own mobile CSS breakpoint

function getInitialVisibleCount() {
  return window.innerWidth <= MOBILE_BREAKPOINT
    ? VISIBLE_PROJECTS_MOBILE
    : VISIBLE_PROJECTS_DESKTOP;
}

function renderProjects() {
  const grid = document.getElementById("projectsGrid");
  if (!grid) return;
  const html = projects
    .map((p) => {
      const start = p.firstSlide - 1; // convert human slide number to 0-based index
      const end = start + p.slideCount - 1;
      return `
      <div
        class="project-card"
        role="button"
        tabindex="0"
        aria-label="View ${p.title} slides"
        onclick="openGallery(${start}, ${end})"
      >
        <div class="project-cover">
          <img src="${p.cover}" alt="${p.alt}" loading="lazy" />
          <div class="project-overlay">
            <span class="project-view"><ion-icon name="expand-outline"></ion-icon> View Slides</span>
          </div>
        </div>
        <div class="project-info">
          <h3>${p.title}</h3>
          <p>${p.subtitle}</p>
        </div>
      </div>`;
    })
    .join("");
  grid.insertAdjacentHTML("afterbegin", html);
  applyProjectVisibility();
}
renderProjects();

// Applies/reapplies which cards are hidden based on the current
// screen size. Skipped while the user already has it expanded, so
// resizing the window doesn't yank open cards back out of view.
function applyProjectVisibility() {
  const grid = document.getElementById("projectsGrid");
  if (!grid || grid.classList.contains("expanded")) return;
  const cards = grid.querySelectorAll(
    ".project-card:not(.project-card-behance)",
  );
  const visibleCount = getInitialVisibleCount();
  cards.forEach((card, i) => {
    card.classList.toggle("project-hidden", i >= visibleCount);
  });
  const moreWrap = document.getElementById("workMoreWrap");
  if (moreWrap)
    moreWrap.classList.toggle("hidden", projects.length <= visibleCount);
}
window.addEventListener("resize", applyProjectVisibility);

function toggleProjects() {
  const grid = document.getElementById("projectsGrid");
  const btn = document.getElementById("viewMoreBtn");
  const label = document.getElementById("viewMoreLabel");
  if (!grid || !btn || !label) return;
  const expanded = grid.classList.toggle("expanded");
  btn.classList.toggle("expanded", expanded);
  btn.setAttribute("aria-expanded", String(expanded));
  label.textContent = expanded ? "Show Less" : "View More Projects";
}
let currentSlide = 0;
let galleryStart = 0;
let galleryEnd = galleryImages.length - 1;
const lightbox = document.getElementById("portfolioLightbox");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCounter = document.getElementById("lightboxCounter");
const lightboxFullBtn = document.getElementById("lightboxFullBtn");

function openGallery(index, endIndex) {
  galleryStart = index;
  galleryEnd =
    typeof endIndex === "number" ? endIndex : galleryImages.length - 1;
  currentSlide = index;
  updateLightboxImage();
  lightbox.classList.add("open");
  document.body.classList.add("no-scroll");
  document.documentElement.classList.add("no-scroll");
}

function openFullPortfolio() {
  galleryStart = 0;
  galleryEnd = galleryImages.length - 1;
  updateLightboxImage();
}

function closeGallery() {
  lightbox.classList.remove("open");
  document.body.classList.remove("no-scroll");
  document.documentElement.classList.remove("no-scroll");
}

function galleryNav(dir) {
  currentSlide += dir;
  if (currentSlide > galleryEnd) currentSlide = galleryStart;
  if (currentSlide < galleryStart) currentSlide = galleryEnd;
  updateLightboxImage();
}

function updateLightboxImage() {
  lightboxImg.src = galleryImages[currentSlide];
  const scopedTotal = galleryEnd - galleryStart + 1;
  const scopedIndex = currentSlide - galleryStart + 1;
  lightboxCounter.textContent = `${scopedIndex} / ${scopedTotal}`;
  const isFullRange =
    galleryStart === 0 && galleryEnd === galleryImages.length - 1;
  lightboxFullBtn.style.display = isFullRange ? "none" : "flex";
}

document.addEventListener("keydown", (e) => {
  if (!lightbox.classList.contains("open")) return;
  if (e.key === "Escape") closeGallery();
  if (e.key === "ArrowRight") galleryNav(1);
  if (e.key === "ArrowLeft") galleryNav(-1);
});

// Reviews Carousel — seamless infinite loop.
// Reviews Carousel — seamless infinite loop.
// `reviews` comes from JS/reviews-data.js (loaded before this file).
// Add a new review there, not here.
function renderReviews() {
  const track = document.getElementById("reviewsTrack");
  if (!track) return;
  const html = reviews
    .map((r) => {
      const langAttr = r.lang ? ` lang="${r.lang}"` : "";
      const starsHtml = "★".repeat(r.stars || 5);
      const quoteHtml = r.lines.join("<br />");
      return `
      <div class="review-card">
        <div class="review-stars">${starsHtml}</div>
        <p class="review-text"${langAttr}>❝ ${quoteHtml} ❞</p>
        <div class="review-author">
          <span class="review-name">${r.name}</span>
        </div>
      </div>`;
    })
    .join("");
  track.innerHTML = html;
}
renderReviews();

// We clone the full set of cards before AND after the real ones, so
// scrolling always moves in the same direction. Once the animation
// finishes and we've drifted into a cloned block, we silently snap
// back into the real block (no transition) — since the clone is a
// pixel-perfect copy, the snap is invisible to the eye.
let currentReview = 0;
const track = document.getElementById("reviewsTrack");
const cards = track ? Array.from(track.querySelectorAll(".review-card")) : [];
const dotsContainer = document.getElementById("reviewsDots");
const REVIEW_COUNT = cards.length;

if (track && REVIEW_COUNT > 0) {
  const beforeFrag = document.createDocumentFragment();
  const afterFrag = document.createDocumentFragment();
  cards.forEach((card) => {
    const cloneBefore = card.cloneNode(true);
    cloneBefore.setAttribute("aria-hidden", "true");
    beforeFrag.appendChild(cloneBefore);
    const cloneAfter = card.cloneNode(true);
    cloneAfter.setAttribute("aria-hidden", "true");
    afterFrag.appendChild(cloneAfter);
  });
  track.insertBefore(beforeFrag, track.firstChild);
  track.appendChild(afterFrag);
}

// Position in card-widths, starting at the real (middle) block, card 0.
let cardOffset = REVIEW_COUNT;

function cardStep() {
  return cards[0].offsetWidth + 24;
}

// One dot per review card, and every step (arrow/dot/autoplay) moves
// exactly one card — even on large screens where 3 cards show at
// once, so movement always feels like a smooth slide, never a
// group swap.
function buildDots() {
  if (!dotsContainer) return;
  dotsContainer.innerHTML = "";
  for (let i = 0; i < REVIEW_COUNT; i++) {
    const d = document.createElement("span");
    d.className = "rev-dot" + (i === 0 ? " active" : "");
    d.onclick = () => goToReview(i);
    dotsContainer.appendChild(d);
  }
}

function applyTransform(withTransition) {
  track.style.transition = withTransition ? "" : "none";
  track.style.transform = `translateX(-${cardOffset * cardStep()}px)`;
  if (!withTransition) {
    void track.offsetWidth; // force reflow so the next move re-animates
    track.style.transition = "";
  }
}

function updateDots() {
  document.querySelectorAll(".rev-dot").forEach((d, i) => {
    d.classList.toggle("active", i === currentReview);
  });
}

// Dot click — direct jump, always lands in the real block.
function goToReview(index) {
  currentReview = ((index % REVIEW_COUNT) + REVIEW_COUNT) % REVIEW_COUNT;
  cardOffset = REVIEW_COUNT + currentReview;
  applyTransform(true);
  updateDots();
}

// Arrow / autoplay step — always moves one card, scrolls into the
// clone when needed, then snaps back once the transition ends.
function moveReviews(dir) {
  cardOffset += dir;
  currentReview =
    (((currentReview + dir) % REVIEW_COUNT) + REVIEW_COUNT) % REVIEW_COUNT;
  applyTransform(true);
  updateDots();

  track.addEventListener("transitionend", function handler(e) {
    if (e.propertyName !== "transform") return;
    track.removeEventListener("transitionend", handler);
    if (cardOffset >= REVIEW_COUNT * 2) {
      cardOffset -= REVIEW_COUNT;
      applyTransform(false);
    } else if (cardOffset < REVIEW_COUNT) {
      cardOffset += REVIEW_COUNT;
      applyTransform(false);
    }
  });
}

// Auto-advance the reviews on a loop; pause while the pointer is
// over the carousel or its arrow buttons so people can read in peace.
let reviewsTimer = null;
function startReviewsAutoplay() {
  stopReviewsAutoplay();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  reviewsTimer = setInterval(() => moveReviews(1), 2000);
}
function stopReviewsAutoplay() {
  if (reviewsTimer) clearInterval(reviewsTimer);
  reviewsTimer = null;
}
const reviewsCarouselEl = document.querySelector(".reviews-carousel");
const reviewsControlsEl = document.querySelector(".reviews-controls");
[reviewsCarouselEl, reviewsControlsEl].forEach((el) => {
  if (!el) return;
  el.addEventListener("mouseenter", stopReviewsAutoplay);
  el.addEventListener("mouseleave", startReviewsAutoplay);
});

window.addEventListener("load", () => {
  buildDots();
  applyTransform(false);
  startReviewsAutoplay();
});
window.addEventListener("resize", () => {
  buildDots();
  goToReview(0);
});

function togglePricing(card) {
  if (window.innerWidth >= 1024) return;
  const isOpen = card.classList.contains("open");
  document.querySelectorAll(".pricing-card").forEach((c) => {
    c.classList.remove("open");
    c.setAttribute("aria-expanded", "false");
  });
  if (!isOpen) {
    card.classList.add("open");
    card.setAttribute("aria-expanded", "true");
  }
}

// Addon cards (Packaging / Social Media) collapse the same way as
// pricing cards on mobile, and are linked the same way too — opening
// one closes the other.
function toggleAddon(card) {
  if (window.innerWidth >= 641) return;
  const isOpen = card.classList.contains("open");
  document.querySelectorAll(".addon-card").forEach((c) => {
    c.classList.remove("open");
    c.setAttribute("aria-expanded", "false");
  });
  if (!isOpen) {
    card.classList.add("open");
    card.setAttribute("aria-expanded", "true");
  }
}

function updateAddonA11y() {
  const isMobile = window.innerWidth < 641;
  document.querySelectorAll(".addon-card").forEach((card) => {
    if (isMobile) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (!card.hasAttribute("aria-expanded"))
        card.setAttribute("aria-expanded", "false");
    } else {
      card.removeAttribute("role");
      card.removeAttribute("tabindex");
      card.removeAttribute("aria-expanded");
      card.classList.remove("open");
    }
  });
}
window.addEventListener("load", updateAddonA11y);
window.addEventListener("resize", updateAddonA11y);

// Pricing cards only respond to clicks on mobile (accordion behavior),
// so only expose them as keyboard-focusable buttons in that mode.
function updatePricingA11y() {
  const isMobile = window.innerWidth < 1024;
  document.querySelectorAll(".pricing-card").forEach((card) => {
    if (isMobile) {
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      if (!card.hasAttribute("aria-expanded"))
        card.setAttribute("aria-expanded", "false");
    } else {
      card.removeAttribute("role");
      card.removeAttribute("tabindex");
      card.removeAttribute("aria-expanded");
    }
  });
}
window.addEventListener("load", updatePricingA11y);
window.addEventListener("resize", updatePricingA11y);

// Keyboard support (Enter / Space) for interactive elements built on
// <div> instead of <button> — project cards, pricing cards, hamburger menu.
document.addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const target = e.target.closest(
    '.project-card[role="button"], .pricing-card[role="button"], .addon-card[role="button"], #hamburger',
  );
  if (!target) return;
  e.preventDefault();
  target.click();
});

function toggleMenu() {
  document.getElementById("sidebar").classList.toggle("open");
  document.getElementById("hamburger").classList.toggle("open");
  document.getElementById("overlay").classList.toggle("open");

  document.body.classList.toggle("no-scroll");
  document.documentElement.classList.toggle("no-scroll");
}
function sendPackage(name, price) {
  document.getElementById("sidebar").classList.remove("open");
  document.getElementById("overlay").classList.remove("open");
  document.getElementById("hamburger").classList.remove("open");
  const messages = {
    Starter: `مرحبا Med Ali! 

حابب نبدأ بالباكاج *Starter* بـ ${price} دينار.

 *شنو يتضمن:*
- Logo design (concept واحد)
- PNG + SVG formats
- نسخة فاتحة وداكنة

⏱ المدة: 3-4 أيام
 التعديلات: 2 revisions
 الدفع: ${parseInt(price) / 2} دينار مقدماً + ${parseInt(price) / 2} عند التسليم

جاهز نبدأ؟ `,
    "Brand Core": `مرحبا Med Ali! 

حابب نبدأ بالباكاج *Brand Core* بـ ${price} دينار.

 *شنو يتضمن:*
- Logo design (2 concepts)
- PNG + SVG + PDF formats
- نسخة فاتحة وداكنة
- Color palette
- Typography system

⏱ المدة: 5-7 أيام
 التعديلات: 3 revisions
 الدفع: ${parseInt(price) / 2} دينار مقدماً + ${parseInt(price) / 2} عند التسليم

جاهز نبدأ؟ `,
    "Full Identity": `مرحبا Med Ali! 

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
 الدفع: ${parseInt(price) / 2} دينار مقدماً + ${parseInt(price) / 2} عند التسليم

جاهز نبدأ؟ `,
  };
  setTimeout(() => {
    window.open(
      `https://wa.me/21692131604?text=${encodeURIComponent(messages[name])}`,
      "_blank",
    );
  }, 100);
}

function sendAddonQuote(name, priceRange) {
  const message = `مرحبا Med Ali! 

حابب نعرف أكثر على خدمة *${name}* (نطاق السعر: ${priceRange} دينار حسب حجم المشروع).

هذا تفاصيل المشروع متاعي:
- 

نستناو ردك باش نحددو السعر النهائي والمدة بالضبط 🙌`;
  window.open(
    `https://wa.me/21692131604?text=${encodeURIComponent(message)}`,
    "_blank",
  );
}

// Email field — live "@...com" validation + quick-select domain chips.
// The field stays optional: nothing is flagged while it's empty.
(function initEmailField() {
  const input = document.getElementById("emailInput");
  if (!input) return;
  const wrap = input.closest(".email-input-wrap");
  const chips = document.querySelectorAll(".domain-chip");
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function validate() {
    const val = input.value.trim();
    wrap.classList.remove("valid", "invalid");
    if (val.length === 0) return;
    wrap.classList.add(emailRegex.test(val) ? "valid" : "invalid");
  }

  input.addEventListener("input", validate);

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      const domain = chip.dataset.domain;
      const current = input.value.trim();
      const localPart = current.includes("@") ? current.split("@")[0] : current;
      input.value = localPart ? `${localPart}@${domain}` : `@${domain}`;
      input.focus();
      if (!localPart) input.setSelectionRange(0, 0);
      validate();
    });
  });
})();

function checkService() {
  const select = document.getElementById("serviceSelect");
  const alert = document.getElementById("serviceAlert");
  alert.classList.remove("show");
}

// Custom "Select a Service" dropdown — multi-select listbox pattern.
// "Full Brand Identity" is exclusive: picking it clears every other
// choice, and picking any other choice clears it. Keeps #serviceSelect
// (hidden input) as the source of truth so sendWhatsApp() still works.
(function initServiceDropdown() {
  const dropdown = document.getElementById("serviceDropdown");
  if (!dropdown) return;
  const trigger = document.getElementById("serviceTrigger");
  const label = document.getElementById("serviceTriggerLabel");
  const list = document.getElementById("serviceList");
  const hiddenInput = document.getElementById("serviceSelect");
  const options = Array.from(list.querySelectorAll('li[role="option"]'));
  const placeholder = label.textContent;

  function openList() {
    dropdown.classList.add("open");
    trigger.setAttribute("aria-expanded", "true");
    const current =
      list.querySelector("li.selected:not(.locked)") ||
      options.find((o) => !o.classList.contains("locked"));
    if (current) current.focus();
  }

  function closeList() {
    dropdown.classList.remove("open");
    trigger.setAttribute("aria-expanded", "false");
  }

  function refreshLabel() {
    // Only count options the user actually picked — options merely
    // "included" (locked) via Full Brand Identity aren't listed twice.
    const chosen = options.filter(
      (o) =>
        o.classList.contains("selected") && !o.classList.contains("locked"),
    );
    if (chosen.length === 0) {
      label.textContent = placeholder;
      dropdown.classList.remove("has-value");
      hiddenInput.value = "";
    } else if (chosen.length <= 2) {
      label.textContent = chosen.map((o) => o.dataset.value).join(", ");
      dropdown.classList.add("has-value");
      hiddenInput.value = chosen.map((o) => o.dataset.value).join(", ");
    } else {
      label.textContent = `${chosen.length} services selected`;
      dropdown.classList.add("has-value");
      hiddenInput.value = chosen.map((o) => o.dataset.value).join(", ");
    }
    checkService();
  }

  function setLocked(li, locked) {
    li.classList.toggle("locked", locked);
    li.classList.toggle(
      "selected",
      locked || li.classList.contains("selected"),
    );
    if (locked) {
      li.setAttribute("aria-selected", "true");
      li.setAttribute("aria-disabled", "true");
    } else {
      li.classList.remove("selected");
      li.setAttribute("aria-selected", "false");
      li.removeAttribute("aria-disabled");
    }
  }

  const exclusiveLi = options.find((o) => o.dataset.exclusive === "true");
  const impliedLis = (exclusiveLi?.dataset.implies || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
    .map((val) => options.find((o) => o.dataset.value === val))
    .filter(Boolean);

  function activateFullPackage() {
    exclusiveLi.classList.add("selected");
    exclusiveLi.setAttribute("aria-selected", "true");
    impliedLis.forEach((li) => setLocked(li, true));
  }

  function deactivateFullPackage() {
    exclusiveLi.classList.remove("selected");
    exclusiveLi.setAttribute("aria-selected", "false");
    impliedLis.forEach((li) => setLocked(li, false));
  }

  function toggleOption(li) {
    if (li.classList.contains("locked")) return; // included via Full Package, not directly toggleable

    if (li === exclusiveLi) {
      const willSelect = !li.classList.contains("selected");
      willSelect ? activateFullPackage() : deactivateFullPackage();
    } else {
      const willSelect = !li.classList.contains("selected");
      li.classList.toggle("selected", willSelect);
      li.setAttribute("aria-selected", String(willSelect));

      // Picking every implied option by hand (e.g. Logo Design +
      // Brand Guidelines) is the same thing as picking the Full
      // Package directly — merge them and lock the pair in.
      if (
        impliedLis.length &&
        impliedLis.every((o) => o.classList.contains("selected"))
      ) {
        activateFullPackage();
      }
    }

    refreshLabel();
  }

  function focusableOptions() {
    return options.filter((o) => !o.classList.contains("locked"));
  }

  trigger.addEventListener("click", () => {
    dropdown.classList.contains("open") ? closeList() : openList();
  });

  options.forEach((li) => {
    li.addEventListener("click", () => toggleOption(li));
    li.addEventListener("keydown", (e) => {
      const focusable = focusableOptions();
      const i = focusable.indexOf(li);
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleOption(li);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        (focusable[i + 1] || focusable[0])?.focus();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        (focusable[i - 1] || focusable[focusable.length - 1])?.focus();
      } else if (e.key === "Escape") {
        closeList();
        trigger.focus();
      }
    });
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) closeList();
  });
})();

function sendWhatsApp() {
  const select = document.getElementById("serviceSelect");

  const name = document.querySelector('input[placeholder="Name"]').value;
  const email = document.querySelector('input[placeholder="Email"]').value;
  const message = document.querySelector("textarea").value;
  const text = `Service: ${select.value}%0AName: ${name}%0AEmail: ${email}%0AMessage: ${message}`;
  window.open(`https://wa.me/21692131604?text=${text}`, "_blank");
}

// Fade in on scroll
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.1 },
);

document.querySelectorAll("section, .brand-divider").forEach((el) => {
  observer.observe(el);
});
