const state = {
  food: [],
  travel: [],
  hobby: [],
  wish: [],
};

const knownDate = new Date(2026, 1, 15);

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

function setText(selector, value) {
  const element = $(selector);
  if (element) element.textContent = value;
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

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function daysBetween(from, to) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return Math.max(0, Math.round((startOfDay(to) - startOfDay(from)) / millisecondsPerDay));
}

function renderAnniversary() {
  const today = startOfDay(new Date());
  const knownDays = daysBetween(knownDate, today) + 1;
  let nextAnniversary = new Date(today.getFullYear(), 1, 15);
  if (nextAnniversary < today) {
    nextAnniversary = new Date(today.getFullYear() + 1, 1, 15);
  }

  $("#known-days").textContent = knownDays;
  $("#next-anniversary-days").textContent = daysBetween(today, nextAnniversary);
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

function recordImages(item) {
  if (Array.isArray(item.images) && item.images.length) return item.images;
  if (item.image) return [item.image];
  return [];
}

function firstImage(item) {
  return recordImages(item)[0] || null;
}

function parseImages(form) {
  const value = form.elements.existingImages?.value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function setFormImages(formId, images) {
  const form = $(`#${formId}`);
  if (!form?.elements.existingImages) return;
  form.elements.existingImages.value = JSON.stringify(images);
  renderFormImages(formId, images);
}

function renderFormImages(formId, images) {
  const container = document.querySelector(`[data-image-manager="${formId}"]`);
  if (!container) return;
  container.innerHTML = "";
  if (!images.length) {
    container.classList.remove("active");
    return;
  }

  container.classList.add("active");
  container.innerHTML = `
    <p>当前图片</p>
    <div class="image-manager-grid">
      ${images
        .map(
          (image, index) => `
            <div class="image-manager-item">
              <img src="${escapeHtml(image)}" alt="第 ${index + 1} 张图片" />
              <button type="button" data-remove-image="${index}">删除</button>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
  container.querySelectorAll("[data-remove-image]").forEach((button) => {
    button.addEventListener("click", () => {
      const nextImages = images.filter((_, index) => index !== Number(button.dataset.removeImage));
      setFormImages(formId, nextImages);
    });
  });
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

function galleryMarkup(images, alt) {
  if (!images.length) return '<div class="placeholder-image" aria-hidden="true"></div>';
  const [cover, ...rest] = images;
  return `
    <div class="record-gallery">
      ${imageMarkup(cover, alt)}
      ${
        rest.length
          ? `<div class="record-thumbs">${rest
              .slice(0, 4)
              .map((image) => `<img src="${escapeHtml(image)}" alt="${escapeHtml(alt)}" />`)
              .join("")}</div>`
          : ""
      }
    </div>
  `;
}

function resetForm(formId) {
  const form = $(`#${formId}`);
  form.reset();
  form.querySelectorAll('input[type="hidden"]').forEach((input) => {
    input.value = "";
  });
  renderFormImages(formId, []);
  const titleMap = {
    "food-form": "新增美食",
    "travel-form": "新增旅行",
    "hobby-form": "新增爱好",
  };
  setText(`#${formId}-title`, titleMap[formId] || "");
  if (formId === "wish-form") {
    form.querySelector("button").textContent = "添加";
  }
}

function toDateInputValue(value) {
  if (!value) return "";
  return new Date(value).toISOString().slice(0, 10);
}

function editFood(item) {
  switchView("food");
  const form = $("#food-form");
  form.elements.id.value = item.id;
  setFormImages("food-form", recordImages(item));
  form.elements.title.value = item.title || "";
  form.elements.location.value = item.location || "";
  form.elements.rating.value = item.rating || "";
  form.elements.note.value = item.note || "";
  setText("#food-form-title", "编辑美食");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function editTravel(item) {
  switchView("travel");
  const form = $("#travel-form");
  form.elements.id.value = item.id;
  setFormImages("travel-form", item.images || []);
  form.elements.city.value = item.city || "";
  form.elements.date.value = toDateInputValue(item.date);
  form.elements.photo_note.value = item.photo_note || "";
  form.elements.story.value = item.story || "";
  setText("#travel-form-title", "编辑旅行");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function editHobby(item) {
  switchView("hobby");
  const form = $("#hobby-form");
  form.elements.id.value = item.id;
  setFormImages("hobby-form", recordImages(item));
  form.elements.title.value = item.title || "";
  form.elements.category.value = item.category || "";
  form.elements.duoduo_element.value = item.duoduo_element || "";
  form.elements.note.value = item.note || "";
  setText("#hobby-form-title", "编辑爱好");
  form.scrollIntoView({ behavior: "smooth", block: "start" });
}

function editWish(item) {
  switchView("wish");
  const form = $("#wish-form");
  form.elements.id.value = item.id;
  form.elements.content.value = item.content || "";
  form.querySelector("button").textContent = "保存";
  form.scrollIntoView({ behavior: "smooth", block: "start" });
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
      ${galleryMarkup(recordImages(item), item.title)}
      <div class="card-body">
        <h2>${escapeHtml(item.title)}</h2>
        <p class="note">${escapeHtml(item.note || "还没有备注。")}</p>
        <div class="meta">
          <span>${escapeHtml(item.location || "未记录位置")}</span>
          <span>${escapeHtml(item.rating ? `${item.rating}/5` : "未评分")}</span>
        </div>
      </div>
      <div class="card-actions">
        <button class="text-button" type="button">编辑</button>
        <button class="icon-button" title="删除" aria-label="删除">×</button>
      </div>
    `;
    article.querySelector(".text-button").addEventListener("click", () => editFood(item));
    article.querySelector(".icon-button").addEventListener("click", async () => {
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
        <div class="card-actions">
          <button class="text-button" type="button">编辑</button>
          <button class="icon-button" title="删除" aria-label="删除">×</button>
        </div>
      </div>
    `;
    article.querySelector(".text-button").addEventListener("click", () => editTravel(item));
    article.querySelector(".icon-button").addEventListener("click", async () => {
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
      <button class="text-button" type="button">编辑</button>
      <button class="icon-button" title="删除" aria-label="删除">×</button>
    `;
    row.querySelector("input").addEventListener("change", async (event) => {
      await api.patch(`/api/wish/${item.id}`, { done: event.target.checked });
      await loadAll();
    });
    row.querySelector(".text-button").addEventListener("click", () => editWish(item));
    row.querySelector(".icon-button").addEventListener("click", async () => {
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
      ${galleryMarkup(recordImages(item), item.title)}
      <div class="card-body">
        <p class="eyebrow">${escapeHtml(item.category || "朵朵相关")}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="duoduo-line">${escapeHtml(item.duoduo_element || "和朵朵有关的一条记录。")}</p>
        <p class="note">${escapeHtml(item.note || "还没有备注。")}</p>
      </div>
      <div class="card-actions">
        <button class="text-button" type="button">编辑</button>
        <button class="icon-button" title="删除" aria-label="删除">×</button>
      </div>
    `;
    article.querySelector(".text-button").addEventListener("click", () => editHobby(item));
    article.querySelector(".icon-button").addEventListener("click", async () => {
      await api.delete(`/api/hobby/${item.id}`);
      await loadAll();
    });
    list.append(article);
  });
}

function renderHomeCards(selector, items, emptyText) {
  const list = $(selector);
  if (!list) return;
  list.innerHTML = "";
  if (!items.length) {
    const empty = emptyNode();
    empty.textContent = emptyText;
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const article = document.createElement("article");
    article.className = "home-card";
    article.innerHTML = `
      ${imageMarkup(item.image, item.title)}
      <div class="home-card-body">
        <p class="eyebrow">${escapeHtml(item.label)}</p>
        <h2>${escapeHtml(item.title)}</h2>
        <p class="note">${escapeHtml(item.note || "一条新的生活片段。")}</p>
      </div>
    `;
    list.append(article);
  });
}

function renderHomeWishes() {
  const list = $("#home-wish-list");
  if (!list) return;
  list.innerHTML = "";
  const items = state.wish.slice(0, 5);
  if (!items.length) {
    const empty = emptyNode();
    empty.textContent = "还没有愿望，先写一个想一起完成的小事。";
    list.append(empty);
    return;
  }

  items.forEach((item) => {
    const row = document.createElement("div");
    row.className = `home-wish-item${item.done ? " done" : ""}`;
    row.innerHTML = `
      <span aria-hidden="true"></span>
      <p>${escapeHtml(item.content)}</p>
    `;
    list.append(row);
  });
}

function renderHome() {
  renderHomeCards(
    "#home-food-list",
    state.food.slice(0, 3).map((item) => ({
      label: item.location || "最近美食",
      title: item.title,
      image: firstImage(item),
      note: item.note,
    })),
    "还没有美食记录，先添加一条。",
  );

  renderHomeCards(
    "#home-travel-list",
    state.travel.slice(0, 3).map((item) => ({
      label: item.date ? formatDate(item.date) : "旅行",
      title: item.city,
      image: item.images[0],
      note: item.photo_note || item.story,
    })),
    "还没有旅行记录，先留下一段路上的故事。",
  );

  renderHomeWishes();
}

function renderAll() {
  renderAnniversary();
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

  document.querySelectorAll("[data-jump-view]").forEach((button) => {
    button.addEventListener("click", () => switchView(button.dataset.jumpView));
  });

  document.querySelectorAll("[data-reset-form]").forEach((button) => {
    button.addEventListener("click", () => resetForm(button.dataset.resetForm));
  });

  $("#food-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const uploaded = await uploadFiles(data.getAll("imageFiles").filter((file) => file.size));
    const images = [...parseImages(form), ...uploaded.map((item) => item.url)];
    const payload = {
      title: data.get("title"),
      location: data.get("location"),
      rating: data.get("rating") ? Number(data.get("rating")) : null,
      image: images[0] || null,
      images,
      note: data.get("note"),
    };
    const id = data.get("id");
    if (id) {
      await api.patch(`/api/food/${id}`, payload);
    } else {
      await api.post("/api/food", payload);
    }
    resetForm("food-form");
    await loadAll();
  });

  $("#travel-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const uploaded = await uploadFiles(data.getAll("imageFiles").filter((file) => file.size));
    const images = [...parseImages(form), ...uploaded.map((item) => item.url)];
    const payload = {
      city: data.get("city"),
      date: data.get("date") ? new Date(data.get("date")).toISOString() : null,
      images,
      photo_note: data.get("photo_note"),
      story: data.get("story"),
    };
    const id = data.get("id");
    if (id) {
      await api.patch(`/api/travel/${id}`, payload);
    } else {
      await api.post("/api/travel", payload);
    }
    resetForm("travel-form");
    await loadAll();
  });

  $("#hobby-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const uploaded = await uploadFiles(data.getAll("imageFiles").filter((file) => file.size));
    const images = [...parseImages(form), ...uploaded.map((item) => item.url)];
    const payload = {
      title: data.get("title"),
      category: data.get("category"),
      image: images[0] || null,
      images,
      duoduo_element: data.get("duoduo_element"),
      note: data.get("note"),
    };
    const id = data.get("id");
    if (id) {
      await api.patch(`/api/hobby/${id}`, payload);
    } else {
      await api.post("/api/hobby", payload);
    }
    resetForm("hobby-form");
    await loadAll();
  });

  $("#wish-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const id = data.get("id");
    if (id) {
      await api.patch(`/api/wish/${id}`, { content: data.get("content") });
    } else {
      await api.post("/api/wish", { content: data.get("content") });
    }
    resetForm("wish-form");
    await loadAll();
  });
}

bindEvents();
loadAll().catch((error) => {
  console.error(error);
  alert("加载失败，请确认后端服务已启动。");
});
