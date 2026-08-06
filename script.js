const canvas = document.getElementById("canvas");
const nodes = [];
let nodecounter = 0;

document.querySelectorAll(".node").forEach((template) => {
  template.addEventListener("click", () => {
    // console.log("active");
    const el = document.createElement("div");
    el.className = "node-instance";
    el.textContent = template.textContent;
    el.dataset.type = template.dataset.type;
    el.style.top = "100px";
    el.style.left = "100px";
    const label = document.createElement("span");
    label.textContent = template.textContent;
    el.appendChild(label);
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNode(nodeData);
    })
    el.appendChild(deleteBtn);

    canvas.appendChild(el);
    makeDragable(el);

    const nodeData={
      id: nodecounter++,
      type: template.dataset.type,
      el,
      latency: 5000,
      failureRate: 0.01,
    };
    nodes.push(nodeData);
    // console.log(nodes[0].id);
  });
});


function makeDragable(el) {
  // console.log("start dragging");
  let offsetX, offsetY;
  el.addEventListener("mousedown", (e) => {

    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    // console.log(e.clientX);
    // offsetX = e.clientX;
    // offsetY = e.clientY;
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

function buildGraph() {
  const graph = new Map();

  nodes.forEach((node) => {
    graph.set(node.el, { node, children: [], parents: [] });
  });

  edges.forEach(({ from, to }) => {
    const fromEntry = graph.get(from);
    const toEntry = graph.get(to);
    if (fromEntry && toEntry) {
      fromEntry.children.push(toEntry);
      toEntry.parents.push(fromEntry);
    }
  });

  return graph;
}

function findStartNodes(graph) {
  const startNodes = [];
  graph.forEach((entry) => {
    if (entry.parents.length === 0) {
      startNodes.push(entry);
    }
  });
  return startNodes;
}
console.log(buildGraph());

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
function edgePoint(rect, canvasRect, targetX, targetY) {
  const cx = rect.left + rect.width / 2 - canvasRect.left;
  const cy = rect.top + rect.height / 2 - canvasRect.top;
  const a = rect.width / 2;
  const b = rect.height / 2;
  const dx = targetX - cx;
  const dy = targetY - cy;
  const angle = Math.atan2(dy, dx);
  const t = 1 / Math.sqrt(Math.pow(Math.cos(angle) / a, 2) + Math.pow(Math.sin(angle) / b, 2));
  return { x: cx + t * Math.cos(angle), y: cy + t * Math.sin(angle) };
}

function drawline(from, to) {
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  const canvasRect = canvas.getBoundingClientRect();
  const r1 = from.getBoundingClientRect();
  const r2 = to.getBoundingClientRect();

  // Center of nodes, relative to canvas
  // const x1 = r1.left + r1.width / 2 - canvasRect.left;
  // const y1 = r1.top + r1.height / 2 - canvasRect.top;
  // const x2 = r2.left + r2.width / 2 - canvasRect.left;
  // const y2 = r2.top + r2.height / 2 - canvasRect.top;
  const c1 = { x: r1.left + r1.width / 2 - canvasRect.left, y: r1.top + r1.height / 2 - canvasRect.top };
  const c2 = { x: r2.left + r2.width / 2 - canvasRect.left, y: r2.top + r2.height / 2 - canvasRect.top };

  const p1 = edgePoint(r1, canvasRect, c2.x, c2.y);
  const p2 = edgePoint(r2, canvasRect, c1.x, c1.y);
  line.setAttribute("x1", p1.x);
  line.setAttribute("y1", p1.y);
  line.setAttribute("x2", p2.x);
  line.setAttribute("y2", p2.y);

  line.setAttribute("stroke", "#38bdf8");
  line.setAttribute("stroke-width", "2");
  line.setAttribute("marker-end", "url(#arrow)");

  svg.appendChild(line);
  edges.push({ from, to, line });
  // console.log(edges);
}
function updateline() {
  const canvasRect = canvas.getBoundingClientRect();
  edges.forEach(({ from, to, line }) => {
    const r1 = from.getBoundingClientRect();
    const r2 = to.getBoundingClientRect();
    // const x1 = r1.left + r1.width / 2 - canvasRect.left;
    // const y1 = r1.top + r1.height / 2 - canvasRect.top;
    // const x2 = r2.left + r2.width / 2 - canvasRect.left;
    // const y2 = r2.top + r2.height / 2 - canvasRect.top;
    const c1 = { x: r1.left + r1.width / 2 - canvasRect.left, y: r1.top + r1.height / 2 - canvasRect.top };
    const c2 = { x: r2.left + r2.width / 2 - canvasRect.left, y: r2.top + r2.height / 2 - canvasRect.top };

    const p1 = edgePoint(r1, canvasRect, c2.x, c2.y);
    const p2 = edgePoint(r2, canvasRect, c1.x, c1.y);

    line.setAttribute("x1", p1.x);
    line.setAttribute("y1", p1.y);
    line.setAttribute("x2", p2.x);
    line.setAttribute("y2", p2.y);
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
  const graph = buildGraph();
  const entries = findStartNodes(graph);
  if (entries.length === 0) {
    addLog("No start nodes found. Please ensure there are nodes without incoming edges.");
    return;
  }
  
  let totalLatency = 0;
  const processedNodes = new Map();
  function traverse(entry,prevEntry){
    const prevNode = prevEntry ? prevEntry.node : null;
    console.log("traverse:", entry.node.el.textContent, "| from:", prevNode?.el.textContent, "| cached:", processedNodes.has(entry));

  if (prevNode) {
    animateEdge(prevNode.el, entry.node.el);
  }
    if(processedNodes.has(entry)){
      const existingPromise = processedNodes.get(entry);
      return existingPromise.then((result) => {
        if(prevNode) {
          stopEdge(prevNode.el, entry.node.el);
        }
        return result;
      });
    }
    const promise =  processed(entry.node, prevNode).then((latency) => {
      totalLatency += latency;
       return Promise.all(entry.children.map((childEntry) => traverse(childEntry, entry)));
    });
    processedNodes.set(entry,promise)
    return promise;
  }

  Promise.all(entries.map((entry) => traverse(entry, null)))
    .then(() => {
      addLog("Request completed successfully 🎉");
      alert(`Request SUCCESS in ${totalLatency}ms`);
    })
    .catch((error) => {
      addLog(error);
      alert(`Request FAILED after ${totalLatency}ms`);
    }); 
  // let chain = Promise.resolve();
  // nodes.forEach((node, idx) => {
    // chain = chain.then(() => {
      // return prevNode = idx === 0 ? null : nodes[idx - 1];
      // return latency = processed(node, prevNode).then((latency)=>{
        // totalLatency += latency;
      // });
    // });
  // });
  // chain
    // .then(() => {
      // addLog("Request completed successfully 🎉");
      // alert(`Request SUCCESS in ${totalLatency}ms`);
    // })
    // .catch((error) => {
      // addLog(error);
      // alert(`Request FAILED after ${totalLatency}ms`);
   
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

function deleteNode(nodeData) {
  const edgesRemove = edges.filter((edge) => edge.from === nodeData.el || edge.to === nodeData.el);
  console.log(edgesRemove);

}