import { Extension } from "@tiptap/core";
import { Plugin } from "prosemirror-state";
import { DOMParser as ProseMirrorDOMParser } from "prosemirror-model";

function fixCodaLists(html: string): string {
  const container = document.createElement("div");
  container.innerHTML = html;

  // cari li style list-style-type:none → gabung ke list sebelumnya
  const brokenLis = container.querySelectorAll(
    "li[style*='list-style-type: none']"
  );
  brokenLis.forEach((li) => {
    // ambil ul di dalam li ini
    const ul = li.querySelector("ul, ol");
    if (ul && li.parentElement) {
      // pindahkan ul langsung setelah li sebelumnya
      const prev = li.previousElementSibling;
      if (prev) {
        prev.appendChild(ul);
      } else {
        // kalau ga ada previous, tempel ke parent
        li.parentElement.insertBefore(ul, li);
      }
      li.remove();
    }
  });

  // hapus style supaya numbering jalan
  container.querySelectorAll("[style]").forEach((el) => {
    el.removeAttribute("style");
  });

  return container.innerHTML;
}

const FixCodaPasteExtension = Extension.create({
  name: "fixCodaPaste",

  addProseMirrorPlugins() {
    return [
      new Plugin({
        props: {
          handlePaste(view, event) {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return false;

            const html = clipboardData.getData("text/html");
            if (!html) return false;

            if (html.includes("list-style-type: none")) {
              const fixedHtml = fixCodaLists(html);
              const dom = new DOMParser().parseFromString(
                fixedHtml,
                "text/html"
              );

              const parser = ProseMirrorDOMParser.fromSchema(view.state.schema);
              const slice = parser.parseSlice(dom.body);

              const tr = view.state.tr.replaceSelection(slice);
              view.dispatch(tr);
              return true;
            }

            return false; // biarkan default paste
          },
        },
      }),
    ];
  },
});

export default FixCodaPasteExtension;
