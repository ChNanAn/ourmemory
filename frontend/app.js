const state = {
  food: [],
  travel: [],
  hobby: [],
  wish: [],
};

const api = {
  async get(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async post(path, payload) {
    const response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async patch(path, payload) {
    const response = await fetch(path, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(await response.text());
    return response.json();
  },
  async delete(path) {
    const response = await fetch(path, { method: "DELETE" });
    if (!response.ok) throw new Error(await response.text());
  },
};

function $(selector) {
  return document.querySelector(selector);
}

function emptyNode() {
  return $("#empty-template").content.firstElementChild.cloneNode(true);
}

function formatDate(value) {
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch("/api/upload", { method: "POST", body: formData });
  if (!response.ok) throw new Error(await response.text());
  return response.json();
}

async function uploadFiles(files) {
  const uploads = Array.from(files || []).map((file) => uploadFile(file));
  return Promise.all(uploads);
}

function switchView(view) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === `${view}-view`);
  });
}

function imageMarkup(src, alt) {
  if (!src) return '<div class="placeholder-image" aria-hidden="true"></div>';
  return `<img class="record-image" src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" />`;
}

function renderFood() {
  const list = $("#food-list");
  list.innerHTML = "";
  if (!state.food.length) {
    list.append(emptyNode());
    return;
  }

  state.food.forEach((item) => {
    const article = document.createElement("article");
    article.className = "record-card";
    article.innerHTML = `
      ${imageMarkup(item.image, item.title)}
      <div class="card-body">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="note">${escapeHtml(item.note || "还没有备注。")}</p>
        <div class="meta">
          <span>${escapeHtml(item.location || "未记录位置")}</span>
          <span>${escapeHtml(item.rating ? `${item.rating}/5` : "未评分")}</span>
        </div>
      </div>
      <div class="card-actions"><button class="icon-button" title="删除" aria-label="删除">×</button></div>
    `;
    article.querySelector("button").addEventListener("click", async () => {
      await api.delete(`/api/food/${item.id}`);
      await loadAll();
    });
    list.append(article);
  });
}

function renderTravel() {
  const list = $("#travel-list");
  list.innerHTML = "";
  if (!state.travel.length) {
    list.append(emptyNode());
    return;
  }

  state.travel.forEach((item) => {
    const article = document.createElement("article");
    article.className = "timeline-item";
    const images = item.images
      .map((image) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(item.city)}" />`)
      .join("");
    article.innerHTML = `
      <div class="timeline-date">${formatDate(item.date)}</div>
      <div>
        <h2>${escapeHtml(item.city)}</h2>
        ${item.photo_note ? `<p class="file-note">${escapeHtml(item.photo_note)}</p>` : ""}
        <p class="note">${escapeHtml(item.story || "还没有写下故事。")}</p>
        ${images ? `<div class="image-strip">${images}</div>` : ""}
        <div class="card-actions"><button class="icon-button" title="删除" aria-label="删除">×</button></div>
      </div>
    `;
    article.querySelector("button").addEventListener("click", async () => {
      await api.delete(`/api/travel/${item.id}`);
      await loadAll();
    });
    list.append(article);
  });
}

function renderWish() {
  const list = $("#wish-list");
  list.innerHTML = "";
  if (!state.wish.length) {
    list.append(emptyNode());
    return;
  }

  state.wish.forEach((item) => {
    const row = document.createElement("div");
    row.className = `wish-item${item.done ? " done" : ""}`;
    row.innerHTML = `
      <input type="checkbox" ${item.done ? "checked" : ""} aria-label="完成状态" />
      <span>${escapeHtml(item.content)}</span>
      <button class="icon-button" title="删除" aria-label="删除">×</button>
    `;
    row.querySelector("input").addEventListener("change", async (event) => {
      await api.patch(`/api/wish/${item.id}`, { done: event.target.checked });
      await loadAll();
    });
    row.querySelector("button").addEventListener("click", async () => {
      await api.delete(`/api/wish/${item.id}`);
      await loadAll();
    });
    list.append(row);
  });
}

