// ==============================
// GoodFilm V10 Router Core
// ==============================

import { loadHome } from './modules/home.js';
import { loadMovies } from './modules/movies.js';
import { loadActors } from './modules/actors.js';
import { loadCategory } from './modules/category.js';
import { loadSearch } from './modules/search.js';

// ✅ 广告模块
import { initAds } from './ads/ads.js';

// ==============================
// 路由解析
// ==============================
function getRoute() {
  const path = window.location.pathname;
  const params = new URLSearchParams(window.location.search);

  return {
    path,
    params
  };
}

// ==============================
// 页面加载器
// ==============================
async function loadPage() {
  const { path, params } = getRoute();

  const app = document.getElementById('app');
  app.innerHTML = '<div style="padding:20px">加载中...</div>';

  try {

    // ===== 首页 =====
    if (path === "/" || path === "/index.html") {
      await loadHome();
    }

    // ===== 电影页 =====
    else if (path.includes("/movie")) {
      const id = params.get("id");
      await loadMovies(id);
    }

    // ===== 演员页 =====
    else if (path.includes("/actor")) {
      const id = params.get("id");
      await loadActors(id);
    }

    // ===== 分类页 =====
    else if (path.includes("/category")) {
      await loadCategory();
    }

    // ===== 搜索页 =====
    else if (path.includes("/search")) {
      const q = params.get("q");
      await loadSearch(q);
    }

    // ===== 胆小勿入 =====
    else if (path.includes("/niche")) {
      const { loadNiche } = await import('./modules/niche.js');
      await loadNiche();
    }

    // ===== fallback =====
    else {
      app.innerHTML = "<h2>页面不存在</h2>";
    }

    // ✅ ⭐关键：页面加载完成后初始化广告
    initAds();

  } catch (err) {
    console.error(err);
    app.innerHTML = "<h2>加载失败</h2>";
  }
}

// ==============================
// 路由监听（SPA核心）
// ==============================
function initRouter() {

  document.body.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    if (href.startsWith("/")) {
      e.preventDefault();
      history.pushState({}, "", href);
      loadPage();
    }
  });

  window.addEventListener("popstate", loadPage);
}

// ==============================
// 启动
// ==============================
export async function initApp() {
  initRouter();
  await loadPage();
}