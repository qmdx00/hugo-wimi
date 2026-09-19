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
  const frame = document.createElement("div");
  frame.className = "image-dialog-frame";
  const image = document.createElement("img");
  image.alt = "";
  frame.append(image);
  dialog.append(closeButton, frame);
  document.body.append(dialog);
  let opener = null;

  function show(source) {
    const thumb = source.tagName === "IMG" ? source : source.querySelector("img");
    image.src = source.dataset.full || thumb?.dataset.full || thumb?.currentSrc || thumb?.src || "";
    image.alt = thumb?.alt || "";
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
        opener = item;
        show(item);
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
  dialog.addEventListener("click", event => {
    if (event.target === dialog || event.target === frame) dialog.close();
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    document.body.style.overflow = "";
    opener?.focus();
  });
}
