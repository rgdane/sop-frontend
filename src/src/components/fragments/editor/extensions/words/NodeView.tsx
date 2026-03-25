import { NodeViewWrapper } from "@tiptap/react";

export const WordNodeView = ({ node, extension }: any) => {
  const { word, locale } = node.attrs;
  const dictionary = extension.options.dictionary || {};

  const translatedWord = dictionary[word]?.[locale] || word;

  return (
    <NodeViewWrapper className="word-node inline">
      <span
        data-word={word}
        data-locale={locale}
        className="word-node-content px-1 py-0.5 bg-blue-100 dark:bg-blue-900 rounded"
        contentEditable={false}
      >
        {translatedWord}
      </span>
    </NodeViewWrapper>
  );
};
