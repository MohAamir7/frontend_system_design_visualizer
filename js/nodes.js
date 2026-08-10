import {canvas,nodes,nextNodeId,selectForNodeEdit} from "./state.js";
import { makeDragable } from "./dragging.js";
import { deleteEdge } from "./edges.js";
import { selectEditNode, editPanel } from "./configPanel.js";
import { edges } from "./state.js";




export function createNodeInstances(template) {
  console.log("template created");

    // const latency = document.getElementById("latency");
    // const failureRate = document.getElementById("failure");
    // const throughput = document.getElementById("throughput");
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
    let nodecounter = nextNodeId();

    const nodeData = {
      id: nodecounter++,
      type: template.dataset.type,
      el,
      latency: 5000,
      failureRate: 0.01,
      throughput: 0,
      cached:false,
      rrIndex:0
    };

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "X";
    deleteBtn.className = "delete-btn";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      deleteNode(nodeData);
    });
    el.appendChild(deleteBtn);

    const editBtn = document.createElement("button");
    editBtn.textContent = "⚙";
    editBtn.className = "edit-btn";
    editBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      // editNode(nodeData);
      selectEditNode(nodeData);
      console.log("Edit button clicked for node:", nodeData);
    });
    el.appendChild(editBtn);

    canvas.appendChild(el);
    makeDragable(el);

    // 
    nodes.push(nodeData);
    return nodeData;
    // console.log(nodes[0].id);
  };
export function deleteNode(nodeData) {
  const edgesRemove = edges.filter(
    (edge) => edge.from === nodeData.el || edge.to === nodeData.el,
  );
  edgesRemove.forEach((edge) => {
    edge.line.remove();
    const idx = edges.indexOf(edge);
    edges.splice(idx, 1);
  });

  if(selectForNodeEdit === nodeData) {
    editPanel();
  }
  nodeData.el.remove();
  const Nodeidx = nodes.indexOf(nodeData);
  if (Nodeidx !== -1){
    nodes.splice(Nodeidx, 1);
  }
}

