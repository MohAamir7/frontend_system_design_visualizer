import { edges, svg, canvas } from "./state.js";
export function edgePoint(rect, canvasRect, targetX, targetY) {
  const cx = rect.left + rect.width / 2 - canvasRect.left;
  const cy = rect.top + rect.height / 2 - canvasRect.top;
  const a = rect.width / 2;
  const b = rect.height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;
  const angle = Math.atan2(dy, dx);
  const t =
    1 /
    Math.sqrt(
      Math.pow(Math.cos(angle) / a, 2) + Math.pow(Math.sin(angle) / b, 2),
    );
  return { x: cx + t * Math.cos(angle), y: cy + t * Math.sin(angle) };
}



export function drawline(from, to) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const canvasRect = canvas.getBoundingClientRect();
  const r1 = from.getBoundingClientRect();
  const r2 = to.getBoundingClientRect();

  // Center of nodes, relative to canvas
  // const x1 = r1.left + r1.width / 2 - canvasRect.left;
  // const y1 = r1.top + r1.height / 2 - canvasRect.top;
  // const x2 = r2.left + r2.width / 2 - canvasRect.left;
  // const y2 = r2.top + r2.height / 2 - canvasRect.top;
  const c1 = {
    x: r1.left + r1.width / 2 - canvasRect.left,
    y: r1.top + r1.height / 2 - canvasRect.top,
  };
  const c2 = {
    x: r2.left + r2.width / 2 - canvasRect.left,
    y: r2.top + r2.height / 2 - canvasRect.top,
  };

  const p1 = edgePoint(r1, canvasRect, c2.x, c2.y);
  const p2 = edgePoint(r2, canvasRect, c1.x, c1.y);
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);

  line.setAttribute("stroke", "#38bdf8");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#arrow)");

  const hitArea = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "line",
  );
  hitArea.setAttribute("x1", p1.x);
  hitArea.setAttribute("y1", p1.y);
  hitArea.setAttribute("x2", p2.x);
  hitArea.setAttribute("y2", p2.y);
  hitArea.setAttribute("stroke", "transparent");
  hitArea.setAttribute("stroke-width", "16");
  hitArea.style.cursor = "pointer";
  hitArea.style.pointerEvents = "stroke";
  // svg.appendChild(line);
  svg.appendChild(hitArea);

  svg.appendChild(line);
  const edgeData = { from, to, line, hitArea };

  hitArea.addEventListener("click", (e) => {
    e.stopPropagation();
    deleteEdge(edgeData);
    console.log(e);
  });
  edges.push(edgeData);
  // console.log(edges);
  return edgeData;
}
export function animateEdge(fromNode, toNode) {
  const edge = edges.find((e) => e.from === fromNode && e.to === toNode);
  if (!edge) return;

  edge.line.style.strokeDasharray = "5";
  edge.line.style.animation = "flow 1s linear infinite";
}

export function updateline() {
  const canvasRect = canvas.getBoundingClientRect();
  edges.forEach(({ from, to, line }) => {
    const r1 = from.getBoundingClientRect();
    const r2 = to.getBoundingClientRect();
    // const x1 = r1.left + r1.width / 2 - canvasRect.left;
    // const y1 = r1.top + r1.height / 2 - canvasRect.top;
    // const x2 = r2.left + r2.width / 2 - canvasRect.left;
    // const y2 = r2.top + r2.height / 2 - canvasRect.top;
    const c1 = {
      x: r1.left + r1.width / 2 - canvasRect.left,
      y: r1.top + r1.height / 2 - canvasRect.top,
    };
    const c2 = {
      x: r2.left + r2.width / 2 - canvasRect.left,
      y: r2.top + r2.height / 2 - canvasRect.top,
    };

    const p1 = edgePoint(r1, canvasRect, c2.x, c2.y);
    const p2 = edgePoint(r2, canvasRect, c1.x, c1.y);

    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
  });
}
export function stopEdge(fromNode, toNode) {
  const edge = edges.find((e) => e.from === fromNode && e.to === toNode);
  if (!edge) return;

  edge.line.style.animation = "";
}
export function deleteEdge(edgeData) {
  edgeData.line.remove();
  edgeData.hitArea.remove();
  const idx = edges.indexOf(edgeData);
  if (idx !== -1) {
    edges.splice(idx, 1);
  }
}