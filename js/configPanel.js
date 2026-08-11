import {
  latency,
  failure,
  throughput,
  retries,
  setSelectForNodeEdit,
  selectForNodeEdit,
} from "/js/state.js";

export function selectEditNode(nodeData) {
  setSelectForNodeEdit(nodeData);
  // selectNodeEdit = nodeData;
  latency.value = nodeData.latency;
  failure.value = (nodeData.failure * 100).toFixed(2);
  throughput.value = nodeData.throughput || 0;
  retries.value = nodeData.maxRetries || 0;

  document.querySelectorAll(".node-instance").forEach((el) => {
    el.classList.remove("editing");
  });
  nodeData.el.classList.add("editing");
}

export function editPanel() {
  setSelectForNodeEdit(null);
  // selectNodeEdit = null;
  latency.value = "";
  failure.value = "";
  retries.value = "";
  throughput.value = "";
  document.querySelectorAll(".node-instance").forEach((el) => {
    el.classList.remove("editing");
  });
}

export function initConfigPanelInputs() {
  latency.addEventListener("input", (e) => {
    if (!selectedForEdit) return;
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) selectedForEdit.latency = value;
  });
  failure.addEventListener("input", (e) => {
    if (!selectForNodeEdit) return;
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0 && value <= 100) {
      selectForNodeEdit.failure = value / 100;
    }
  });

  throughput.addEventListener("input", (e) => {
    if (!selectForNodeEdit) return;
    const value = parseFloat(e.target.value);
    if (!isNaN(value) && value >= 0) {
      selectForNodeEdit.throughput = isNaN(value) ? 0 : value;
    }
  });
  retries.addEventListener("input", (e) => {
    if (!selectForNodeEdit) return;
    const value = parseInt(e.target.value, 10);
    selectForNodeEdit.maxRetries = !isNaN(value) && value >= 0 ? value : 0;
  });
}
