async function load(){
const r=await fetch("/api/popular")
const d=await r.json()

let html=""
d.results.forEach(m=>{
if(!m.poster_path)return
html+=`
<div class="movie">
<img src="https://image.tmdb.org/t/p/w300${m.poster_path}">
<p>${m.title}</p>
</div>`
})

document.getElementById("movies").innerHTML=html
}

load()
