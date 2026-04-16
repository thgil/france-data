// stories/pharmacy-myth/charts.js
// Three map functions, called once data is loaded. Each takes a CSS selector
// and a refs object: { pharmacies, communes, meta }.
// Implementations land in subsequent tasks (6.3, 6.4, 6.5).

function placeholder(selector, label) {
  const el = document.querySelector(selector);
  if (!el) return;
  el.innerHTML = `
    <div style="
      min-height: 320px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f0ece4;
      border: 1px dashed #999;
      color: #666;
      font-family: 'Helvetica Neue', sans-serif;
      font-size: 13px;
      letter-spacing: 0.5px;
      text-transform: uppercase;
    ">${label}</div>`;
}

export function drawTimelapseMap(selector, _refs) {
  placeholder(selector, 'Map A — time-lapse · coming next');
}

export function drawTwinChoropleths(selector, _refs) {
  placeholder(selector, 'Map B — twin choropleths · coming next');
}

export function drawWalkingExplorer(selector, _refs) {
  placeholder(selector, 'Map C — walking explorer · coming next');
}
