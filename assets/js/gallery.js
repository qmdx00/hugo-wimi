"use strict";

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
  const image = document.createElement("img");
  image.alt = "";
  const caption = document.createElement("p");
  caption.className = "image-dialog-caption";
  const counter = document.createElement("p");
  counter.className = "image-dialog-counter";
  dialog.append(closeButton, prevButton, image, nextButton, caption, counter);
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
    image.src = source.dataset.full || source.currentSrc || source.src;
    image.alt = source.alt || "";
    caption.textContent = source.closest("figure")?.querySelector("figcaption")?.textContent || source.alt || "";
    counter.textContent = formatCounter(current + 1, items.length);
    counter.hidden = items.length < 1;
    updateNav();
  }

  for (const gallery of galleries) {
    const images = [...gallery.querySelectorAll("figure img")];
    for (const item of images) {
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      const label = (msg.galleryPreview || "预览图片：%s").replace("%s", item.alt || msg.galleryPhoto || "照片");
      item.setAttribute("aria-label", label);
      const open = () => {
        items = images;
        opener = item;
        show(images.indexOf(item));
        document.body.style.overflow = "hidden";
        dialog.showModal();
      };
      item.addEventListener("click", open);
      item.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          open();
        }
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
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    document.body.style.overflow = "";
    opener?.focus();
  });
}
