// ==============================
// 广告系统模块（可扩展）
// ==============================

export function initAds() {

  renderSideAds();
  renderInlineAds();
}

// ==============================
// 左右广告
// ==============================
function renderSideAds() {

  const left = document.querySelector(".ad-left");
  const right = document.querySelector(".ad-right");

  if (left) {
    left.innerHTML = getAdHTML("left");
  }

  if (right) {
    right.innerHTML = getAdHTML("right");
  }
}

// ==============================
// 内容内广告
// ==============================
function renderInlineAds() {

  const list = document.querySelector("#movie-list");

  if (!list) return;

  const ad = document.createElement("div");
  ad.className = "ad-inline";
  ad.innerHTML = getAdHTML("inline");

  // 插入第6个位置
  if (list.children.length > 6) {
    list.insertBefore(ad, list.children[6]);
  }
}

// ==============================
// 广告HTML（可接入真实广告）
// ==============================
function getAdHTML(type) {

  // 👉 后续接入广告平台替换这里
  return `
    <div class="ad-box ad-${type}">
      <p>广告位（${type}）</p>
    </div>
  `;
}