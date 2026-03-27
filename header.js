// ==============================
// GoodFilm Header System V10（融合增强版）
// ==============================

const regions = [
  "中国","美国","日本","韩国","英国","法国","德国","印度","泰国","意大利",
  "西班牙","俄罗斯","加拿大","澳大利亚","巴西","墨西哥","阿根廷","荷兰",
  "瑞典","挪威","丹麦","芬兰","土耳其","伊朗","埃及","南非","越南","菲律宾",
  "马来西亚","新加坡","印尼","比利时","瑞士","波兰","乌克兰","捷克","希腊"
];

// ==============================
// 增强 Header（不覆盖原内容）
// ==============================
function enhanceHeader() {

  const nav = document.querySelector(".nav");
  if (!nav) return;

  // 防止重复注入
  if (document.getElementById("region-dropdown")) return;

  const regionHTML = `
    <div class="dropdown" id="region-dropdown">
      <span>地区 ▼</span>
      <div class="dropdown-menu">
        ${regions.map(r =>
          `<a href="/category?region=${encodeURIComponent(r)}">${r}</a>`
        ).join("")}
      </div>
    </div>
  `;

  nav.insertAdjacentHTML("beforeend", regionHTML);

  bindEvents();
}

// ==============================
// 下拉交互
// ==============================
function bindEvents() {
  const dropdown = document.getElementById("region-dropdown");
  if (!dropdown) return;

  const menu = dropdown.querySelector(".dropdown-menu");

  dropdown.addEventListener("mouseenter", () => {
    menu.style.display = "block";
  });

  dropdown.addEventListener("mouseleave", () => {
    menu.style.display = "none";
  });
}

// ==============================
// 初始化（延迟确保原header已加载）
// ==============================
window.addEventListener("load", () => {
  enhanceHeader();
});