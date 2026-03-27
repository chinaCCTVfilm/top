export async function fetchAPI(url){
  try{
    const res = await fetch(url);
    return await res.json();
  }catch(err){
    console.error("API fetch error:", err);
    return { results: [] };
  }
}
