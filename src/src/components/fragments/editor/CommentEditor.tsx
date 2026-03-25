import { useEffect, useState, useRef } from "react";
import { Modal, Input, Button, Spin } from "antd";
import { SmileOutlined, CloseOutlined, SendOutlined } from "@ant-design/icons";
import { addReview, getComments } from "./utils/comment-utils";
import { renderAvatar } from "@/components/ui/Avatar";
import EmojiPicker, { EmojiClickData, Theme } from "emoji-picker-react";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const { TextArea } = Input;

interface Review {
  _elementId: string;
  _id: number;
  _type: string;
  reviewId: string;
  value: string;
}

interface CommentData {
  _elementId: string;
  _id: number;
  _type: string;
  commentId: string;
  has_review: Review[];
  value: string;
}

interface CommentEditorProps {
  setActiveComment: any;
  activeComment: any;
  commentId?: any;
}

export const CommentEditor = ({ activeComment, setActiveComment, commentId }: CommentEditorProps) => {
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<any>(null);

  const isDark = useSelector((state: RootState) => state.theme.isDark);

  const handleSend = async () => {
    try {
      const payload = {
        commentId: activeComment.id,
        id: crypto.randomUUID(),
        value: comment,
        isolated: true
      };
      await addReview(payload);
      setComment("");
      await fetchReviews();
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res: CommentData = await getComments(activeComment.id);
      if (res && res.has_review) {
        setReviews(res.has_review);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setComment((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    textAreaRef.current?.focus();
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  useEffect(() => {
    if (activeComment?.id) {
      fetchReviews();
    }
  }, [activeComment?.id]);

  return (
    <>
      <Modal
        open={!!activeComment}
        onCancel={() => setActiveComment(null)}
        footer={null}
        centered
        width={440}
        styles={{
          body: {
            padding: 0,
          },
          content: {
            padding: 0,
            borderRadius: 12,
            overflow: 'visible', // Ubah dari hidden ke visible agar emoji picker tidak terpotong
          },
          mask: { backgroundColor: 'rgba(0, 0, 0, 0.65)' }
        }}
        closeIcon={null}
      >
        <div className={isDark ? 'dark' : ''}>
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 dark:border-[#2a2a2a] bg-white dark:bg-[#1a1a1a]">
              <div>{reviews.length} Comment</div>
              <div className="flex items-center gap-2">
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => setActiveComment(null)}
                  className="hover:bg-gray-100 dark:hover:bg-[#2a2a2a]"
                />
              </div>
            </div>

            {/* Reviews List */}
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <Spin />
                </div>
              ) : reviews.length > 0 ? (
                <div>
                  {reviews.map((review, index) => (
                    <div
                      key={review.reviewId}
                      className={`px-4 py-3 ${index !== reviews.length - 1
                        ? 'border-b border-gray-200 dark:border-[#2a2a2a]'
                        : ''
                        }`}
                    >
                      <div className="flex items-start gap-3">
                        {renderAvatar([{ name: "Nadhif" }])}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col mb-1">
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              Nadhif
                            </span>
                            <span className="text-xs text-gray-600 dark:text-gray-400">
                              Today at 11:58 AM
                            </span>
                          </div>
                          <p className="text-sm text-gray-900 dark:text-white break-words leading-relaxed">
                            {review.value}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    No comments yet
                  </p>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200 dark:border-[#2a2a2a]" />

            {/* Input Area */}
            <div className="px-4 py-3 bg-white dark:bg-[#1a1a1a]">
              <div className="flex items-start gap-3">
                {renderAvatar([{ name: "Admin" }])}
                <div className="flex-1">
                  <div className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                    Admin
                  </div>
                  <div className="bg-gray-200 dark:bg-[#2a2a2a] rounded-md">
                    <TextArea
                      ref={textAreaRef}
                      placeholder="Write something"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      autoSize={{ minRows: 1, maxRows: 6 }}
                      variant="borderless"
                      className="px-3 py-2 text-sm bg-transparent placeholder:text-gray-400! dark:placeholder:text-gray-400"
                      style={{ resize: "none" }}
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between mt-2 relative">
                    <div className="relative" ref={emojiPickerRef}>
                      <Button
                        type="text"
                        shape="circle"
                        size="small"
                        icon={<SmileOutlined />}
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        className={`text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#2a2a2a] ${showEmojiPicker ? 'bg-gray-100 dark:bg-[#2a2a2a]' : ''
                          }`}
                      />
                    </div>

                    <Button
                      type="primary"
                      size="small"
                      icon={<SendOutlined />}
                      onClick={handleSend}
                      disabled={!comment.trim()}
                      className="bg-blue-600 hover:bg-blue-700 border-0 text-white disabled:bg-gray-400 dark:disabled:bg-gray-700 disabled:text-gray-300 dark:disabled:text-gray-500"
                    >
                      Submit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Modal>

      {/* Emoji Picker sebagai Fixed Portal - di luar Modal */}
      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className="fixed z-[10000]"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className={`rounded-xl overflow-hidden shadow-2xl border ${isDark
              ? 'border-[#333] bg-[#1a1a1a]'
              : 'border-gray-200 bg-white'
              }`}
          >
            <EmojiPicker
              onEmojiClick={handleEmojiClick}
              theme={isDark ? Theme.DARK : Theme.LIGHT}
              width={320}
              height={400}
              searchPlaceHolder="Search emoji..."
              previewConfig={{ showPreview: false }}
            />
          </div>
        </div>
      )}

      {/* Backdrop untuk emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-[9999]"
          onClick={() => setShowEmojiPicker(false)}
        />
      )}
    </>
  );
};
