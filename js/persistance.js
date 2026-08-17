import{nodes,canvas,edges, latency, throughput} from './state.js';
import {createRestoredNode} from './nodes.js';
import {drawline} from './edges.js';
import{addLog} from './logger.js';


const STORAGE_KEY = "sdv:diagram";


export function serializeDiagram() {

    return {
        nodes: nodes.map(node => ({
            id: node.id,
            type: node.type,
            label: node.el.querySelector('span').textContent || node.type,
            left: node.el.style.left,
            top: node.el.style.top,
            latency: node.latency,
            failure: node.failure,
            throughput: node.throughput,
            maxRetries: node.maxRetries
        })),
        edges: edges.map(edge => ({
            from: nodes.find((n)=>n.el === edge.from)?.id,
            to: nodes.find((n)=>n.el === edge.to)?.id
        }))
        .filter((edge) => edge.from !== undefined && edge.to !== undefined)
    };
}

export function saveToLocalStorage() {
    try {
        const serializedData = localStorage.setItem(STORAGE_KEY,JSON.stringify(serializeDiagram()));
    }catch (error) {
        console.error("Error loading diagram from localStorage:", error);
    }
}

export function clearCanvas(){
    nodes.slice().forEach((n)=> {
        n.el.remove();
        
    });
    nodes.length =0;
    edges.slice().forEach((e)=>{
        e.line.remove();
        e.hitArea.remove();
    });
    edges.length =0;
}

export function loadDiagram(data) {
  clearCanvas();
  const idToNode = new Map();

  data.nodes.forEach((saved) => {
    const nodeData = createRestoredNode(saved);
    idToNode.set(saved.id, nodeData);
  });

  data.edges.forEach(({ from, to }) => {
    const fromNode = idToNode.get(from);
    const toNode = idToNode.get(to);
    if (fromNode && toNode) drawline(fromNode.el, toNode.el);
  });
}

export function loadFromLocalStorage() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return false;

  try {
    loadDiagram(JSON.parse(raw));
    addLog("Diagram restored from your last session.");
    return true;
  } catch (err) {
    console.error("Failed to load saved diagram:", err);
    return false;
  }
}

export function exportDiagram() {
  const blob = new Blob([JSON.stringify(serializeDiagram(), null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "system-design-diagram.json";
  a.click();
  URL.revokeObjectURL(url);
}

export function importDiagramFromFile(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      loadDiagram(JSON.parse(reader.result));
      saveToLocalStorage();
      addLog("Diagram imported successfully.");
    } catch (err) {
      addLog("Import failed - the file isn't a valid diagram.");
      // console.error(err);
    }
  };
  reader.readAsText(file);
}
export function clearDiagram(){
    clearCanvas();
    localStorage.removeItem(STORAGE_KEY);
    document.dispatchEvent(new Event("diagram:change"))
}

