(function () {
  "use strict";

  var LOCATIONS = {
    hagen: {
      name: "Hagen-Boele",
      address: "Denkmalstr. 3, 58099 Hagen",
      phone: "02331 632463",
      phoneHref: "tel:+492331632463",
      email: "hagen@orthotraum-hakimi.de"
    },
    ennepetal: {
      name: "Ennepetal",
      address: "Königsberger Str. 66, 58256 Ennepetal",
      phone: "02333 75856",
      phoneHref: "tel:+49233375856",
      email: "ennepetal@orthotraum-hakimi.de"
    }
  };

  function setActiveLocation(key) {
    var loc = LOCATIONS[key];
    if (!loc) return;

    // Sync every switch control (topbar pill + standorte tabs)
    document.querySelectorAll("[data-loc-switch]").forEach(function (group) {
      group.querySelectorAll("[data-loc]").forEach(function (btn) {
        btn.classList.toggle("active", btn.getAttribute("data-loc") === key);
      });
    });

    // Update hero mini-card
    var heroLoc = document.querySelector("[data-hero-loc]");
    if (heroLoc) {
      var nameEl = heroLoc.querySelector('[data-field="name"]');
      var addrEl = heroLoc.querySelector('[data-field="address"]');
      var phoneEl = heroLoc.querySelector('[data-field="phone"]');
      if (nameEl) nameEl.textContent = loc.name;
      if (addrEl) addrEl.textContent = loc.address;
      if (phoneEl) {
        phoneEl.textContent = loc.phone;
        phoneEl.setAttribute("href", loc.phoneHref);
      }
    }

    // Update topbar quick-call link
    var topbarPhone = document.getElementById("topbar-phone");
    if (topbarPhone) {
      topbarPhone.setAttribute("href", loc.phoneHref);
      topbarPhone.textContent = "📞 " + loc.phone;
    }

    // Update topbar quick-email link
    var topbarEmail = document.getElementById("topbar-email");
    if (topbarEmail) {
      topbarEmail.setAttribute("href", "mailto:" + loc.email);
      topbarEmail.textContent = "✉ " + loc.email;
    }

    // Update contact form target
    var form = document.getElementById("contactForm");
    if (form) form.setAttribute("action", "mailto:" + loc.email);

    // Update the location panels under #standorte
    document.querySelectorAll(".loc-panel").forEach(function (panel) {
      panel.classList.toggle("active", panel.id === "panel-" + key);
    });

    // Update the team panels under #team
    document.querySelectorAll("[data-team-panel]").forEach(function (panel) {
      panel.classList.toggle("active", panel.getAttribute("data-team-panel") === key);
    });

    // Highlight the doctor who practices at the selected location
    document.querySelectorAll(".doctor-card[data-loc]").forEach(function (card) {
      card.classList.toggle("loc-active", card.getAttribute("data-loc") === key);
    });

    // Preselect matching option in the contact form
    var select = document.getElementById("location");
    if (select) {
      var match = key === "hagen" ? "Hagen-Boele" : "Ennepetal";
      Array.prototype.forEach.call(select.options, function (opt) {
        if (opt.value === match) select.value = match;
      });
    }
  }

  document.addEventListener("click", function (e) {
    var btn = e.target.closest("[data-loc]");
    if (!btn) return;
    setActiveLocation(btn.getAttribute("data-loc"));
  });

  // Keep the mailto target in sync if the visitor changes the dropdown directly
  var locationSelect = document.getElementById("location");
  if (locationSelect) {
    locationSelect.addEventListener("change", function () {
      var key = locationSelect.value === "Ennepetal" ? "ennepetal" : "hagen";
      var form = document.getElementById("contactForm");
      if (form) form.setAttribute("action", "mailto:" + LOCATIONS[key].email);
    });
  }

  // Mobile nav toggle
  var navToggle = document.getElementById("navToggle");
  var navLinks = document.getElementById("navLinks");
  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      navLinks.classList.toggle("open");
    });
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
      });
    });
  }

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Init default location
  setActiveLocation("hagen");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ---------- Leistungen filter ----------
  var leistungenGrid = document.getElementById("leistungenGrid");
  var leistungenEmpty = document.getElementById("leistungenEmpty");
  if (leistungenGrid) {
    var filterBtns = Array.prototype.slice.call(document.querySelectorAll(".filter-btn"));
    var filterPill = document.getElementById("filterPill");

    var movePill = function (btn) {
      if (!filterPill || !btn) return;
      filterPill.style.left = btn.offsetLeft + "px";
      filterPill.style.top = btn.offsetTop + "px";
      filterPill.style.width = btn.offsetWidth + "px";
      filterPill.style.height = btn.offsetHeight + "px";
    };

    var applyFilter = function (filter) {
      var items = leistungenGrid.querySelectorAll(".leistung-item");
      var visibleCount = 0;
      var i = 0;
      items.forEach(function (item) {
        var match = filter === "all" || item.getAttribute("data-category") === filter;
        if (match) {
          item.style.display = "";
          visibleCount++;
          if (!prefersReducedMotion) {
            item.style.animationDelay = i * 30 + "ms";
            item.classList.remove("leistung-anim");
            void item.offsetWidth; // restart animation
            item.classList.add("leistung-anim");
          }
          i++;
        } else {
          item.style.display = "none";
          item.classList.remove("open");
          item.setAttribute("aria-expanded", "false");
        }
      });
      if (leistungenEmpty) leistungenEmpty.hidden = visibleCount > 0;
    };

    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) {
          b.classList.toggle("active", b === btn);
          b.setAttribute("aria-selected", b === btn ? "true" : "false");
        });
        movePill(btn);
        applyFilter(btn.getAttribute("data-filter"));
      });
    });

    var activeFilterBtn = filterBtns.filter(function (b) { return b.classList.contains("active"); })[0];
    movePill(activeFilterBtn);
    window.addEventListener("resize", function () {
      var current = filterBtns.filter(function (b) { return b.classList.contains("active"); })[0];
      movePill(current);
    });

    // Accordion: click a Leistung to reveal its short description
    leistungenGrid.querySelectorAll(".leistung-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var isOpen = item.classList.contains("open");
        leistungenGrid.querySelectorAll(".leistung-item.open").forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove("open");
            openItem.setAttribute("aria-expanded", "false");
          }
        });
        item.classList.toggle("open", !isOpen);
        item.setAttribute("aria-expanded", String(!isOpen));
      });
    });
  }

  // ---------- Scroll reveal ----------
  var revealTargets = document.querySelectorAll(
    ".section-head, .service-card, .doctor-card, .team-card, " +
    ".process-card, .contact-card, .loc-tab, .cta-band, .hero-loc, " +
    ".leistungen-stat, .gallery-item, .digital-card, .qr-card"
  );

  if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
    revealTargets.forEach(function (el) { el.classList.add("reveal", "in-view"); });
  } else {
    // Stagger siblings within the same parent so grids animate in sequence
    var delayCounters = new Map();
    revealTargets.forEach(function (el) {
      el.classList.add("reveal");
      var parent = el.parentElement;
      var n = (delayCounters.get(parent) || 0);
      delayCounters.set(parent, n + 1);
      el.style.transitionDelay = Math.min(n * 70, 420) + "ms";
    });

    var revealObserver = new IntersectionObserver(
      function (entries, observer) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    revealTargets.forEach(function (el) { revealObserver.observe(el); });
  }

  // ---------- Count-up numbers (hero stats + leistungen stats) ----------
  var runCount = function (el) {
    var target = parseInt(el.getAttribute("data-count"), 10) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    if (prefersReducedMotion) {
      el.textContent = target + suffix;
      return;
    }
    var start = null;
    var duration = 900;
    var step = function (ts) {
      if (start === null) start = ts;
      var progress = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // Hero stats: count up shortly after page load, since they're above the fold
  var heroCountEls = document.querySelectorAll(".hero-stat b[data-count]");
  if (heroCountEls.length) {
    setTimeout(function () { heroCountEls.forEach(runCount); }, 500);
  }

  // Leistungen stats: count up once scrolled into view
  var leistungenCountEls = document.querySelectorAll(".leistungen-stat b[data-count]");
  if (leistungenCountEls.length) {
    if (prefersReducedMotion || typeof IntersectionObserver === "undefined") {
      leistungenCountEls.forEach(runCount);
    } else {
      var statObserver = new IntersectionObserver(
        function (entries, observer) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              runCount(entry.target);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.6 }
      );
      leistungenCountEls.forEach(function (el) { statObserver.observe(el); });
    }
  }

  // ---------- Scroll progress bar ----------
  var progressBar = document.getElementById("scrollProgress");
  if (progressBar) {
    var updateProgress = function () {
      var scrollTop = window.scrollY || document.documentElement.scrollTop;
      var docHeight = document.documentElement.scrollHeight - window.innerHeight;
      var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = pct + "%";
    };
    document.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);
    updateProgress();
  }

  // ---------- Scroll-spy: highlight the current section in the nav ----------
  var navAnchors = Array.prototype.slice.call(document.querySelectorAll(".nav-links a[href^='#']"));
  if (navAnchors.length && typeof IntersectionObserver !== "undefined") {
    var sectionMap = navAnchors
      .map(function (a) {
        var id = a.getAttribute("href").slice(1);
        var section = document.getElementById(id);
        return section ? { link: a, section: section } : null;
      })
      .filter(Boolean);

    var setCurrent = function (id) {
      navAnchors.forEach(function (a) {
        a.classList.toggle("current", a.getAttribute("href") === "#" + id);
      });
    };

    var spyObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setCurrent(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    sectionMap.forEach(function (item) { spyObserver.observe(item.section); });
  }

  // ---------- Doctor card 3D tilt-on-hover ----------
  if (!prefersReducedMotion && window.matchMedia("(hover: hover)").matches) {
    document.querySelectorAll(".doctor-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateY(" + (x * 6) + "deg) rotateX(" + (y * -6) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "";
      });
    });
  }

  // ---------- Gallery lightbox ----------
  var lightbox = document.getElementById("lightbox");
  if (lightbox) {
    var lightboxImg = document.getElementById("lightboxImg");
    var lightboxCaption = document.getElementById("lightboxCaption");
    var lightboxClose = document.getElementById("lightboxClose");
    var lastFocused = null;

    var openLightbox = function (src, caption) {
      lastFocused = document.activeElement;
      lightboxImg.src = src;
      lightboxImg.alt = caption;
      lightboxCaption.textContent = caption;
      lightbox.classList.add("open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
      lightboxClose.focus();
    };
    var closeLightbox = function () {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
      document.body.style.overflow = "";
      if (lastFocused) lastFocused.focus();
    };

    document.querySelectorAll(".gallery-item").forEach(function (item) {
      item.addEventListener("click", function () {
        openLightbox(item.getAttribute("data-full"), item.getAttribute("data-caption"));
      });
    });
    lightboxClose.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && lightbox.classList.contains("open")) closeLightbox();
    });
  }
})();
