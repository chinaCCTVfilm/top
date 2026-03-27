import { fetchAPI } from "../core/api.js";
import { renderMovies } from "../ui/render.js";

// ==============================
// 胆小勿入页面
// ==============================
export async function loadNiche() {

  const app = document.getElementById("app");

  // SEO
  document.title = "胆小勿入！高能恐怖电影推荐";

  app.innerHTML = `
    <h1 style="color:red">⚠ 胆小勿入 ⚠</h1>
    <p>以下内容包含高能恐怖元素，请谨慎观看</p>
    <div id="niche-list" class="movie-grid"></div>
  `;

  try {

    // TMDB 恐怖片
    const data = await fetchAPI(`/api/tmdb?type=discover&genre=27`);

    if (!data || !data.results) {
      app.innerHTML += "<p>加载失败</p>";
      return;
    }

    const list = data.results;

    renderMovies(
      document.getElementById("niche-list"),
      list.slice(0, 30)
    );

  } catch (err) {
    console.error(err);
    app.innerHTML += "<p>加载失败</p>";
  }
}