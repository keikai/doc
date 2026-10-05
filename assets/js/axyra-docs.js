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
        status.textContent = matches.length
          ? matches.length + (matches.length === 1 ? " result" : " results")
          : "No Axyra documentation matched your search.";
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
    setupSearch();
  });
}());
