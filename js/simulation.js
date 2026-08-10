import { buildGraph,findStartNodes } from "/js/graph.js";
import { animateEdge, stopEdge } from "/js/edges.js";
import {addLog} from "/js/logger.js";


function selectRoutingTargets(entry) {
  const {node,children} = entry;
  if(node.type !== "load-balancer" || children.length === 0) {
    return children;
  }

  const chosen = children[node.rrIndex % children.length];
  node.rrIndex++;
  return [chosen];
}

export function processed(node, prevNode) {
  return new Promise((res, rej) => {
    if (prevNode) {
      animateEdge(prevNode.el, node.el);
    }
    const isCacheHit = node.type === "cache" && node.cached;
    const effectiveLatency = isCacheHit
      ? Math.max(50, node.latency * 0.1)
      : node.latency;

    addLog(
      isCacheHit
        ? `${node.el.textContent} CACHE HIT ⚡`
        : `Request entered ${node.el.textContent}`
    );
    setTimeout(() => {
      const failed = Math.random() < node.failureRate;
      if (prevNode) {
        stopEdge(prevNode.el, node.el);
      }
      if (failed) {
        addLog(`${node.el.textContent} FAILED ❌`);
        rej(`Failed at ${node.el.textContent}`);
      } if (node.type === "cache") {
        node.cached = true;
      }

      addLog(`${node.el.textContent} processed successfully ✅`);
      res({ latency: effectiveLatency, skipChildren: isCacheHit });
    }, effectiveLatency);
  });
}
export function simulateFunc() {
  const graph = buildGraph();
  const entries = findStartNodes(graph);
  if (entries.length === 0) {
    addLog(
      "No start nodes found. Please ensure there are nodes without incoming edges.",
    );
    return;
  }

  let totalLatency = 0;
  const processedNodes = new Map();
   function traverse(entry, prevEntry) {
    const prevNode = prevEntry ? prevEntry.node : null;
    console.log(
      "traverse:",
      entry.node.el.textContent,
      "| from:",
      prevNode?.el.textContent,
      "| cached:",
      processedNodes.has(entry),
    );

    if (prevNode) {
      animateEdge(prevNode.el, entry.node.el);
    }
    if (processedNodes.has(entry)) {
      const existingPromise = processedNodes.get(entry);
      return existingPromise.then((result) => {
        if (prevNode) {
          stopEdge(prevNode.el, entry.node.el);
        }
        return result;
      });
    }
    const promise = processed(entry.node, prevNode).then((result) => {
        totalLatency += result.latency;
        if (result.skipChildren) return Promise.allSettled([]);
        const targets = selectRoutingTargets(entry);
        return Promise.allSettled(
          targets.map((child) => traverse(child, entry))
        );
      })
      .catch((error) => {
        failures.push(error);
        throw error;
      });
    processedNodes.set(entry, promise);
    return promise;
}

  Promise.allSettled(entries.map((entry) => traverse(entry, null)))
    .then(() => {
      // console.log(entry);
      addLog("Request completed successfully 🎉");
      alert(`Request SUCCESS in ${totalLatency}ms`);
    })
    .catch((error) => {
      addLog(error);
      alert(`Request FAILED after ${totalLatency}ms`);
    });}