function renderHobby() {
  const list = $("#hobby-list");
  list.innerHTML = "";
  if (!state.hobby.length) {
    list.append(emptyNode());
    return;
  }

  state.hobby.forEach((item) => {
    const article = document.createElement("article");
    article.className = "record-card hobby-card";
    article.innerHTML = `
      ${imageMarkup(item.image, item.title)}
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(item.category || "朵朵相关")}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="duoduo-line">${escapeHtml(item.duoduo_element || "和朵朵有关的一条记录。")}</p>
        <p class="note">${escapeHtml(item.note || "还没有备注。")}</p>
      </div>
      <div class="card-actions"><button class="icon-button" title="删除" aria-label="删除">×</button></div>
    `;
    article.querySelector("button").addEventListener("click", async () => {
      await api.delete(`/api/hobby/${item.id}`);
      await loadAll();
    });
    list.append(article);
  });
}

function renderHome() {
  $("#food-count").textContent = state.food.length;
  $("#travel-count").textContent = state.travel.length;
  $("#hobby-count").textContent = state.hobby.length;
  $("#wish-count").textContent = state.wish.length;

  const recent = $("#recent-records");
  recent.innerHTML = "";
  const items = [
    ...state.food.map((item) => ({ type: "美食", title: item.title, image: item.image, note: item.note, time: item.created_at })),
    ...state.travel.map((item) => ({ type: "旅行", title: item.city, image: item.images[0], note: item.photo_note || item.story, time: item.created_at })),
    ...state.hobby.map((item) => ({ type: "爱好", title: item.title, image: item.image, note: item.duoduo_element || item.note, time: item.created_at })),
  ]
    .sort((recordA, recordB) => new Date(recordB.time) - new Date(recordA.time))
    .slice(0, 6);

  if (!items.length) {
    recent.append(emptyNode());
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "record-card";
    article.innerHTML = `
      ${imageMarkup(item.image, item.title)}
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(item.type)}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="note">${escapeHtml(item.note || "一条新的生活片段。")}</p>
      </div>
    `;
    recent.append(article);
  });
}

function renderAll() {
  renderHome();
  renderFood();
  renderTravel();
  renderHobby();
  renderWish();
}

async function loadAll() {
  const [food, travel, hobby, wish] = await Promise.all([
    api.get("/api/food"),
    api.get("/api/travel"),
    api.get("/api/hobby"),
    api.get("/api/wish"),
  ]);
  state.food = food;
  state.travel = travel;
  state.hobby = hobby;
  state.wish = wish;
  renderAll();
}

function bindEvents() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => switchView(tab.dataset.view));
  });

  $("#food-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const imageFile = data.get("imageFile");
    const uploaded = imageFile && imageFile.size ? await uploadFile(imageFile) : { url: null };
    await api.post("/api/food", {
      title: data.get("title"),
      location: data.get("location"),
      rating: data.get("rating") ? Number(data.get("rating")) : null,
      image: uploaded.url,
      note: data.get("note"),
    });
    form.reset();
    await loadAll();
  });

  $("#travel-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const uploaded = await uploadFiles(data.getAll("imageFiles").filter((file) => file.size));
    await api.post("/api/travel", {
      city: data.get("city"),
      date: data.get("date") ? new Date(data.get("date")).toISOString() : null,
      images: uploaded.map((item) => item.url),
      photo_note: data.get("photo_note"),
      story: data.get("story"),
    });
    form.reset();
    await loadAll();
  });

  $("#hobby-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const imageFile = data.get("imageFile");
    const uploaded = imageFile && imageFile.size ? await uploadFile(imageFile) : { url: null };
    await api.post("/api/hobby", {
      title: data.get("title"),
      category: data.get("category"),
      image: uploaded.url,
      duoduo_element: data.get("duoduo_element"),
      note: data.get("note"),
    });
    form.reset();
    await loadAll();
  });

  $("#wish-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    await api.post("/api/wish", { content: data.get("content") });
    form.reset();
    await loadAll();
  });
}

bindEvents();
loadAll().catch((error) => {
  console.error(error);
  alert("加载失败，请确认后端服务已启动。");
});
