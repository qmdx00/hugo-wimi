"use strict";

(function () {
  const KEY = "wimi-color-mode";
  const ORDER = ["system", "light", "dark"];
  const root = document.documentElement;
  const labelNode = document.querySelector("[data-theme-label]");
  const button = document.querySelector("[data-theme-toggle]");
  const i18n = document.getElementById("wimi-theme-i18n");
  const labels = {
    system: (i18n && i18n.dataset.system) || "System",
    light: (i18n && i18n.dataset.light) || "Light",
    dark: (i18n && i18n.dataset.dark) || "Dark",
  };

  function readMode() {
    try {
      const stored = localStorage.getItem(KEY);
      if (stored === "light" || stored === "dark" || stored === "system") return stored;
    } catch (e) {}
    return root.dataset.themePref || "system";
  }

  function apply(mode) {
    if (mode === "light" || mode === "dark") root.setAttribute("data-theme", mode);
    else root.removeAttribute("data-theme");
    if (labelNode) labelNode.textContent = labels[mode] || labels.system;
    if (button) {
      button.setAttribute("aria-label", (i18n && i18n.dataset.toggle) || "Color mode");
      button.dataset.mode = mode;
    }
  }

  function persist(mode) {
    try {
      if (mode === "system") localStorage.removeItem(KEY);
      else localStorage.setItem(KEY, mode);
    } catch (e) {}
  }

  let mode = readMode();
  apply(mode);

  if (button) {
    button.addEventListener("click", () => {
      const idx = ORDER.indexOf(mode);
      mode = ORDER[(idx + 1) % ORDER.length];
      persist(mode);
      apply(mode);
    });
  }
})();
