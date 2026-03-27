#!/bin/bash

echo "=============================="
echo " GoodFilm V9.3 一键安装开始"
echo "=============================="

PROJECT="goodfilm-v93"

# 创建项目目录
mkdir -p $PROJECT
cd $PROJECT

# ---------------- wrangler.toml ----------------
cat > wrangler.toml << 'EOF'
name = "goodfilm-v93"
main = "workers/index.js"
compatibility_date = "2024-01-01"

[vars]
TMDB_KEY = "替换成你的TMDB_API_KEY"
EOF

# ---------------- 目录结构 ----------------
mkdir -p workers js/core js/modules public sites

# ---------------- deploy.sh ----------------
cat > deploy.sh << 'EOF'
#!/bin/bash
echo "Deploying..."
wrangler deploy
echo "Done!"
EOF

chmod +x deploy.sh

# ---------------- workers/index.js ----------------
cat > workers/index.js << 'EOF'
import { generateSEOPage } from "./seo.js";
import { generateSitemap } from "./sitemap.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === "/sitemap.xml") {
      return new Response(generateSitemap(), {
        headers: { "content-type": "application/xml" }
      });
    }

    if (url.pathname.startsWith("/seo/")) {
      const keyword = decodeURIComponent(url.pathname.replace("/seo/", ""));
      return new Response(generateSEOPage(keyword), {
        headers: { "content-type": "text/html;charset=UTF-8" }
      });
    }

    if (url.pathname.startsWith("/api/")) {

      const newPath = url.pathname.replace("/api", "");
      const apiUrl = "https://api.themoviedb.org/3" + newPath + url.search;

      const cache = caches.default;
      let response = await cache.match(request);

      if (!response) {
        response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${env.TMDB_KEY}`
          }
        });
        ctx.waitUntil(cache.put(request, response.clone()));
      }

      return response;
    }

    return fetch(request);
  }
};
EOF

# ---------------- workers/seo.js ----------------
cat > workers/seo.js << 'EOF'
export function generateSEOPage(keyword) {
  return `
  <html>
    <head>
      <title>${keyword}电影在线观看</title>
      <meta name="description" content="${keyword}高清电影推荐">
    </head>
    <body style="background:#e8f5e9">
      <h1>${keyword}电影推荐</h1>
      <div id="app">Loading...</div>

      <script>
        fetch('/api/search/movie?query=${keyword}')
        .then(r=>r.json())
        .then(d=>{
          document.getElementById('app').innerHTML =
            d.results.map(m=>\`<div>\${m.title}</div>\`).join('')
        })
      </script>
    </body>
  </html>`;
}
EOF

# ---------------- workers/sitemap.js ----------------
cat > workers/sitemap.js << 'EOF'
import { generateKeywords } from "../js/seo-engine.js";

export function generateSitemap() {
  const keywords = generateKeywords();

  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${keywords.map(k =>
    `<url><loc>https://yourdomain.com/seo/${encodeURIComponent(k)}</loc></url>`
  ).join("")}
  </urlset>`;
}
EOF

# ---------------- js/seo-engine.js ----------------
cat > js/seo-engine.js << 'EOF'
export function generateKeywords() {
  const types = ["动作", "爱情", "恐怖", "科幻"];
  const regions = ["美国", "日本", "韩国", "中国"];
  const years = ["2024", "2023", "2022"];

  let keywords = [];

  for (let t of types) {
    for (let r of regions) {
      for (let y of years) {
        keywords.push(`${y}${r}${t}电影`);
        keywords.push(`${r}${t}电影推荐`);
      }
    }
  }

  return keywords;
}
EOF

# ---------------- js/core/api.js ----------------
cat > js/core/api.js << 'EOF'
export async function fetchAPI(path) {
  const res = await fetch(`/api${path}`);
  return await res.json();
}
EOF

# ---------------- js/core/site.js ----------------
cat > js/core/site.js << 'EOF'
export async function loadSiteConfig() {
  const res = await fetch(`/sites/default.json`);
  return await res.json();
}
EOF

# ---------------- js/modules/home.js ----------------
cat > js/modules/home.js << 'EOF'
import { fetchAPI } from '../core/api.js';

export async function loadHome(site) {
  const data = await fetchAPI(`/movie/${site.apiType}`);

  document.getElementById("app").innerHTML =
    data.results.map(m => `
      <div>
        <img src="https://image.tmdb.org/t/p/w500${m.poster_path}" />
        <div>${m.title}</div>
      </div>
    `).join('');
}
EOF

# ---------------- js/main.js ----------------
cat > js/main.js << 'EOF'
import { loadSiteConfig } from './core/site.js';
import { loadHome } from './modules/home.js';
import { generateKeywords } from './seo-engine.js';

(async () => {
  const site = await loadSiteConfig();
  document.title = site.siteName;

  loadHome(site);

  const links = generateKeywords().slice(0, 100);
  document.getElementById("seo-links").innerHTML =
    links.map(k => `<a href="/seo/${encodeURIComponent(k)}">${k}</a>`).join('');
})();
EOF

# ---------------- public/index.html ----------------
cat > public/index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
  <title>GoodFilm</title>
  <script type="module" src="/js/main.js"></script>
  <style>
    body { margin:0; display:flex; background:#e8f5e9; }
    .ad { width:10%; background:#c8e6c9; }
    .main { width:80%; padding:10px; }
    #app { display:grid; grid-template-columns:repeat(6,1fr); gap:10px; }
    img { width:100%; }
  </style>
</head>
<body>
  <div class="ad">广告</div>
  <div class="main">
    <h1>GoodFilm</h1>
    <div id="seo-links"></div>
    <div id="app"></div>
  </div>
  <div class="ad">广告</div>
</body>
</html>
EOF

# ---------------- robots.txt ----------------
cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Sitemap: https://yourdomain.com/sitemap.xml
EOF

# ---------------- sites ----------------
cat > sites/default.json << 'EOF'
{
  "siteName": "GoodFilm Pro",
  "apiType": "popular"
}
EOF

echo "=============================="
echo " 文件生成完成"
echo "=============================="

# 安装wrangler
if ! command -v wrangler &> /dev/null
then
    npm install -g wrangler
fi

wrangler login

echo "开始部署..."
wrangler deploy

echo "=============================="
echo " 🚀 网站部署完成！"
echo "=============================="
