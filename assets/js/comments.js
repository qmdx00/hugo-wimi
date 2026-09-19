"use strict";

function messages() {
  const node = document.getElementById("wimi-i18n");
  return node ? node.dataset : {};
}

const msg = messages();
let turnstileLoading = null;

function loadTurnstile() {
  if (window.turnstile) return Promise.resolve();
  if (turnstileLoading) return turnstileLoading;
  turnstileLoading = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("turnstile"));
    document.head.append(script);
  });
  return turnstileLoading;
}

for (const root of document.querySelectorAll("[data-comments]")) {
  const api = root.dataset.apiBase;
  const pageKey = root.dataset.pageKey;
  const list = root.querySelector("[data-comment-list]");
  const form = root.querySelector("[data-comment-form]");
  const status = root.querySelector("[data-comment-status]");
  const count = root.querySelector("[data-comment-count]");
  const more = root.querySelector("[data-load-more]");
  let cursor = null;

  function entry(comment) {
    const article = document.createElement("article");
    article.className = "comment-entry";
    const header = document.createElement("div");
    header.className = "comment-entry-header";
    const author = document.createElement(comment.website ? "a" : "strong");
    author.textContent = comment.author;
    if (comment.website) {
      author.href = comment.website;
      author.rel = "nofollow ugc noopener noreferrer";
    }
    const time = document.createElement("time");
    time.dateTime = comment.created_at;
    time.textContent = new Date(comment.created_at).toLocaleDateString(document.documentElement.lang || "zh-CN");
    header.append(author, time);
    const body = document.createElement("p");
    body.textContent = comment.body;
    article.append(header, body);
    return article;
  }

  async function load(append = false) {
    try {
      const url = new URL(api, location.origin);
      url.searchParams.set("page", pageKey);
      if (append && cursor) url.searchParams.set("cursor", cursor);
      const response = await fetch(url, { headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(msg.loadError || "无法加载评论");
      const result = await response.json();
      if (!append) {
        list.classList.remove("is-loading");
        list.replaceChildren();
      }
      for (const comment of result.items) list.append(entry(comment));
      if (!result.items.length && !append) {
        const empty = document.createElement("p");
        empty.className = "empty-state";
        empty.textContent = msg.empty || "还没有留言，欢迎留下第一条。";
        list.append(empty);
      }
      count.textContent = result.total ? (msg.count || "%s 条").replace("%s", result.total) : "";
      cursor = result.nextCursor;
      more.hidden = !cursor;
    } catch {
      list.classList.remove("is-loading");
      if (!append) list.textContent = msg.unavailable || "评论暂时不可用，文章仍可正常阅读。";
      more.hidden = true;
    }
  }

  if (form && form.querySelector(".cf-turnstile")) {
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      loadTurnstile().catch(() => {});
    }, { rootMargin: "200px" });
    observer.observe(form);
  }

  more.addEventListener("click", () => load(true));
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const button = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    button.disabled = true;
    status.textContent = msg.submitting || "正在提交…";
    try {
      const response = await fetch(api, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          page: pageKey,
          author: data.get("author"),
          website: data.get("website"),
          body: data.get("body"),
          turnstileToken: data.get("cf-turnstile-response"),
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || msg.submitFail || "提交失败");
      form.reset();
      status.textContent = msg.submitted || "提交成功，审核通过后会显示。";
    } catch (error) {
      status.textContent = error.message;
    } finally {
      button.disabled = false;
      if (window.turnstile) window.turnstile.reset();
    }
  });

  load();
}
