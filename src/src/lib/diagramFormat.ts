export function diagramFormat(data: any): string {
  let text = "flowchart TD\n";

  if (data && data.length > 0) {
    data.sort((a: any, b: any) => a.index - b.index);

    text += `START(("Mulai"))\n`;
    text += `START --> N${data[0].index}\n`;

    data.forEach((item: any, i: number) => {
      const nodeId = `N${item.index}`;
      const shape = convertShapeDiagram(item.has_flowchart?.type, item.name);

      text += `${nodeId}${shape}\n`;

      if (item.has_flowchart?.type === "decision") {
        if (item.next_index) {
          text += `${nodeId} -- Ya --> N${item.next_index}\n`;
        }
        if (item.prev_index) {
          text += `${nodeId} -- Tidak --> N${item.prev_index}\n`;
        }
      } else {
        const next = data[i + 1];
        if (next) {
          text += `${nodeId} --> N${next.index}\n`;
        } else {
          text += `${nodeId} --> END\n`;
        }
      }
    });

    text += `END(("Selesai"))\n`;
  }

  return text;
}

function convertShapeDiagram(type: string, name: string) {
  switch (type) {
    case "start":
      return `(("${name}"))`;
    case "process":
      return `("${name}")`;
    case "decision":
      return `{${name}}`;
    case "end":
      return `(("${name}"))`;
    default:
      return `("${name}")`;
  }
}
