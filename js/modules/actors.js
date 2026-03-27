import { fetchAPI } from "../core/api.js";
import { renderMovies } from "../ui/render.js";

let page = 1;
let loading = false;
let actorId = "";

// ==============================
// 获取URL参数
// ==============================
function getActorId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ==============================
// 初始化页面
// ==============================
export async function initActorsPage() {

  actorId = getActorId();
  if (!actorId) return;

  page = 1;

  await loadActorDetail();
  loadActorMovies();

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll);
}

// ==============================
// 加载演员详情（增强SEO）
// ==============================
async function loadActorDetail() {
  try {

    const data = await fetchAPI(`/api/tmdb?type=person&id=${actorId}`);

    const container = document.getElementById("actor-detail");
    if (!container) return;

    // ✅ SEO增强
    document.title = `${data.name}电影作品 - GoodFilm`;

    container.innerHTML = `
      <div class="actor-box">
        <img src="https://image.tmdb.org/t/p/w500${data.profile_path}" />
        <div class="actor-info">
          <h1>${data.name}</h1>
          <p>${data.biography || "暂无简介"}</p>
        </div>
      </div>
    `;

  } catch (err) {
    console.error("Actor detail error:", err);
  }
}

// ==============================
// 滚动触发
// ==============================
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadActorMovies();
  }
}

// ==============================
// 加载演员作品（分页保留）
// ==============================
async function loadActorMovies() {

  if (loading) return;
  loading = true;

  try {

    const data = await fetchAPI(`/api/tmdb?type=person_movies&id=${actorId}&page=${page}`);

    if (!data || !data.cast || data.cast.length === 0) {
      loading = false;
      return;
    }

    const container = document.getElementById("actor-movies");
    if (!container) {
      loading = false;
      return;
    }

    renderMovies(container, data.cast);

    page++;

  } catch (err) {
    console.error("Actor movies error:", err);
  }

  loading = false;
}