(function () {
  "use strict";

  function trackEvent(name, parameters) {
    if (!name) return;

    var details = Object.assign({ page_location: window.location.href }, parameters || {});
    if (typeof window.gtag === "function") {
      window.gtag("event", name, details);
      return;
    }

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: name }, details));
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("Copy failed"));
      } catch (error) {
        reject(error);
      }
      field.remove();
    });
  }

  function setupCopyButtons() {
    document.querySelectorAll("[data-copy-code]").forEach(function (container) {
      var button = container.querySelector(".axyra-copy-button");
      var code = container.querySelector("code");
      if (!button || !code) return;

      button.addEventListener("click", function () {
        copyText(code.textContent.replace(/\n$/, "")).then(function () {
          var label = button.querySelector("span");
          button.classList.add("is-copied");
          label.textContent = "Copied";
          trackEvent(container.dataset.copyEvent, {
            copy_type: "code",
            code_language: (code.className.match(/language-([^\s]+)/) || [])[1] || "text"
          });
          window.setTimeout(function () {
            button.classList.remove("is-copied");
            label.textContent = "Copy";
          }, 1800);
        });
      });
    });
  }

  function setupTrackedLinks() {
    document.querySelectorAll("[data-ga-event]").forEach(function (link) {
      link.addEventListener("click", function () {
        trackEvent(link.dataset.gaEvent, {
          link_url: link.href,
          link_text: link.textContent.trim()
        });
      });
    });
  }

  // Storage can be blocked (private windows, strict settings); every lead
  // feature must still work without it.
  function stored(key, value) {
    try {
      if (value === undefined) return window.localStorage.getItem(key);
      window.localStorage.setItem(key, value);
    } catch (error) {
      return null;
    }
    return value;
  }

  function queryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  // A stable variant per browser so one developer sees the same copy on every
  // visit; `?cta_variant=generic` forces one for review.
  function ctaVariant(variants) {
    var forced = queryParam("cta_variant");
    if (variants.indexOf(forced) >= 0) return forced;
    var saved = stored("axyra-cta-variant");
    if (variants.indexOf(saved) >= 0) return saved;
    var chosen = variants[Math.floor(Math.random() * variants.length)];
    stored("axyra-cta-variant", chosen);
    return chosen;
  }

  function ctaDetails(cta) {
    return {
      touchpoint: cta.dataset.touchpoint || "unknown",
      lead_type: cta.dataset.leadType,
      cta_variant: cta.dataset.variant || "default"
    };
  }

  function setupCtas() {
    var ctas = document.querySelectorAll("[data-axyra-cta]");
    var seen = new WeakSet();
    var observer = "IntersectionObserver" in window && new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting || seen.has(entry.target)) return;
        seen.add(entry.target);
        observer.unobserve(entry.target);
        trackEvent("axyra_cta_impression", ctaDetails(entry.target));
      });
    }, { threshold: 0.5 });

    ctas.forEach(function (cta) {
      if (cta.dataset.ab) {
        var variant = ctaVariant(cta.dataset.ab.split(","));
        cta.dataset.variant = variant;
        cta.querySelectorAll("[data-cta-variant]").forEach(function (copy) {
          copy.hidden = copy.dataset.ctaVariant !== variant;
        });
      }

      var link = cta.querySelector("[data-cta-link]");
      if (link) {
        var url = new URL(link.href, window.location.href);
        url.searchParams.set("cta", cta.dataset.variant || "default");
        link.href = url.toString();
        link.addEventListener("click", function () {
          trackEvent("axyra_cta_click", ctaDetails(cta));
        });
      }
      if (observer) observer.observe(cta);
    });
  }

  // Developer updates are handled by the keikai.io contact form. Open it in a
  // new tab with the product and message prefilled; the email goes in the
  // fragment, which never reaches server logs or analytics page URLs.
  function openUpdatesContact(form, email) {
    var url = new URL(form.dataset.contactUrl);
    url.searchParams.set("product", form.dataset.product);
    url.searchParams.set("message", form.dataset.message);
    url.searchParams.set("src", form.dataset.touchpoint || "unknown");
    url.searchParams.set("cta", "default");
    url.hash = "email=" + encodeURIComponent(email);
    window.open(url.toString(), "_blank", "noopener");
  }

  // The download is never held back: the invitation opens as a dialog after
  // the click starts it. It stays closed once this browser has continued to
  // the sign-up form.
  function setupDownloadCompletion() {
    var dialog = document.querySelector("[data-download-complete]");
    if (!dialog || typeof dialog.showModal !== "function") return;

    function close(reason) {
      if (!dialog.open) return;
      dialog.close();
      trackEvent("axyra_cta_dismiss", { touchpoint: "download_complete", reason: reason });
    }

    document.querySelectorAll("[data-download-trigger]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (dialog.open || stored("axyra-subscribed")) return;
        // Let the browser start the download before the dialog takes focus.
        window.setTimeout(function () {
          dialog.showModal();
          var email = dialog.querySelector('input[type="email"]');
          if (email) email.focus();
          trackEvent("axyra_cta_impression", {
            touchpoint: "download_complete",
            lead_type: "subscribe",
            cta_variant: "default"
          });
        }, 150);
      });
    });
    dialog.querySelectorAll("[data-dialog-close]").forEach(function (button) {
      button.addEventListener("click", function () { close("button"); });
    });
    dialog.addEventListener("cancel", function (event) {
      event.preventDefault();
      close("escape");
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) close("backdrop");
    });

    var form = dialog.querySelector("[data-axyra-updates-form]");
    if (!form) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var field = form.elements.email;
      var email = field.value.trim();
      var invalid = !email || !field.checkValidity();
      field.toggleAttribute("aria-invalid", invalid);
      if (invalid) {
        showStatus(form, "error", "Please enter a valid email address.");
        field.focus();
        return;
      }
      openUpdatesContact(form, email);
      stored("axyra-subscribed", "1");
      trackEvent("axyra_cta_click", {
        touchpoint: form.dataset.touchpoint,
        lead_type: "subscribe",
        cta_variant: "default"
      });
      form.reset();
      dialog.close();
    });
  }

  // Not cryptographic: only keeps raw email addresses out of local storage
  // when remembering what this browser already submitted.
  function fingerprint(text) {
    var hash = 2166136261;
    for (var i = 0; i < text.length; i++) {
      hash ^= text.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(16);
  }

  function formPayload(form) {
    var data = new FormData(form);
    var payload = {
      lead_type: form.dataset.leadType,
      touchpoint: form.dataset.touchpoint || queryParam("src") || "unknown",
      cta_variant: queryParam("cta") || "unknown",
      campaign: form.dataset.campaign || "",
      page: window.location.pathname,
      referrer: document.referrer || "",
      submitted_at: new Date().toISOString()
    };
    data.forEach(function (value, key) {
      if (key === "website") return;
      if (key === "topics") {
        (payload.topics = payload.topics || []).push(value);
      } else {
        payload[key] = typeof value === "string" ? value.trim() : value;
      }
    });
    return payload;
  }

  function validate(form, payload) {
    var problems = [];
    form.querySelectorAll("[required]").forEach(function (field) {
      var invalid = !field.value.trim() || (field.type === "email" && !field.checkValidity());
      field.toggleAttribute("aria-invalid", invalid);
      if (invalid) problems.push(field.closest("label").querySelector("span").textContent.replace(/\s*\(optional\)$/, ""));
    });
    var topics = form.querySelector(".axyra-topics");
    if (topics) {
      var none = !(payload.topics && payload.topics.length);
      topics.toggleAttribute("aria-invalid", none);
      if (none) problems.push("at least one topic");
    }
    return problems;
  }

  function showStatus(form, kind, message, payload) {
    var status = form.querySelector(".axyra-form-status");
    status.className = "axyra-form-status is-" + kind;
    status.replaceChildren();
    var text = document.createElement("p");
    text.textContent = message;
    status.appendChild(text);
    if (payload) {
      var pre = document.createElement("pre");
      pre.textContent = JSON.stringify(payload, null, 2);
      status.appendChild(pre);
    }
  }

  var SUCCESS = {
    evaluation: "Thanks. Your request has been sent to our developer support team, who will reply by email.",
    commercial: "Thanks. Your inquiry has been sent to our sales team, who will reply by email."
  };

  function setupLeadForms() {
    document.querySelectorAll("[data-axyra-lead-form]").forEach(function (form) {
      var preset = queryParam("topic");
      if (preset) {
        form.querySelectorAll('input[name="topics"]').forEach(function (box) {
          box.checked = box.value === preset;
        });
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();
        if (form.elements.website && form.elements.website.value) return;

        var payload = formPayload(form);
        var problems = validate(form, payload);
        if (problems.length) {
          showStatus(form, "error", "Please complete: " + problems.join(", ") + ".");
          return;
        }

        var key = "axyra-lead:" + payload.lead_type + ":" + fingerprint(payload.email.toLowerCase());
        payload.repeat_submission = !!stored(key);
        var analytics = {
          lead_type: payload.lead_type,
          touchpoint: payload.touchpoint,
          cta_variant: payload.cta_variant,
          repeat_submission: payload.repeat_submission,
          topics: (payload.topics || []).join(",")
        };

        function done() {
          stored(key, payload.submitted_at);
          trackEvent("axyra_lead_submit", analytics);
        }

        var endpoint = form.dataset.endpoint;
        if (!endpoint) {
          done();
          if (window.console) console.info("[axyra lead preview]", payload);
          showStatus(form, "preview",
            "Preview mode: no endpoint is configured in _config.yml (axyra_leads), so nothing was sent. A live endpoint would receive:",
            payload);
          return;
        }

        var button = form.querySelector('button[type="submit"]');
        button.disabled = true;
        fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).then(function (response) {
          if (!response.ok) throw new Error("HTTP " + response.status);
          done();
          form.reset();
          showStatus(form, "success", SUCCESS[payload.lead_type] || SUCCESS.evaluation);
        }).catch(function () {
          trackEvent("axyra_lead_error", analytics);
          showStatus(form, "error", "Sorry, the form could not be sent. Please try again later.");
        }).then(function () {
          button.disabled = false;
        });
      });
    });
  }

  function normalize(value) {
    return (value || "").toLocaleLowerCase();
  }

  function excerpt(body, terms) {
    var compact = (body || "").replace(/\s+/g, " ").trim();
    var lower = normalize(compact);
    var firstMatch = -1;
    terms.some(function (term) {
      firstMatch = lower.indexOf(term);
      return firstMatch >= 0;
    });
    var start = Math.max(0, firstMatch - 70);
    var text = compact.slice(start, start + 190);
    return (start ? "…" : "") + text + (start + 190 < compact.length ? "…" : "");
  }

  function setupSearch() {
    var search = document.getElementById("axyra-search");
    var toggle = document.querySelector("[data-axyra-search-toggle]");
    if (!search || !toggle) return;

    var input = document.getElementById("axyra-search-input");
    var results = document.getElementById("axyra-search-results");
    var status = document.getElementById("axyra-search-status");
    var indexPromise;
    var lastFocus;

    function loadIndex() {
      if (!indexPromise) {
        indexPromise = fetch(search.dataset.searchIndex, { credentials: "same-origin" })
          .then(function (response) {
            if (!response.ok) throw new Error("Search index unavailable");
            return response.json();
          });
      }
      return indexPromise;
    }

    function openSearch() {
      lastFocus = document.activeElement;
      search.hidden = false;
      document.body.classList.add("axyra-search-open");
      toggle.setAttribute("aria-expanded", "true");
      window.setTimeout(function () { input.focus(); }, 0);
      loadIndex().catch(function () {
        status.textContent = "Search is temporarily unavailable. Please try again later.";
      });
    }

    function closeSearch() {
      search.hidden = true;
      document.body.classList.remove("axyra-search-open");
      toggle.setAttribute("aria-expanded", "false");
      if (lastFocus) lastFocus.focus();
    }

    function render(items, terms) {
      results.replaceChildren();
      items.slice(0, 12).forEach(function (item) {
        var row = document.createElement("li");
        var link = document.createElement("a");
        var summary = document.createElement("p");
        row.className = "axyra-search__result";
        link.href = item.url;
        link.textContent = item.title;
        summary.textContent = excerpt(item.content, terms);
        row.append(link, summary);
        results.appendChild(row);
      });
    }

    function searchIndex(query) {
      var terms = normalize(query).trim().split(/\s+/).filter(Boolean);
      if (!terms.length) {
        results.replaceChildren();
        status.textContent = "Start typing to search Axyra documentation.";
        return;
      }

      status.textContent = "Searching…";
      loadIndex().then(function (index) {
        var matches = index.map(function (item) {
          var title = normalize(item.title);
          var content = normalize(item.content);
          var matchesAll = terms.every(function (term) {
            return title.indexOf(term) >= 0 || content.indexOf(term) >= 0;
          });
          if (!matchesAll) return null;
          var score = terms.reduce(function (total, term) {
            return total + (title.indexOf(term) >= 0 ? 10 : 1);
          }, 0);
          return { item: item, score: score };
        }).filter(Boolean).sort(function (a, b) {
          return b.score - a.score || a.item.title.localeCompare(b.item.title);
        }).map(function (match) { return match.item; });

        render(matches, terms);
        var shown = Math.min(matches.length, 12);
        status.textContent = !matches.length
          ? "No Axyra documentation matched your search."
          : shown < matches.length
            ? "Showing " + shown + " of " + matches.length + " results"
            : matches.length + (matches.length === 1 ? " result" : " results");
      }).catch(function () {
        results.replaceChildren();
        status.textContent = "Search is temporarily unavailable. Please try again later.";
      });
    }

    toggle.addEventListener("click", openSearch);
    search.querySelectorAll("[data-search-close]").forEach(function (button) {
      button.addEventListener("click", closeSearch);
    });
    input.addEventListener("input", function () { searchIndex(input.value); });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && !search.hidden) closeSearch();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupCopyButtons();
    setupTrackedLinks();
    setupCtas();
    setupDownloadCompletion();
    setupLeadForms();
    setupSearch();
  });
}());
