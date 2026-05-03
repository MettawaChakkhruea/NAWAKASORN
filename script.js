function qs(sel, parent = document) {
  return parent.querySelector(sel);
}

function setupMobileMenu() {
  const btn = qs("[data-menu-btn]");
  const menu = qs("[data-menu]");
  if (!btn || !menu) return;

  const close = () => {
    menu.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  const toggle = () => {
    const next = !menu.classList.contains("is-open");
    menu.classList.toggle("is-open", next);
    btn.setAttribute("aria-expanded", next ? "true" : "false");
  };

  btn.addEventListener("click", toggle);

  // Close on link click (mobile UX)
  menu.addEventListener("click", (e) => {
    const a = e.target?.closest?.("a");
    if (!a) return;
    close();
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (e.target === btn || btn.contains(e.target)) return;
    if (e.target === menu || menu.contains(e.target)) return;
    close();
  });

  window.addEventListener("resize", close);
}

function setupHeaderShadow() {
  const header = qs("[data-sticky]");
  if (!header) return;

  const onScroll = () => {
    header.classList.toggle("is-scrolled", (window.scrollY || 0) > 8);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function setupHeroCarousel() {
  const root = qs("[data-hero-carousel]");
  if (!root) return;

  const slides = Array.from(root.querySelectorAll(".hero-carousel-slide"));
  const dotsWrap = qs("[data-carousel-dots]", root);
  const titleEl = qs("[data-carousel-title]", root);
  if (!slides.length || !dotsWrap) return;

  const intervalMs = Math.max(2800, parseInt(root.dataset.carouselInterval || "4800", 10) || 4800);
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let index = 0;
  let timer = 0;

  dotsWrap.replaceChildren();

  const dots = slides.map((slide, i) => {
    const cap = slide.dataset.carouselCaption || `สไลด์ ${i + 1}`;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "hero-carousel-dot";
    btn.setAttribute("role", "tab");
    btn.setAttribute("aria-label", `${cap} — สไลด์ที่ ${i + 1}`);
    btn.addEventListener("click", () => {
      go(i);
      resetTimer();
    });
    dotsWrap.appendChild(btn);
    return btn;
  });

  function go(nextIndex) {
    const n = slides.length;
    index = ((nextIndex % n) + n) % n;
    slides.forEach((s, j) => s.classList.toggle("is-active", j === index));
    dots.forEach((d, j) => {
      d.classList.toggle("is-active", j === index);
      d.setAttribute("aria-selected", j === index ? "true" : "false");
    });
    const cap = slides[index].dataset.carouselCaption || "";
    if (titleEl) titleEl.textContent = cap;
  }

  function tick() {
    go(index + 1);
  }

  function stopTimer() {
    if (!timer) return;
    window.clearInterval(timer);
    timer = 0;
  }

  function startTimer() {
    if (reducedMotion || document.hidden) return;
    stopTimer();
    timer = window.setInterval(tick, intervalMs);
  }

  function resetTimer() {
    stopTimer();
    startTimer();
  }

  root.addEventListener("mouseenter", stopTimer);
  root.addEventListener("mouseleave", startTimer);
  root.addEventListener("focusin", stopTimer);
  root.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!root.contains(document.activeElement)) startTimer();
    });
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stopTimer();
    else startTimer();
  });

  go(0);
  startTimer();
}

function setupHeroBg() {
  const wrap = qs("[data-hero-bg]");
  if (!wrap) return;

  const markLoaded = () => wrap.classList.add("bg-loaded");
  const slides = Array.from(wrap.querySelectorAll(".hero-bg-slide"));
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (slides.length >= 2) {
    wrap.classList.add("has-slideshow");
    const hero = wrap.closest(".hero");
    if (hero) hero.classList.add("has-hero-slider");

    const dotsWrap = hero ? qs("[data-hero-bg-dots]", hero) : null;
    const prevBtn = hero ? qs("[data-hero-bg-prev]", hero) : null;
    const nextBtn = hero ? qs("[data-hero-bg-next]", hero) : null;

    const intervalMs = Math.max(4000, parseInt(wrap.dataset.heroBgInterval || "5500", 10) || 5500);

    const firstImg = slides[0]?.querySelector("img");
    if (firstImg) {
      if (firstImg.complete && firstImg.naturalWidth > 0) markLoaded();
      else firstImg.addEventListener("load", markLoaded, { once: true });
    } else {
      markLoaded();
    }

    let index = 0;
    let timer = 0;
    const dots = [];

    if (dotsWrap) {
      dotsWrap.replaceChildren();
      slides.forEach((slide, i) => {
        const cap = slide.dataset.slideLabel || `ภาพที่ ${i + 1}`;
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "hero-bg-dot";
        dot.setAttribute("role", "tab");
        dot.setAttribute("aria-label", cap);
        dot.addEventListener("click", () => {
          go(i);
          resetTimer();
        });
        dotsWrap.appendChild(dot);
        dots.push(dot);
      });
    }

    function syncDots() {
      dots.forEach((d, j) => {
        d.classList.toggle("is-active", j === index);
        d.setAttribute("aria-selected", j === index ? "true" : "false");
      });
    }

    function go(nextIndex) {
      const n = slides.length;
      index = ((nextIndex % n) + n) % n;
      slides.forEach((s, j) => s.classList.toggle("is-active", j === index));
      syncDots();
    }

    function stopTimer() {
      if (!timer) return;
      window.clearInterval(timer);
      timer = 0;
    }

    function startTimer() {
      if (reducedMotion || document.hidden) return;
      stopTimer();
      timer = window.setInterval(() => go(index + 1), intervalMs);
    }

    function resetTimer() {
      stopTimer();
      startTimer();
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", () => {
        go(index - 1);
        resetTimer();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", () => {
        go(index + 1);
        resetTimer();
      });
    }

    if (!reducedMotion) {
      if (hero) {
        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
      }
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) stopTimer();
        else startTimer();
      });
      go(0);
      startTimer();
    } else {
      go(0);
    }
    return;
  }

  if (slides.length === 1) {
    const img = slides[0].querySelector("img");
    if (!img) return;
    if (img.complete && img.naturalWidth > 0) markLoaded();
    else img.addEventListener("load", markLoaded, { once: true });
    return;
  }

  const img = wrap.querySelector(":scope > img");
  if (!img) return;
  if (img.complete && img.naturalWidth > 0) markLoaded();
  else img.addEventListener("load", markLoaded, { once: true });
}

setupMobileMenu();
setupHeaderShadow();
setupHeroCarousel();
setupHeroBg();
