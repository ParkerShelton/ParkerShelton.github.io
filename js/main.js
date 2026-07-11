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
  // NEWSLETTER → Kit. This is the form's action URL (from Kit → form → Embed → HTML).
  // This form delivers the free Pink Bear Protocols bonus chapter to new subscribers.
  const NEWSLETTER_ENDPOINT = "https://app.kit.com/forms/9671080/subscriptions";
  // ──────────────────────────────────────────────────────────────────

  // Newsletter signup (Kit).
  document.querySelectorAll(".signup-form").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const success = form.querySelector(".form-success");
      const input = form.querySelector("input[type='email']");
      const email = input ? input.value : "";
      const showMsg = (msg) => {
        if (!success) return;
        success.style.display = "block";
        success.textContent = msg;
      };
      if (NEWSLETTER_ENDPOINT) {
        try {
          // Kit allows cross-origin JSON posts (access-control-allow-origin: *)
          // and returns { status: "success" }. Field name is "email_address".
          const response = await fetch(NEWSLETTER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json", Accept: "application/json" },
            body: JSON.stringify({ email_address: email }),
          });
          const result = await response.json();
          if (result.status === "success") {
            showMsg("Thanks! Check your inbox to confirm — your free bonus chapter is on the way.");
            form.reset();
          } else {
            showMsg("Hmm, that didn't go through — please try again.");
          }
        } catch (err) {
          showMsg("Hmm, that didn't go through — please try again.");
        }
        return;
      }
      // Demo fallback (no endpoint configured)
      showMsg(`Thanks! We'll be in touch at ${email}.`);
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
  // Only applies to in-page (#anchor) links, so book pages that link back to
  // "../index.html#..." are safely ignored.
  const navLinks = document.querySelectorAll(".main-nav a");
  const sections = Array.from(navLinks)
    .filter((link) => (link.getAttribute("href") || "").startsWith("#"))
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

});
