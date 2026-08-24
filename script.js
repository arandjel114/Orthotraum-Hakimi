(function () {
  "use strict";

  var LOCATIONS = {
    hagen: {
      name: "Hagen-Boele",
      address: "Denkmalstr. 3, 58099 Hagen",
      phone: "02331 632463",
      phoneHref: "tel:+492331632463"
    },
    ennepetal: {
      name: "Ennepetal",
      address: "Königsberger Str. 66, 58256 Ennepetal",
      phone: "02333 75856",
      phoneHref: "tel:+49233375856"
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

    // Update the location panels under #standorte
    document.querySelectorAll(".loc-panel").forEach(function (panel) {
      panel.classList.toggle("active", panel.id === "panel-" + key);
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
})();
