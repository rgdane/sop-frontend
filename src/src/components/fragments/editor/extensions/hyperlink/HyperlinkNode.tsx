import { useState, useEffect, useRef } from 'react';
import { Modal, Input, Button } from 'antd';

interface LinkEditModalProps {
    isOpen: boolean;
    url: string;
    text: string;
    onSave: (url: string, text: string) => void;
    onRemove: () => void;
    onClose: () => void;
}

export function LinkEditModal({
    isOpen,
    url: initialUrl,
    text: initialText,
    onSave,
    onRemove,
    onClose,
}: LinkEditModalProps) {
    const [url, setUrl] = useState(initialUrl);
    const [text, setText] = useState(initialText);
    const urlInputRef = useRef<any>(null);

    useEffect(() => {
        if (isOpen) {
            setUrl(initialUrl);
            setText(initialText);
            setTimeout(() => urlInputRef.current?.focus(), 100);
        }
    }, [isOpen, initialUrl, initialText]);

    const handleSave = () => {
        if (url.trim()) {
            onSave(url.trim(), text.trim() || initialText);
        }
    };

    return (
        <Modal
            title="Edit Link"
            open={isOpen}
            onCancel={onClose}
            footer={[
                <Button key="remove" danger onClick={onRemove}>
                    Remove Link
                </Button>,
                <Button key="cancel" onClick={onClose}>
                    Cancel
                </Button>,
                <Button
                    key="save"
                    type="primary"
                    onClick={handleSave}
                    disabled={!url.trim()}
                >
                    Save
                </Button>,
            ]}
            destroyOnHidden
        >
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Text
                    </label>
                    <Input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        onPressEnter={handleSave}
                        placeholder="Enter link text"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        URL
                    </label>
                    <Input
                        ref={urlInputRef}
                        type="url"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        onPressEnter={handleSave}
                        placeholder="https://example.com"
                    />
                </div>
            </div>
        </Modal>
    );
}
