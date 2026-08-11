


export const canvas = document.getElementById("canvas");
export const svg = document.getElementById("connections");
export const simulateBtn = document.getElementById("simulate-btn");

export const latency = document.getElementById("latency");
export const failure = document.getElementById("failure");
export const throughput = document.getElementById("throughput");
export const retries = document.getElementById("retries");


// Graph data
export const nodes = [];
export const edges = [];

export let nodeCounter = 0;
export function nextNodeId() {
  return nodeCounter++;
}

export let selectForNodeEdit = null;
export function setSelectForNodeEdit(value) {
  selectForNodeEdit = value;
}

export let selectNode = null;
export function setSelectNode(value) {
  selectNode = value;
}

