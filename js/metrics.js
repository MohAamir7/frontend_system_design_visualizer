// Tracks outcomes for a single simulation run and renders them into a
// small live dashboard. Counters reset at the start of every simulate()
// call, so each click shows fresh numbers for that specific run.

const state = {
  totalRequests: 0,
  successCount: 0,
  failureCount: 0,
  totalLatency: 0, // sum of latency across successful requests only
};

let panelEl = null;

export function initMetricsPanel(container) {
  panelEl = container;
  render();
}

export function resetMetrics() {
  state.totalRequests = 0;
  state.successCount = 0;
  state.failureCount = 0;
  state.totalLatency = 0;
  render();
}

export function recordSuccess(latency) {
  state.totalRequests += 1;
  state.successCount += 1;
  state.totalLatency += latency;
  render();
}

export function recordFailure() {
  state.totalRequests += 1;
  state.failureCount += 1;
  render();
}

function render() {
  if (!panelEl) return;

  const errorRate =
    state.totalRequests === 0
      ? 0
      : (state.failureCount / state.totalRequests) * 100;

  const avgLatency =
    state.successCount === 0 ? 0 : state.totalLatency / state.successCount;

  panelEl.innerHTML = `
    <div class="metric">
      <span class="metric-label">Total Requests</span>
      <span class="metric-value">${state.totalRequests}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Successful</span>
      <span class="metric-value metric-success">${state.successCount}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Failed</span>
      <span class="metric-value metric-failure">${state.failureCount}</span>
    </div>
    <div class="metric">
      <span class="metric-label">Error Rate</span>
      <span class="metric-value">${errorRate.toFixed(1)}%</span>
    </div>
    <div class="metric">
      <span class="metric-label">Avg Latency</span>
      <span class="metric-value">${avgLatency.toFixed(0)}ms</span>
    </div>
  `;
}