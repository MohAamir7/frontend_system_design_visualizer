import{canvas,simulateBtn,selectNode,setSelectNode} from "/js/state.js";
import { createNodeInstances } from "/js/nodes.js";
import { drawline } from "/js/edges.js";
import { edgeExists } from "/js/graph.js";
import { simulateFunc } from "/js/simulation.js";
import { addLog } from "/js/logger.js";
import { initConfigPanelInputs } from "/js/configPanel.js";
import { initMetricsPanel } from "./metrics.js";

import { saveToLocalStorage, loadFromLocalStorage, exportDiagram, importDiagramFromFile,clearDiagram } from "/js/persistance.js";

loadFromLocalStorage();

document.addEventListener("diagram:change", saveToLocalStorage);

document.getElementById("export-btn").addEventListener("click", exportDiagram);
document.getElementById("clear-btn").addEventListener("click",(()=>{
  const confirmed = confirm("Clear the entire diagram? This can't be undone.");
  if(confirmed) clearDiagram();
}));

const importInput = document.getElementById("import-input");
document.getElementById("import-btn").addEventListener("click", () => importInput.click());
importInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (file) importDiagramFromFile(file);
});


document.querySelectorAll(".node").forEach((template) => {
  template.addEventListener("click", () =>
    // console.log("template called");
    
    createNodeInstances(template));
});

// Click-to-connect: first click selects a node, second click draws an edge.
canvas.addEventListener("click", (e) => {
  if (!e.target.classList.contains("node-instance")) return;
  if (!selectNode) {
    setSelectNode(e.target);
    e.target.classList.add("active");
    return;
  }

  if (selectNode === e.target) {
    addLog("Cannot connect a node to itself.");
    selectNode.classList.remove("active");
    setSelectNode(null);
    return;
  }

  if (edgeExists(selectNode, e.target)) {
    addLog("Edge already exists between these nodes.");
    selectNode.classList.remove("active");
    setSelectNode(null);
    return;
  }

  drawline(selectNode, e.target);
  selectNode.classList.remove("active");
  setSelectNode(null);
});


initConfigPanelInputs();
initMetricsPanel(document.getElementById("metrics-panel"));
simulateBtn.addEventListener("click", simulateFunc);

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


