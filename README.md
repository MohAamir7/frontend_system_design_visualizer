# System Design Visualizer

An interactive, browser-based tool for building and simulating system architecture
diagrams. Drag components onto a canvas, connect them, configure per-node
latency, failure rate, throughput and retries, then run a simulated request
through the graph and watch it flow in real time — branching across a load
balancer, retrying on failure, hitting a warmed-up cache, getting rate
limited, all while a live metrics panel tracks the outcome.

Built with plain HTML, CSS and vanilla JavaScript (ES modules) — no framework,
no build step.

## Features

**Diagramming**
- Drag-and-drop components — Client, Load Balancer, API Server, Cache,
  Database, Message Queue — each with distinct, type-based styling.
- Directed, animated connections — click two nodes to connect them; an
  arrowhead and flowing dashed line show request direction during simulation.
- Hover a node for quick actions: **⚙ edit** (load it into the configuration
  panel) and **× delete** (remove it and every connection attached to it).
  Click directly on a connection line to delete just that edge.
- Diagrams persist automatically — every change auto-saves to your browser's
  local storage, so a refresh restores exactly where you left off. **Export**
  downloads the current diagram as a JSON file; **Import** loads one back in;
  **Clear Diagram** wipes the canvas and the saved state after a confirmation.

**Simulation engine**
- Graph-based traversal, not a flat list — branches run in parallel, and a
  node reached by more than one parent (e.g. two API servers sharing one
  database) is only processed once, with every incoming edge animating and
  stopping correctly regardless of which branch finishes first.
- **Caching** — a Cache node's first hit is a full-latency miss that forwards
  downstream; every hit after that resolves almost instantly and stops there,
  exactly like a real cache. Cache state persists across repeated simulation
  runs (not just within one run) for a realistic warm/cold demonstration.
- **Load balancing** — a Load Balancer node routes each request to exactly
  one child at a time using round-robin, cycling through its backends on
  successive simulation runs instead of broadcasting to all of them.
- **Retries with backoff** — configure `Max Retries` per node; a failed
  attempt waits briefly and tries again before finally propagating failure
  upward. The connection animation stays on for the whole sequence, so a
  request that succeeds on its third attempt looks the same in-flight as one
  that succeeds on its first.
- **Rate limiting** — set a node's `Throughput` (requests/sec) and it will
  reject any request beyond that limit within a rolling one-second window,
  independent of and shared across concurrent simulation runs.
- **Failure handling across parallel branches** — a failure in one branch
  never cuts other branches off early; the simulation waits for everything to
  finish, then reports every failure that occurred, with total latency.

**Live metrics panel**
- Total requests, successful/failed counts, error rate, and average latency
  update live as each node finishes — not just once at the end — so you can
  watch the dashboard react in real time as the simulation animates.

## Project structure

```
system-design-visualizer/
├── index.html              # Markup + SVG marker definition
├── src/
│   ├── css/
│   │   └── style.css       # All styling, theming, node-type colors
│   └── js/
│       ├── state.js        # DOM refs + shared mutable app state
│       ├── logger.js       # Console logging helper
│       ├── graph.js        # Adjacency graph construction + traversal helpers
│       ├── edges.js        # Drawing, updating, animating, deleting connections
│       ├── dragging.js     # Drag-to-move behavior for nodes
│       ├── nodes.js        # Node creation and deletion
│       ├── configPanel.js  # Node configuration side panel
│       ├── simulation.js   # Simulation engine - traversal, caching, load
│       │                     balancing, retries, rate limiting
│       ├── metrics.js      # Live metrics tracking and rendering
│       ├── persistence.js  # Auto-save, export/import, clear diagram
│       └── main.js         # Entry point - wires everything together
└── assets/
    └── screenshots/        # (add screenshots here for the README)
```

## Running locally

This project uses native ES modules (`<script type="module">`), which browsers
block from loading over the `file://` protocol due to CORS restrictions. You
need a local static server - any of these work:

```bash
# Python
python3 -m http.server 5500

# Node (via npx, no install needed)
npx serve .
```

Then open `http://localhost:5500` (or whatever port your tool prints).

If you use VS Code, the **Live Server** extension works too - right-click
`index.html` → "Open with Live Server".

## How it works

1. Click a component in the sidebar to place an instance on the canvas.
2. Click one node, then another, to draw a directed connection between them.
3. Hover a node to reveal:
   - **⚙ (edit)** - load its latency, failure rate, throughput and max
     retries into the configuration panel.
   - **× (delete)** - remove the node and any connections attached to it.
4. Click directly on a connection line to delete just that edge.
5. Click **Simulate** to send a request through the graph, starting from every
   node with no incoming connections, and watch the live metrics panel update
   as it runs.
6. Use **Export** / **Import** to save a diagram as a file or load one back
   in, and **Clear Diagram** to start over.

## Example scenarios to try

- **Caching**: Client → Cache → Database. Run Simulate twice without
  refreshing - the first run is a full-latency miss, the second is a
  near-instant hit that never reaches the database.
- **Load balancing**: Client → Load Balancer → two API Servers. Click
  Simulate repeatedly - traffic alternates between the two backends.
- **Retries**: set a node's Failure Rate to `50%` and Max Retries to `3` -
  watch it fail, back off, and retry in the console log before succeeding or
  finally giving up.
- **Rate limiting**: set a node's Throughput to `1` and connect two Clients
  to it - one request goes through, the other is rejected as rate limited.

## Roadmap

- Selectable load balancing strategies (random, least-connections)
- Replication / failover nodes
- Latency percentile (p95/p99) tracking in the metrics panel
- A visual legend explaining node-type colors

## License

MIT - see [LICENSE](./LICENSE).
