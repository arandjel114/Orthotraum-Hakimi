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
    var filterBtns = document.querySelectorAll(".filter-btn");
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
        applyFilter(btn.getAttribute("data-filter"));
      });
    });
  }

  // ---------- Scroll reveal ----------
  var revealTargets = document.querySelectorAll(
    ".section-head, .service-card, .doctor-card, .team-card, .quote-card, " +
    ".process-card, .contact-card, .loc-tab, .cta-band, .hero-loc"
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

  // ---------- Hero stat count-up ----------
  var countEls = document.querySelectorAll(".hero-stat b[data-count]");
  if (countEls.length) {
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
    setTimeout(function () {
      countEls.forEach(runCount);
    }, 500);
  }
})();
