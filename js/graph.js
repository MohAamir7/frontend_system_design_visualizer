import {nodes,edges} from "./state.js";



export function buildGraph() {
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

export function findStartNodes(graph) {
  const startNodes = [];
  graph.forEach((entry) => {
    if (entry.parents.length === 0) {
      startNodes.push(entry);
    }
  });
  return startNodes;
}
console.log(buildGraph());

export function edgeExists(from, to) {
  return edges.some((edge) => edge.from === from && edge.to === to);
}
