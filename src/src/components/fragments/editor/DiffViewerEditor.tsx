"use client";

import React from "react";
import htmldiff from "node-htmldiff";
import { ViewerEditor } from "./ViewerEditor";
import { renderJSONToHTML } from "./utils/renderHTML";

interface DiffViewerEditorProps {
  oldJson: any;
  newJson: any;
}

/**
 * Hapus list item yang tidak memiliki isi atau span diff,
 * lalu hapus unordered list/ordered list yang tidak memiliki item.
 * Fungsi ini digunakan untuk membersihkan hasil diff yang kadang menyisakan tabel kosong.
 * @param {string} html - string HTML yang akan diolah
 * @returns {string} - string HTML yang sudah diolah
 */
const cleanEmptyLists = (html: string): string => {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("li").forEach((li) => {
    const text = li.textContent?.trim() || "";
    const hasVisibleSpan = li.querySelector("span.add, span.remove");
    if (!text && !hasVisibleSpan) li.remove();
  });

  doc.querySelectorAll("ul, ol").forEach((list) => {
    if (!list.querySelector("li")) list.remove();
  });

  return doc.body.innerHTML;
};

/**
 * Memperbaiki tabel yang rusak akibat diff removal.
 * Fungsi ini akan menggeserkan element yang bukan td atau th
 * di dalam tabel ke parent element tabel.
 * @param {string} html - string HTML yang akan diolah
 * @returns {string} - string HTML yang sudah diolah
 */
const repairTables = (html: string): string => {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("table").forEach((table) => {
    const parent = table.parentElement;
    if (!parent) return;

    table.querySelectorAll(":scope > *").forEach((child) => {
      if (
        child.tagName.match(/^(H[1-6]|P|DIV|SECTION|ARTICLE)$/i) &&
        !child.closest("td,th")
      ) {
        parent.insertBefore(child, table);
      }
    });
  });

  return doc.body.innerHTML;
};

const stripEmptyTables = (html: string): string => {
  if (typeof window === "undefined") return html;
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  doc.querySelectorAll("table").forEach((table) => {
    const text = table.textContent?.trim() || "";
    const hasAddSpan = table.querySelector(".add");
    const hasRemoveSpan = table.querySelector(".remove");

    if (
      !hasAddSpan &&
      (!text || text === "−" || text === "-") &&
      hasRemoveSpan
    ) {
      table.remove();
    }
  });

  return doc.body.innerHTML;
};

/**
 * Normalize the HTML of a table by removing any trailing whitespace and
 * elements before the closing table tag.
 * @param {string} html - the HTML string to normalize
 * @returns {string} - the normalized HTML string
 */
const normalizeTables = (html: string): string => {
  return html.replace(/<\/table>\s*(?=<[phuoldiv])/g, "</table>\n");
};

/**
 * Mengonversi hasil diff menjadi bentuk HTML yang dapat ditampilkan.
 * Fungsi ini akan menggantikan tag <del> dan <ins> menjadi tag <span>
 * dengan kelas "add" atau "remove" dan tambahkan kelas "diff-block".
 * Fungsi ini juga akan menghapus tabel yang hanya berisi hasil diff kosong.
 * @param {string} html - string HTML yang akan diolah
 * @param {string} type - tipe dari hasil diff, dapat berupa "add" atau "remove"
 * @returns {string} - string HTML yang sudah diolah
 */
const convertTags = (html: string, type: "add" | "remove") => {
  let result = html;
  result = result.replace(/\s*data-operation-index="\d+"\s*/g, "");

  if (type === "add") {
    result = result.replace(/<del[^>]*>.*?<\/del>/g, "");
    result = result.replace(/<ins[^>]*>/g, '<span class="add diff-block">');
    result = result.replace(/<\/ins>/g, "</span>");
  } else {
    result = result.replace(/<ins[^>]*>.*?<\/ins>/g, "");
    result = result.replace(/<del[^>]*>/g, '<span class="remove diff-block">');
    result = result.replace(/<\/del>/g, "</span>");
  }

  result = normalizeTables(result);
  result = repairTables(result);
  result = cleanEmptyLists(result);

  if (type === "remove") result = stripEmptyTables(result);

  return result;
};

const DiffViewerEditor: React.FC<DiffViewerEditorProps> = ({
  oldJson,
  newJson,
}) => {
  const oldHTML = renderJSONToHTML(oldJson);
  const newHTML = renderJSONToHTML(newJson);

  let diffHtml = htmldiff(oldHTML, newHTML);
  diffHtml = normalizeTables(diffHtml);
  diffHtml = repairTables(diffHtml);

   const highlightedOld = convertTags(diffHtml, "remove");
   const highlightedNew = convertTags(diffHtml, "add");
  return (
    <div>
      <style>{`
        .diff-block {
          display: inline-flex;
          align-items: center;
          gap: 0.35rem;
          border-radius: 0.35rem;
          padding: 0 0.35rem;
          font-weight: 500;
          box-sizing: border-box;
          vertical-align: middle;
        }
         .add {
          width: 100%;
          background-color: #e6ffed;
          color: #166534;
          border: 1px solid #a7f3d0;
        }
        .dark .add {
          background-color: #064e3b50;
          color: #d1fae5;
          border: 1px solid #10b98150;
        }
        .remove {
          width: 100%;
          background-color: #ffecec;
          color: #b91c1c;
          border: 1px solid #fb2c3650;
          text-decoration: line-through;
        }
        .dark .remove {
          background-color: #b91c1c50;
          color: #fee2e2;
          border: 1px solid #f8717150;
        }
        ul, ol { padding-left: 1.5rem; margin: 0.25rem 0; }
        li { margin-bottom: 0.2rem; }
      `}</style>

      <div className="flex w-full gap-3">
        {/* OLD VERSION */}
        <div className="w-full">
          <ViewerEditor
            value={highlightedOld.replace(
              /<span class="remove diff-block">/g,
              `<span class="remove diff-block"><span class='diff-icon'>−</span>`
            )}
          />
        </div>

        {/* NEW VERSION */}
        <div className="w-full">
          <ViewerEditor
            value={highlightedNew.replace(
              /<span class="add diff-block">/g,
              `<span class="add diff-block"><span class='diff-icon'>+</span>`
            )}
          />
        </div>
      </div>
    </div>
  );
};

export default DiffViewerEditor;
