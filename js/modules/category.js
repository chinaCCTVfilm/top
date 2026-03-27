import { fetchAPI } from "../core/api.js";
import { renderMovies } from "../ui/render.js";

let page = 1;
let loading = false;

const GENRE_MAP = {
  action: 28,
  comedy: 35,
  drama: 18,
  horror: 27,
  romance: 10749
};

const TYPE_MAP = {
  popular: "trending",
  hot: "trending",
  top: "top_rated"
};

// ✅ 新增：地区映射（工程级）
const REGION_MAP = {
  "中国": "CN",
  "美国": "US",
  "日本": "JP",
  "韩国": "KR",
  "英国": "GB",
  "法国": "FR",
  "德国": "DE",
  "印度": "IN",
  "泰国": "TH",
  "意大利": "IT"
};

export function initCategoryPage() {
  page = 1;

  const container = document.getElementById("movie-list");
  if (container) container.innerHTML = "";

  updateTitle(); // ✅ SEO增强

  loadMovies();

  window.removeEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleScroll);
}

function updateTitle() {
  const params = new URLSearchParams(window.location.search);
  const region = params.get("region");

  if (region) {
    document.title = `${region}电影推荐 - GoodFilm`;
  }
}

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMovies();
  }
}

async function loadMovies() {
  if (loading) return;
  loading = true;

  const params = new URLSearchParams(window.location.search);
  const type = params.get("type");
  const region = params.get("region");

  let url = "";

  // ✅ 1. 类型优先
  if (type && GENRE_MAP[type]) {
    url = `/api/tmdb?type=discover&page=${page}&genre=${GENRE_MAP[type]}`;
  }

  else if (type && TYPE_MAP[type]) {
    url = `/api/tmdb?type=${TYPE_MAP[type]}&page=${page}`;
  }

  else {
    url = `/api/tmdb?type=discover&page=${page}`;
  }

  // ✅ 2. 地区优化（核心修复）
  if (region && url.includes("discover")) {

    const code = REGION_MAP[region];

    if (code) {
      url += `&with_origin_country=${code}`;
    }
  }

  try {
    const data = await fetchAPI(url);

    if (!data || !data.results || data.results.length === 0) {
      loading = false;
      return;
    }

    const container = document.getElementById("movie-list");
    if (!container) {
      loading = false;
      return;
    }

    renderMovies(container, data.results);

    page++;

  } catch (err) {
    console.error("Category error:", err);
  }

  loading = false;
}