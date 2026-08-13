import { buildGraph,findStartNodes } from "/js/graph.js";
import { animateEdge, stopEdge } from "/js/edges.js";
import {addLog} from "/js/logger.js";
import { resetMetrics, recordSuccess, recordFailure } from "/js/metrics.js";


function selectRoutingTargets(entry) {
  const {node,children} = entry;
  if(node.type !== "load-balancer" || children.length === 0) {
    return children;
  }

  const chosen = children[node.rrIndex % children.length];
  node.rrIndex++;
  return [chosen];
}

const Retry_BackOff_Ms = 500;
const Rate_Limit_Window_Ms = 1000;
function isRateLimited(node) {
  if(!node.throughput || node.throughput <= 0) {
    return false;
  }
  const now = Date.now();
  node.requestLog = node.requestLog.filter((timestamp) => now - timestamp < Rate_Limit_Window_Ms);
  if(node.requestLog.length >= node.throughput) {
    return true;
  }
  node.requestLog.push(now);
  return false;
}

function attemptOnce(node){
  return new Promise((res, rej) => {
    const isCacheHit = node.type === "cache" && node.cached;
    const effectiveLatency = isCacheHit
      ? Math.max(50, node.latency * 0.1)
      : node.latency;

    // addLog(
    //   isCacheHit
    //     ? `${node.el.textContent} CACHE HIT ⚡`
    //     : `Request entered ${node.el.textContent}`
    // );
    setTimeout(() => {
      const failed = Math.random() < node.failure;
      if (failed) {
        // stopEdge(prevNode.el, node.el);
        rej();
        return;
      }
     if (node.type === "cache") {
        node.cached = true;
      }

      // addLog(`${node.el.textContent} processed successfully ✅`);
      res({ latency: effectiveLatency, skipChildren: isCacheHit });
    }, effectiveLatency);
  });
}
function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
export async function processed(node, prevNode) {
  console.log(node);
  if(prevNode) {
    animateEdge(prevNode.el, node.el);
  }

  if(isRateLimited(node)) {
    recordFailure();
    addLog(`${node.el.textContent} RATE LIMITED 🚫`);
    if(prevNode) {
      stopEdge(prevNode.el, node.el);
    }
    throw `Rate limited at ${node.el.textContent}`;
  }
  const isCacheHit = node.type === "cache" && node.cached;
  addLog(
    isCacheHit
      ? `${node.el.textContent} CACHE HIT ⚡`
      : `Request entered ${node.el.textContent}`
  );
  const totalAttempts = node.maxRetries + 1;
  let totalLatencyUsed = 0;
 
  for (let attempt = 1; attempt <= totalAttempts; attempt += 1) {
    try {
      const result = await attemptOnce(node);
      totalLatencyUsed += result.latency;
 
      if (prevNode) {
        stopEdge(prevNode.el, node.el);
      }
      addLog(`${node.el.textContent} processed successfully ✅`);
      recordSuccess(totalLatencyUsed);
      return { latency: totalLatencyUsed, skipChildren: result.skipChildren };
    } catch {
      totalLatencyUsed += node.latency;
      const willRetry = attempt < totalAttempts;
 
      addLog(
        willRetry
          ? `${node.el.textContent} FAILED ❌ - retrying (${attempt}/${node.maxRetries})`
          : `${node.el.textContent} FAILED ❌`
      );
 
      if (willRetry) {
        await wait(Retry_BackOff_Ms);
      } else {
        recordFailure();
        if (prevNode) {
          stopEdge(prevNode.el, node.el);
        }
        throw `Failed at ${node.el.textContent} after ${totalAttempts} attempt(s)`;
      }
    }
  }
}
export function simulateFunc() {
  resetMetrics();
  const graph = buildGraph();
  const entries = findStartNodes(graph);
  if (entries.length === 0) {
    addLog(
      "No start nodes found. Please ensure there are nodes without incoming edges.",
    );
    return;
  }

  let totalLatency = 0;
  const failures = [];
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
      return existingPromise.finally(() => {
        if (prevNode) {
          stopEdge(prevNode.el, entry.node.el);
        }
        // return result;
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
      if(failures.length === 0) {
      addLog("Request completed successfully 🎉");
      alert(`Request SUCCESS in ${totalLatency}ms`);
      } else {
        addLog(`Request completed with ${failures.length} failure(s)`);
    alert(
      `Request FAILED at:\n${failures.join(
        "\n"
      )}\n\nTotal latency so far: ${totalLatency}ms`
    );
      }
    }
  )
}