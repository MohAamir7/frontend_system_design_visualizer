import { updateline } from "./edges.js";


export function makeDragable(el) {
  // console.log("start dragging");
  let offsetX, offsetY;
  el.addEventListener("mousedown", (e) => {
<<<<<<< HEAD
    //  console.log("mousedown target:", e.target, "closest button:", e.target.closest("button"));
=======
     // console.log("mousedown target:", e.target, "closest button:", e.target.closest("button"));
>>>>>>> 12662bb5fe106227ae08b0bab9e557b1f14491d3
    if(e.target.closest("button")) return;
    const rect = el.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;
    // console.log(e.clientX);
    // offsetX = e.clientX;
    // offsetY = e.clientY;
    // console.log(offsetX, offsetY);
    // el.addEventListener("mousemove",mouseMovehandler);
    // el.addEventListener("mouseUp",mouseUp);/
    document.onmousemove = (ev) => {
      el.style.left = `${ev.pageX - offsetX}px`;
      el.style.top = `${ev.pageY - offsetY}px`;
      updateline();
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.dispatchEvent(new Event("diagram:change"));
    };
  });
}
