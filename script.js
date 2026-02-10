const canvas = document.getElementById("canvas");
const nodes = [];

document.querySelectorAll(".node").forEach((template) => {
  template.addEventListener("click", () => {
    // console.log("active");
    const el = document.createElement("div");
    el.className = "node-instance";
    el.textContent = template.textContent;
    el.style.top = "100px";
    el.style.left = "100px";
    canvas.appendChild(el);
    makeDragable(el);

    nodes.push({
      id: Date.now(),
      el,
      latency: 5000,
      failureRate: 0.01,
    });
    // console.log(nodes[0].id);
  });
});

function makeDragable(el) {
  // console.log("start dragging");
  let offsetX, offsetY;
  el.addEventListener("mousedown", (e) => {
    // console.log(e.clientX);
    offsetX = e.clientX;
    offsetY = e.clientY;
    console.log(offsetX, offsetY);
    // el.addEventListener("mousemove",mouseMovehandler);
    // el.addEventListener("mouseUp",mouseUp);/
    document.onmousemove = (ev) => {
      el.style.left = `${ev.pageX - offsetX}px`;
      el.style.top = `${ev.pageY - offsetY}px`;
      updateline();
    };
    document.onmouseup = () => {
      document.onmousemove = null;
    };
  });
}

let selectNode = null;
const edges = [];

const svg = document.getElementById("connections");
canvas.addEventListener("click", (e) => {
  // console.log(e.target);
  if (!e.target.classList.contains("node-instance")) return;

  if (!selectNode) {
    selectNode = e.target;
    // console.log(selectNode);
    selectNode.classList.add("active");
  } else {
    drawline(selectNode, e.target);
    selectNode.classList.remove("active");
    selectNode = null;
  }
});

function drawline(from, to) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const canvasRect = canvas.getBoundingClientRect();
  const r1 = from.getBoundingClientRect();
  const r2 = to.getBoundingClientRect();

  // Center of nodes, relative to canvas
  const x1 = r1.left + r1.width / 2 - canvasRect.left;
  const y1 = r1.top + r1.height / 2 - canvasRect.top;
  const x2 = r2.left + r2.width / 2 - canvasRect.left;
  const y2 = r2.top + r2.height / 2 - canvasRect.top;

  line.setAttribute("x1", x1);
  line.setAttribute("y1", y1);
  line.setAttribute("x2", x2);
  line.setAttribute("y2", y2);

  line.setAttribute("stroke", "#38bdf8");
  line.setAttribute("stroke-width", "2");

  svg.appendChild(line);
  edges.push({ from, to, line });
  // console.log(edges);
}
function updateline() {
  const canvasRect = canvas.getBoundingClientRect();
  edges.forEach(({ from, to, line }) => {
    const r1 = from.getBoundingClientRect();
    const r2 = to.getBoundingClientRect();
    const x1 = r1.left + r1.width / 2 - canvasRect.left;
    const y1 = r1.top + r1.height / 2 - canvasRect.top;
    const x2 = r2.left + r2.width / 2 - canvasRect.left;
    const y2 = r2.top + r2.height / 2 - canvasRect.top;

    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
  });
}
function addLog(msg) {
  console.log(msg);
  
}
function animateEdge(fromNode, toNode) {
  const edge = edges.find(e => e.from === fromNode && e.to === toNode);
  if (!edge) return;

  edge.line.style.strokeDasharray = "5";
  edge.line.style.animation = "flow 1s linear infinite";
}

function stopEdge(fromNode, toNode) {
  const edge = edges.find(e => e.from === fromNode && e.to === toNode);
  if (!edge) return;

  edge.line.style.animation = "";
}
function processed(node,prevNode) {
   return new Promise((res,rej)=>{
    if(prevNode){
      animateEdge(prevNode.el,node.el);
    }
    addLog(`Request entered ${node.el.textContent}`);
    setTimeout(()=>{
      const failed = Math.random()<node.failureRate;
      if(prevNode){
        stopEdge(prevNode.el,node.el);
      }
      if(failed){
        addLog(`${node.el.textContent} FAILED ❌`)
        rej(`Failed at ${node.el.textContent}`);
      }else{
        addLog(`${node.el.textContent} processed successfully ✅`);
        res(node.latency)
      }
    },5000)
   })  
}

const simulate = document.getElementById("simulate-btn");

simulate.addEventListener("click", simulateFunc);
function simulateFunc() {
  if(nodes.length === 0) return;
  let totalLatency = 0;
  
  let chain = Promise.resolve();
  nodes.forEach((node, idx) => {
    chain = chain.then(() => {
      const prevNode = idx === 0 ? null : nodes[idx - 1];
      const latency = processed(node, prevNode);
       return totalLatency += latency;
    });
  });
  chain
    .then(() => {
      addLog("Request completed successfully 🎉");
      alert(`Request SUCCESS in ${totalLatency}ms`);
    })
    .catch((error) => {
      addLog(error);
      alert(`Request FAILED after ${totalLatency}ms`);
    });
}

// simulate.addEventListener("click",startFlowAnimation);
// function startFlowAnimation() {
//   edges.forEach(({ line }) => {
//     line.classList.add("flow");
//   });
// }
// simulate.addEventListener("click", animateFlow);
// function animateFlow() {
//   edges.forEach(({ line }) => {
//     line.style.strokeDasharray = "5";
//     line.style.animation = "flow 1s linear infinite";
//   });
// }
