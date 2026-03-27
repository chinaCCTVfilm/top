export function bindSearchEvent(callback) {
  document.addEventListener("click", function(e) {
    if (e.target.matches("#search-btn")) {
      const input = document.querySelector("#search-input");
      callback(input.value);
    }
  });
}
