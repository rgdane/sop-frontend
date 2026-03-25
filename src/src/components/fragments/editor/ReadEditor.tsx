import { EditorContent, JSONContent, useEditor } from "@tiptap/react";
import { EditorExtensions } from "./extensions";
import { CommentMark } from "./extensions/commentMark/commentMark";
import { useMemo, useState } from "react";
import { CommentEditor } from "./CommentEditor";

/**
 * Check if content is HTML string or JSON
 * HTML strings start with '<' or are simple text
 * JSON content is an object with 'type' property
 */
const isHtmlContent = (content: any): content is string => {
  if (typeof content === 'string') {
    return true;
  }
  return false;
};

/**
 * Check if content is JSON (Tiptap format)
 */
const isJsonContent = (content: any): content is JSONContent => {
  return typeof content === 'object' && content !== null && 'type' in content;
};

export const ReadEditor = ({ content }: { content: JSONContent | string }) => {
  const [activeComment, setActiveComment] = useState<any>(null);
  
  // Determine the content format and use appropriate rendering
  const parsedContent = useMemo(() => {
    if (!content) return null;
    
    // If it's a string, check if it's HTML or a JSON string that needs parsing
    if (typeof content === 'string') {
      // Try to parse as JSON first (for backward compatibility with stringified JSON)
      try {
        const parsed = JSON.parse(content);
        if (isJsonContent(parsed)) {
          return parsed;
        }
      } catch {
        // Not JSON, treat as HTML string
      }
      // Return as HTML string - Tiptap can handle HTML strings directly
      return content;
    }
    
    // It's already a JSON object
    return content;
  }, [content]);

  const editor = useEditor({
    editable: false,
    extensions: [
      ...EditorExtensions({ useTitle: false }),
      CommentMark.configure({
        onCommentClick: (commentId) => {
          setActiveComment(commentId)
        },
      })
    ],
    content: parsedContent,
    immediatelyRender: false,
  }, [parsedContent]);

  return (
    <div className="">
      <EditorContent editor={editor} />
      {activeComment && (
        <CommentEditor activeComment={{ id: activeComment }} setActiveComment={setActiveComment} />
      )}
    </div>
  );
};
