// stories/dead-villages/charts.js
// Two visualizations:
//   drawVerdunMap(selector)  — SVG dot cluster of the 6 dead villages
//   drawDistribution(selector) — horizontal bar chart of commune size distribution

const VILLAGES = [
  { name: "Fleury-devant-Douaumont",    lat: 49.1913, lng: 5.4447 },
  { name: "Bezonvaux",                  lat: 49.2290, lng: 5.4728 },
  { name: "Beaumont-en-Verdunois",      lat: 49.2657, lng: 5.4050 },
  { name: "Cumières-le-Mort-Homme",     lat: 49.2356, lng: 5.2610 },
  { name: "Haumont-près-Samogneux",     lat: 49.2752, lng: 5.3675 },
  { name: "Louvemont-Côte-du-Poivre",   lat: 49.2409, lng: 5.3960 },
];

const VERDUN_REF = { name: "Verdun", lat: 49.1600, lng: 5.3800 };

const DISTRIBUTION = [
  { label: "1–9",          count:    19 },
  { label: "10–49",        count:   866 },
  { label: "50–99",        count:  2497 },
  { label: "100–199",      count:  5422 },
  { label: "200–499",      count:  9488 },
  { label: "500–999",      count:  6590 },
  { label: "1k–4,999",     count:  7718 },
  { label: "5k–9,999",     count:  1163 },
  { label: "10k–49,999",   count:   864 },
  { label: "50k–99,999",   count:    96 },
  { label: "100k+",        count:    48 },
];

// ── Verdun cluster map ────────────────────────────────────────────────────────

export function drawVerdunMap(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.clientWidth || 640, 680);
  const H = Math.round(W * 0.62);
  const PAD = { top: 24, right: 32, bottom: 40, left: 32 };

  const allPoints = [...VILLAGES, VERDUN_REF];
  const lngs = allPoints.map(p => p.lng);
  const lats = allPoints.map(p => p.lat);
  const minLng = Math.min(...lngs) - 0.04;
  const maxLng = Math.max(...lngs) + 0.04;
  const minLat = Math.min(...lats) - 0.03;
  const maxLat = Math.max(...lats) + 0.03;

  const scaleX = v => PAD.left + ((v - minLng) / (maxLng - minLng)) * (W - PAD.left - PAD.right);
  const scaleY = v => H - PAD.bottom - ((v - minLat) / (maxLat - minLat)) * (H - PAD.top - PAD.bottom);

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("style", "display:block;max-width:100%;");

  // Background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", W); bg.setAttribute("height", H);
  bg.setAttribute("fill", "#f5f0e8");
  svg.appendChild(bg);

  // Grid lines (subtle lat lines)
  for (let latLine = Math.ceil(minLat * 10) / 10; latLine <= maxLat; latLine += 0.1) {
    const y = scaleY(latLine);
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", PAD.left); line.setAttribute("x2", W - PAD.right);
    line.setAttribute("y1", y); line.setAttribute("y2", y);
    line.setAttribute("stroke", "#ddd"); line.setAttribute("stroke-width", "0.5");
    svg.appendChild(line);
  }

  // Verdun city reference
  const vx = scaleX(VERDUN_REF.lng);
  const vy = scaleY(VERDUN_REF.lat);
  const vCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
  vCircle.setAttribute("cx", vx); vCircle.setAttribute("cy", vy);
  vCircle.setAttribute("r", 6); vCircle.setAttribute("fill", "#888"); vCircle.setAttribute("opacity", "0.5");
  svg.appendChild(vCircle);
  const vLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
  vLabel.setAttribute("x", vx + 9); vLabel.setAttribute("y", vy + 4);
  vLabel.setAttribute("font-family", "Helvetica Neue, sans-serif");
  vLabel.setAttribute("font-size", "11"); vLabel.setAttribute("fill", "#666");
  vLabel.textContent = "Verdun";
  svg.appendChild(vLabel);

  // Dead villages
  VILLAGES.forEach(v => {
    const cx = scaleX(v.lng);
    const cy = scaleY(v.lat);

    const dot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    dot.setAttribute("cx", cx); dot.setAttribute("cy", cy);
    dot.setAttribute("r", 7); dot.setAttribute("fill", "#b32020");
    dot.setAttribute("opacity", "0.85");
    svg.appendChild(dot);

    // Label — offset to avoid overlap
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    // Offset labels to avoid collision
    const dx = cx > W / 2 ? -9 : 9;
    const anchor = cx > W / 2 ? "end" : "start";
    label.setAttribute("x", cx + dx); label.setAttribute("y", cy + 4);
    label.setAttribute("font-family", "Helvetica Neue, sans-serif");
    label.setAttribute("font-size", "10.5"); label.setAttribute("fill", "#1a1a1a");
    label.setAttribute("text-anchor", anchor);
    label.textContent = v.name;
    svg.appendChild(label);
  });

  // Scale bar (rough: 5 km ≈ 0.072° lng at lat 49°)
  const sbLng = minLng + 0.05;
  const sbLng2 = sbLng + 0.072;
  const sby = H - PAD.bottom + 16;
  const sbLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
  sbLine.setAttribute("x1", scaleX(sbLng)); sbLine.setAttribute("x2", scaleX(sbLng2));
  sbLine.setAttribute("y1", sby - 4); sbLine.setAttribute("y2", sby - 4);
  sbLine.setAttribute("stroke", "#888"); sbLine.setAttribute("stroke-width", "2");
  svg.appendChild(sbLine);
  const sbText = document.createElementNS("http://www.w3.org/2000/svg", "text");
  sbText.setAttribute("x", scaleX((sbLng + sbLng2) / 2)); sbText.setAttribute("y", sby + 4);
  sbText.setAttribute("font-family", "Helvetica Neue, sans-serif");
  sbText.setAttribute("font-size", "9"); sbText.setAttribute("fill", "#888");
  sbText.setAttribute("text-anchor", "middle");
  sbText.textContent = "5 km";
  svg.appendChild(sbText);

  container.appendChild(svg);
}

