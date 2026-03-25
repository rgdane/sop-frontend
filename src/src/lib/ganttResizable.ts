export function makeGanttResizable(container: HTMLElement) {
  const headers = container.querySelectorAll<HTMLDivElement>(
    ".gantt_grid_head_cell"
  );
  const scale = container.querySelector<HTMLDivElement>(".gantt_grid_scale");

  const syncHeaderScale = () => {
    if (!scale) return;
    let totalWidth = 0;
    headers.forEach((header) => {
      totalWidth += header.offsetWidth;
    });
    scale.style.width = totalWidth + "px";
  };

  headers.forEach((header, index) => {
    if (header.querySelector(".resizer")) return;

    const resizer = document.createElement("div");
    resizer.className = "resizer";
    Object.assign(resizer.style, {
      width: "5px",
      cursor: "col-resize",
      position: "absolute",
      right: "0",
      top: "0",
      height: "100%",
    });

    header.style.position = "relative";
    header.appendChild(resizer);

    let startX: number;
    let startWidth: number;

    const onMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - startX;
      const newWidth = startWidth + dx;
      if (newWidth > 30) {
        // header.style.width = Math.max(newWidth, 132) + "px";
        let totalWidth = 0;
        headers.forEach((h, i) => {
          if (i === index) {
            totalWidth += newWidth;
          } else {
            totalWidth += h.offsetWidth;
          }
        });

        if (totalWidth >= 390) {
          header.style.width = newWidth + "px";

          const bodyCells = container.querySelectorAll<HTMLDivElement>(
            `.gantt_grid_data .gantt_row .gantt_cell[data-column-index="${index}"]`
          );
          bodyCells.forEach((cell) => (cell.style.width = newWidth + "px"));

          syncHeaderScale();

          const hor = container.querySelector<HTMLElement>(".gantt_hor_scroll");
          if (hor && hor.scrollLeft !== 0) hor.scrollLeft = 0;
        }
      }
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    resizer.addEventListener("mousedown", (e) => {
      startX = e.clientX;
      startWidth = header.offsetWidth;
      document.addEventListener("mousemove", onMouseMove);
      document.addEventListener("mouseup", onMouseUp);
    });
  });
}

export function syncGanttColumnWidths(container: HTMLElement) {
  const headers = container.querySelectorAll<HTMLDivElement>(
    ".gantt_grid_head_cell"
  );

  headers.forEach((header, index) => {
    const width = header.offsetWidth;

    const bodyCells = container.querySelectorAll<HTMLDivElement>(
      `.gantt_grid_data .gantt_row .gantt_cell[data-column-index="${index}"]`
    );
    bodyCells.forEach((cell) => {
      cell.style.width = width + "px";
    });
  });
}
