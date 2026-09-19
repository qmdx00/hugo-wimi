"use strict";

function markPhotoLoaded(img) {
  img.classList.add("is-loaded");
}

for (const img of document.querySelectorAll(".card-media img, .photo-card img")) {
  if (img.complete && img.naturalWidth) markPhotoLoaded(img);
  else {
    img.addEventListener("load", () => markPhotoLoaded(img), { once: true });
    img.addEventListener("error", () => markPhotoLoaded(img), { once: true });
  }
}

function messages() {
  const node = document.getElementById("wimi-i18n");
  return node ? node.dataset : {};
}

const galleries = document.querySelectorAll("[data-gallery], .gallery");

if (galleries.length) {
  const msg = messages();
  const dialog = document.createElement("dialog");
  dialog.className = "image-dialog";

  function dialogButton(className, label, text) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.setAttribute("aria-label", label);
    button.textContent = text;
    return button;
  }

  const closeButton = dialogButton("image-dialog-close", msg.galleryClose || "关闭图片", "×");
  const prevButton = dialogButton("image-dialog-prev", msg.galleryPrev || "上一张", "‹");
  const nextButton = dialogButton("image-dialog-next", msg.galleryNext || "下一张", "›");
  const stage = document.createElement("div");
  stage.className = "image-dialog-stage";
  const image = document.createElement("img");
  image.alt = "";
  const meta = document.createElement("div");
  meta.className = "image-dialog-meta";
  const caption = document.createElement("p");
  caption.className = "image-dialog-caption";
  const counter = document.createElement("p");
  counter.className = "image-dialog-counter";
  meta.append(caption, counter);
  stage.append(image, meta);
  dialog.append(closeButton, prevButton, stage, nextButton);
  document.body.append(dialog);
  let items = [];
  let current = 0;
  let opener = null;

  function updateNav() {
    const multi = items.length > 1;
    prevButton.hidden = !multi;
    nextButton.hidden = !multi;
  }

  function formatCounter(index, total) {
    const template = msg.galleryCounter || "%s / %s";
    return template.replace("%s", String(index)).replace("%s", String(total));
  }

  function show(index) {
    current = (index + items.length) % items.length;
    const source = items[current];
    const thumb = source.tagName === "IMG" ? source : source.querySelector("img");
    image.src = source.dataset.full || thumb?.dataset.full || thumb?.currentSrc || thumb?.src || "";
    image.alt = thumb?.alt || "";
    caption.textContent = source.closest("figure")?.querySelector("figcaption")?.textContent || thumb?.alt || "";
    counter.textContent = formatCounter(current + 1, items.length);
    counter.hidden = items.length < 1;
    updateNav();
  }

  for (const gallery of galleries) {
    const triggers = [...gallery.querySelectorAll("figure button[data-full], figure img")]
      .filter(item => item.tagName !== "IMG" || !item.closest("button[data-full]"));
    for (const item of triggers) {
      const thumb = item.tagName === "IMG" ? item : item.querySelector("img");
      if (item.tagName === "IMG") {
        item.tabIndex = 0;
        item.setAttribute("role", "button");
      }
      const label = (msg.galleryPreview || "预览图片：%s").replace("%s", thumb?.alt || msg.galleryPhoto || "照片");
      item.setAttribute("aria-label", label);
      const open = () => {
        items = triggers;
        opener = item;
        show(triggers.indexOf(item));
        document.body.style.overflow = "hidden";
        dialog.showModal();
      };
      item.addEventListener("click", open);
      if (item.tagName === "IMG") item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") { event.preventDefault(); open(); }
      });
    }
  }

  closeButton.addEventListener("click", () => dialog.close());
  prevButton.addEventListener("click", () => show(current - 1));
  nextButton.addEventListener("click", () => show(current + 1));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", event => {
    if (items.length < 2) return;
    if (event.key === "ArrowLeft") { event.preventDefault(); show(current - 1); }
    if (event.key === "ArrowRight") { event.preventDefault(); show(current + 1); }
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    document.body.style.overflow = "";
    opener?.focus();
  });
}
