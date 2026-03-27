export async function onRequest(context) {
  const cache = caches.default;
  const url = new URL(context.request.url);

  url.searchParams.sort();
  const cacheKey = new Request(url.toString(), context.request);

  let response = await cache.match(cacheKey);
  if (response) return response;

  const type = url.searchParams.get("type");
  const API_KEY = context.env.TMDB_API_KEY;

  if (!API_KEY) {
    return new Response(JSON.stringify({ error: "API key missing" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  let apiUrl = "";
  let cacheTTL = 3600;

  try {

    // 🔥 trending
    if (type === "trending") {
      const page = url.searchParams.get("page") || 1;
      apiUrl = `https://api.themoviedb.org/3/trending/movie/week?api_key=${API_KEY}&page=${page}`;
    }

    // 🎬 discover（原有）
    else if (type === "discover") {
      const genre = url.searchParams.get("genre");
      const region = url.searchParams.get("region");
      const page = url.searchParams.get("page") || 1;

      apiUrl = `https://api.themoviedb.org/3/discover/movie?api_key=${API_KEY}&page=${page}`;

      if (genre) apiUrl += `&with_genres=${genre}`;
      if (region) apiUrl += `&region=${region}`;
    }

    // 🔍 search（原有）
    else if (type === "search") {
      const q = url.searchParams.get("q") || "";
      const page = url.searchParams.get("page") || 1;

      apiUrl = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(q)}&page=${page}`;
      cacheTTL = 600;
    }

    // 🎥 detail（原有）
    else if (type === "detail") {
      const id = url.searchParams.get("id");
      apiUrl = `https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}`;
      cacheTTL = 86400;
    }

    // ✅ 新增：推荐
    else if (type === "recommend") {
      const id = url.searchParams.get("id");
      apiUrl = `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}`;
    }

    // ✅ 新增：相似
    else if (type === "similar") {
      const id = url.searchParams.get("id");
      apiUrl = `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}`;
    }

    // ✅ 新增：演员
    else if (type === "actors") {
      apiUrl = `https://api.themoviedb.org/3/person/popular?api_key=${API_KEY}`;
    }

    // 🎬 相似电影
    else if (type === "similar") {
      const id = url.searchParams.get("id");
      const page = url.searchParams.get("page") || 1;

      apiUrl = `https://api.themoviedb.org/3/movie/${id}/similar?api_key=${API_KEY}&page=${page}`;
      cacheTTL = 3600;
    }

    // 🎯 推荐电影
    else if (type === "recommend") {
      const id = url.searchParams.get("id");
      const page = url.searchParams.get("page") || 1;

      apiUrl = `https://api.themoviedb.org/3/movie/${id}/recommendations?api_key=${API_KEY}&page=${page}`;
      cacheTTL = 3600;
    }

    // 👤 演员详情
    else if (type === "person") {
      const id = url.searchParams.get("id");
      apiUrl = `https://api.themoviedb.org/3/person/${id}?api_key=${API_KEY}`;
      cacheTTL = 86400;
    }
    
    // 🎬 演员作品
    else if (type === "person_movies") {
      const id = url.searchParams.get("id");
      const page = url.searchParams.get("page") || 1;
      
      apiUrl = `https://api.themoviedb.org/3/person/${id}/movie_credits?api_key=${API_KEY}&page=${page}`;
      cacheTTL = 3600;
    }

    else {
      return new Response(JSON.stringify({ error: "Invalid type" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const res = await fetch(apiUrl);

    if (!res.ok) {
      return new Response(JSON.stringify({ error: "TMDB error" }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    const data = await res.text();

    const newResponse = new Response(data, {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": `public, max-age=${cacheTTL}`
      }
    });

    context.waitUntil(cache.put(cacheKey, newResponse.clone()));

    return newResponse;

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { "Content-Type": "application/json" }
    });
  }
}
