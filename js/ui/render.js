export function renderMovies(container, movies) {
  if (!container || !movies) return;

  movies.forEach(item => {
    const div = document.createElement("div");
    div.className = "movie-card";

    // 判断是电影/电视剧还是演员
    const title = item.title || item.name || "未知名称";
    const imgPath = item.poster_path || item.profile_path || "";

    div.innerHTML = `
      <img src="${imgPath ? `https://image.tmdb.org/t/p/w500${imgPath}` : 'https://via.placeholder.com/300x450?text=No+Image'}" 
           alt="${title}">
      <p class="title">${title}</p>
    `;

    // 点击跳转逻辑
    if(item.id && (item.title || item.name)) {
      div.onclick = () => {
        window.location.href = `/movie.html?id=${item.id}`;
      };
    }

    container.appendChild(div);
  });
}
