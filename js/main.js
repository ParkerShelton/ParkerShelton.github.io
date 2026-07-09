document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".main-nav");

  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      nav.classList.toggle("open");
      const expanded = nav.classList.contains("open");
      toggle.setAttribute("aria-expanded", String(expanded));
    });

    nav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        nav.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  // ── Form backends ─────────────────────────────────────────────────
  // CONTACT FORM → Web3Forms (free, unlimited). Live.
  const CONTACT_ACCESS_KEY = "2e00ba9b-4aed-44d0-9cff-a585a6f157a2";
  //
  // NEWSLETTER → Kit (parker-shelton.kit.com). Paste your form's action URL here.
  // Get it from Kit → your form → Embed → HTML; it looks like:
  //   https://app.kit.com/forms/XXXXXXX/subscriptions
  const NEWSLETTER_ENDPOINT = "";
  // ──────────────────────────────────────────────────────────────────

  // Newsletter signup (Kit).
  document.querySelectorAll(".signup-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const success = form.querySelector(".form-success");
      const input = form.querySelector("input[type='email']");
      const email = input ? input.value : "";
      if (NEWSLETTER_ENDPOINT) {
        try {
          // Kit's subscribe field is "email_address". no-cors guarantees the
          // request reaches Kit; we can't read the (opaque) response, so we
          // show an optimistic confirmation.
          await fetch(NEWSLETTER_ENDPOINT, {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ email_address: email }),
          });
        } catch (err) {
          /* show the confirmation regardless of network hiccups */
        }
      }
      if (success) {
        success.style.display = "block";
        success.textContent = `Thanks! We'll be in touch at ${email}.`;
      }
      form.reset();
    });
  });

  // Contact form (Web3Forms).
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const note = contactForm.querySelector(".form-success");
      const showNote = (msg) => {
        if (!note) return;
        note.style.display = "block";
        if (msg) note.textContent = msg;
      };
      if (CONTACT_ACCESS_KEY) {
        try {
          const data = new FormData(contactForm);
          data.append("access_key", CONTACT_ACCESS_KEY);
          const response = await fetch("https://api.web3forms.com/submit", {
            method: "POST",
            body: data,
          });
          const result = await response.json();
          if (result.success) {
            showNote("Thanks — message received. I'll get back to you soon.");
            contactForm.reset();
          } else {
            showNote("Something went wrong — please email me directly at parkerkshelton@gmail.com.");
          }
        } catch (err) {
          showNote("Something went wrong — please email me directly at parkerkshelton@gmail.com.");
        }
        return;
      }
      // Demo fallback (no key configured)
      showNote();
      contactForm.reset();
    });
  }

  // Highlight the nav link for whichever section is currently in view.
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = Array.from(navLinks)
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  if (navLinks.length && sections.length && "IntersectionObserver" in window) {
    const setActive = (id) => {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
      });
    };
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id);
          }
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach((section) => observer.observe(section));
  }

  // Newsletter banner: slides up once the visitor has scrolled partway
  // down the page, and stays dismissed for 7 days (across visits) once closed.
  // A permanent signup form also lives in the footer, so closing the banner
  // never removes the only way to sign up.
  const banner = document.getElementById("newsletter-banner");
  const closeBtn = document.querySelector(".newsletter-banner-close");
  if (banner) {
    const DISMISS_KEY = "newsletterBannerDismissedUntil";
    const DISMISS_DAYS = 7;

    const dismissed = () => {
      const until = Number(localStorage.getItem(DISMISS_KEY));
      return Boolean(until) && Date.now() < until;
    };

    const checkScroll = () => {
      if (dismissed()) return;
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? window.scrollY / scrollable : 0;
      banner.classList.toggle("visible", progress > 0.3);
    };

    window.addEventListener("scroll", checkScroll, { passive: true });
    checkScroll();

    closeBtn?.addEventListener("click", () => {
      banner.classList.remove("visible");
      const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
      localStorage.setItem(DISMISS_KEY, String(until));
    });
  }

  // Scroll progress bar.
  const progressBar = document.getElementById("scroll-progress");
  if (progressBar) {
    const updateProgress = () => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? (window.scrollY / scrollable) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
  }

  // Scroll reveal animations: elements fade/slide into view once, staggered
  // by their position among sibling reveal elements in the same container.
  const revealEls = document.querySelectorAll(".reveal");
  if (revealEls.length && "IntersectionObserver" in window) {
    const groupIndex = new Map();
    revealEls.forEach((el) => {
      const parent = el.parentElement;
      const idx = groupIndex.get(parent) || 0;
      el.style.transitionDelay = `${Math.min(idx, 8) * 70}ms`;
      groupIndex.set(parent, idx + 1);
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("revealed");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  // Book detail modal: clicking a book cover opens a larger view of that
  // book's cover, genre, blurb, and buy links, read straight from its card.
  const modalOverlay = document.getElementById("book-modal-overlay");
  if (modalOverlay) {
    const modalCover = document.getElementById("book-modal-cover");
    const modalGenre = document.getElementById("book-modal-genre");
    const modalTitle = document.getElementById("book-modal-title");
    const modalStats = document.getElementById("book-modal-stats");
    const modalDescription = document.getElementById("book-modal-description");
    const modalBuyLinks = document.getElementById("book-modal-buy-links");
    const modalCloseBtn = document.getElementById("book-modal-close");

    const openModal = (card) => {
      const cover = card.querySelector(".book-cover");
      const fullDescription = card.querySelector(".book-full-description");
      const stats = card.querySelectorAll(".book-stats li");
      modalCover.style.background = cover?.style.background || "";
      modalGenre.textContent = card.querySelector(".book-genre")?.textContent || "";
      modalTitle.textContent = card.querySelector("h3")?.textContent || "";
      modalStats.innerHTML = "";
      stats.forEach((stat) => {
        const li = document.createElement("li");
        li.textContent = stat.textContent;
        modalStats.appendChild(li);
      });
      modalDescription.textContent =
        fullDescription?.textContent || card.querySelector(".book-blurb")?.textContent || "";
      modalBuyLinks.innerHTML = card.querySelector(".buy-links")?.innerHTML || "";
      modalOverlay.classList.add("open");
      document.body.style.overflow = "hidden";
    };

    const closeModal = () => {
      modalOverlay.classList.remove("open");
      document.body.style.overflow = "";
    };

    document.querySelectorAll(".book-cover").forEach((cover) => {
      cover.addEventListener("click", () => {
        const card = cover.closest(".book-card");
        if (card) openModal(card);
      });
      cover.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          const card = cover.closest(".book-card");
          if (card) openModal(card);
        }
      });
    });

    modalCloseBtn?.addEventListener("click", closeModal);
    modalOverlay.addEventListener("click", (event) => {
      if (event.target === modalOverlay) closeModal();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && modalOverlay.classList.contains("open")) closeModal();
    });
  }

  // Genre filter tabs on the books page.
  const filterTabs = document.querySelectorAll(".filter-tab");
  const filterCards = document.querySelectorAll("[data-genre]");
  if (filterTabs.length && filterCards.length) {
    filterTabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        filterTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const genre = tab.dataset.filter;
        filterCards.forEach((card) => {
          const matches = genre === "all" || card.dataset.genre === genre;
          card.style.display = matches ? "" : "none";
        });
      });
    });
  }
});
