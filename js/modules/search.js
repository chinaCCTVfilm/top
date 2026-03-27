import { fetchAPI } from "../core/api.js";
import { renderMovies } from "../ui/render.js";

let page = 1;
let loading = false;
let query = "";

export function initSearchPage() {
  const params = new URLSearchParams(window.location.search);
  query = params.get("q") || "";
  page = 1;

  if (!query) return;

  const container = document.getElementById("movie-list");
  if (!container) return;

  container.innerHTML = "";

  loadSearchResults();

  window.addEventListener("scroll", handleScroll);
}

function handleScroll() {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 200) {
    loadSearchResults();
  }
}

async function loadSearchResults() {
  if (loading) return;
  loading = true;

  try {
    const data = await fetchAPI(`/api/tmdb?type=search&page=${page}&q=${encodeURIComponent(query)}`);

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
    console.error("Search error:", err);
  }

  loading = false;
}
