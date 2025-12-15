const canvas = document.getElementById("canvas");
const nodes = [];

document.querySelectorAll(".node").forEach((template) => {
  template.addEventListener("click", () => {
    // console.log("active");
    const el = document.createElement("div");
    el.className = "node-instance";
    el.textContent = template.textContent;
    el.style.top = "100px";
    el.style.left = "100px";
    canvas.appendChild(el);
    // makeDragable(el);

    nodes.push({
      id: Date.now(),
      el,
      latency: 50,
      failureRate: 0.01,
    });
    console.log(nodes[0].id);
  });
});
