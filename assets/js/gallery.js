"use strict";

const galleries = document.querySelectorAll("[data-gallery], .gallery");

if (galleries.length) {
  const dialog = document.createElement("dialog");
  dialog.className = "image-dialog";
  dialog.innerHTML = '<button type="button" class="image-dialog-close" aria-label="关闭图片">×</button><button type="button" class="image-dialog-prev" aria-label="上一张">‹</button><img alt=""><button type="button" class="image-dialog-next" aria-label="下一张">›</button><p class="image-dialog-caption"></p>';
  document.body.append(dialog);

  const image = dialog.querySelector("img");
  const caption = dialog.querySelector(".image-dialog-caption");
  let items = [];
  let current = 0;
  let opener = null;

  function show(index) {
    current = (index + items.length) % items.length;
    const source = items[current];
    image.src = source.dataset.full || source.currentSrc || source.src;
    image.alt = source.alt || "";
    caption.textContent = source.closest("figure")?.querySelector("figcaption")?.textContent || source.alt || "";
  }

  for (const gallery of galleries) {
    const images = [...gallery.querySelectorAll("figure img")];
    for (const item of images) {
      item.tabIndex = 0;
      item.setAttribute("role", "button");
      item.setAttribute("aria-label", `预览图片：${item.alt || "照片"}`);
      const open = () => {
        items = images;
        opener = item;
        show(images.indexOf(item));
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

  dialog.querySelector(".image-dialog-close").addEventListener("click", () => dialog.close());
  dialog.querySelector(".image-dialog-prev").addEventListener("click", () => show(current - 1));
  dialog.querySelector(".image-dialog-next").addEventListener("click", () => show(current + 1));
  dialog.addEventListener("click", event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener("keydown", event => {
    if (event.key === "ArrowLeft") show(current - 1);
    if (event.key === "ArrowRight") show(current + 1);
  });
  dialog.addEventListener("close", () => {
    image.removeAttribute("src");
    opener?.focus();
  });
}
