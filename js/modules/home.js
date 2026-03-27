let page = 1;
let loading = false;

export function initHomePage() {
  loadMovies();

  window.addEventListener("scroll", handleScroll);
}

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadMovies();
  }
}

async function loadMovies() {
  if (loading) return;
  loading = true;

  try {
    const res = await fetch(`/api/tmdb?type=trending&page=${page}`);
    const data = await res.json();

    if (!data.results || data.results.length === 0) return;

    renderMovies(data.results);

    page++;

  } catch (err) {
    console.error("Home load error:", err);
  }

  loading = false;
}

function renderMovies(movies) {
  const container = document.getElementById("movie-list");
  if (!container) return;

  movies.forEach(movie => {
    if (!movie.poster_path) return;

    const div = document.createElement("div");
    div.className = "movie-card";

    div.innerHTML = `
      <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" />
      <h3>${movie.title}</h3>
    `;

    div.onclick = () => {
      window.location.href = `/movie.html?id=${movie.id}`;
    };

    container.appendChild(div);
  });
}