// ── Commune size distribution bar chart ──────────────────────────────────────

export function drawDistribution(selector) {
  const container = document.querySelector(selector);
  if (!container) return;

  const W = Math.min(container.clientWidth || 640, 680);
  const BAR_H = 28;
  const GAP = 6;
  const LABEL_W = 90;
  const COUNT_W = 60;
  const PAD = { top: 8, right: COUNT_W + 8, bottom: 8, left: LABEL_W + 8 };
  const H = (BAR_H + GAP) * DISTRIBUTION.length + PAD.top + PAD.bottom;

  const maxCount = Math.max(...DISTRIBUTION.map(d => d.count));
  const barAreaW = W - PAD.left - PAD.right;

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("width", W);
  svg.setAttribute("style", "display:block;max-width:100%;");

  DISTRIBUTION.forEach((d, i) => {
    const y = PAD.top + i * (BAR_H + GAP);
    const barW = Math.max(2, (d.count / maxCount) * barAreaW);

    // Label
    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", LABEL_W); label.setAttribute("y", y + BAR_H / 2 + 4);
    label.setAttribute("font-family", "Helvetica Neue, sans-serif");
    label.setAttribute("font-size", "12"); label.setAttribute("fill", "#444");
    label.setAttribute("text-anchor", "end");
    label.textContent = d.label;
    svg.appendChild(label);

    // Bar
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("x", PAD.left); rect.setAttribute("y", y);
    rect.setAttribute("width", barW); rect.setAttribute("height", BAR_H);
    // Highlight the smallest and the mode
    const isSmallest = i === 0;
    const isMode = d.count === maxCount;
    rect.setAttribute("fill", isSmallest ? "#b32020" : isMode ? "#6a1a1a" : "#c8a87a");
    rect.setAttribute("opacity", "0.85");
    svg.appendChild(rect);

    // Count label
    const countLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
    countLabel.setAttribute("x", PAD.left + barW + 6);
    countLabel.setAttribute("y", y + BAR_H / 2 + 4);
    countLabel.setAttribute("font-family", "Helvetica Neue, sans-serif");
    countLabel.setAttribute("font-size", "11"); countLabel.setAttribute("fill", "#666");
    countLabel.textContent = d.count.toLocaleString("en");
    svg.appendChild(countLabel);
  });

  container.appendChild(svg);
}
