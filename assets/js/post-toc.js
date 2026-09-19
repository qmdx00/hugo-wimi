(() => {
  const toc = document.querySelector("[data-post-toc]");
  const article = document.querySelector("[data-post-article]");
  if (!toc || !article) return;

  const details = toc.querySelector("details");
  const preferOpen = toc.dataset.tocOpen !== "false";
  const desktop = window.matchMedia("(min-width: 1320px)");
  function syncOpen() {
    if (!details) return;
    details.open = desktop.matches && preferOpen;
  }
  syncOpen();
  desktop.addEventListener("change", syncOpen);

  const entries = [...toc.querySelectorAll('a[href^="#"]')]
    .map((link) => {
      const id = decodeURIComponent(link.hash.slice(1));
      const heading = document.getElementById(id);
      return heading && article.contains(heading) ? { link, heading } : null;
    })
    .filter(Boolean);
  if (!entries.length) return;

  let scheduled = false;
  function updateActive() {
    const threshold = Math.min(window.innerHeight * 0.25, 160);
    let active = entries[0];
    for (const entry of entries) {
      if (entry.heading.getBoundingClientRect().top > threshold) break;
      active = entry;
    }
    for (const entry of entries) {
      const isActive = entry === active;
      entry.link.classList.toggle("is-active", isActive);
      if (isActive) entry.link.setAttribute("aria-current", "location");
      else entry.link.removeAttribute("aria-current");
    }
    scheduled = false;
  }
  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(updateActive);
  }
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  scheduleUpdate();
})();
