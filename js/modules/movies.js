import { fetchAPI } from "../core/api.js";
import { renderMovies } from "../ui/render.js";

let recPage = 1;
let loading = false;
let movieId = "";
let mode = "similar"; // similar → recommend → trending

function getMovieId() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

// ================= 详情 =================
function renderDetail(container, movie) {
  container.innerHTML = `
    <div class="movie-detail">
      <h1>${movie.title}</h1>
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
      <p>${movie.overview || "暂无简介"}</p>
      <p>评分：${movie.vote_average}</p>
    </div>
  `;
}

// ================= 初始化 =================
export async function initMoviePage() {
  try {
    movieId = getMovieId();
    if (!movieId) return;

    const data = await fetchAPI(`/api/tmdb?type=detail&id=${movieId}`);
    if (!data) return;

    const container = document.querySelector("#movie-detail");
    if (!container) return;

    renderDetail(container, data);
    document.title = data.title;

    // ✅ 初始化推荐
    recPage = 1;
    loadRecommendations();

    window.addEventListener("scroll", handleScroll);

  } catch (err) {
    console.error("Movie detail error:", err);
  }
}

// ================= 滚动 =================
function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadRecommendations();
  }
}

// ================= 推荐核心 =================
async function loadRecommendations() {
  if (loading) return;
  loading = true;

  let url = "";

  try {
    // 1️⃣ 相似
    if (mode === "similar") {
      url = `/api/tmdb?type=similar&id=${movieId}&page=${recPage}`;
    }
    // 2️⃣ 推荐
    else if (mode === "recommend") {
      url = `/api/tmdb?type=recommend&id=${movieId}&page=${recPage}`;
    }
    // 3️⃣ 热门补充
    else {
      url = `/api/tmdb?type=trending&page=${recPage}`;
    }

    const data = await fetchAPI(url);

    // 没数据 → 切换模式
    if (!data.results || data.results.length === 0) {
      if (mode === "similar") {
        mode = "recommend";
        recPage = 1;
      } else if (mode === "recommend") {
        mode = "trending";
        recPage = 1;
      } else {
        loading = false;
        return;
      }

      loading = false;
      loadRecommendations();
      return;
    }

    const container = document.getElementById("recommend-list");
    if (!container) {
      loading = false;
      return;
    }

    renderMovies(container, data.results);

    recPage++;

  } catch (err) {
    console.error("Recommend error:", err);
  }

  loading = false;
}
