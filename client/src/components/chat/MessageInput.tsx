import { useRef, useState, type KeyboardEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { useTranslation } from 'react-i18next';
import { useThemeStore } from '@/stores/themeStore';
import { LIMITS } from '@geomhls/shared';

interface Props {
  onSend: (text: string) => void;
  onTyping: () => void;
}

export function MessageInput({ onSend, onTyping }: Props) {
  const [text, setText] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { t } = useTranslation();
  const theme = useThemeStore((s) => s.theme);

  const send = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value.slice(0, LIMITS.MESSAGE_MAX_LENGTH));
    setText('');
    setShowPicker(false);
  };

  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const addEmoji = (e: { native: string }) => {
    setText((prev) => prev + e.native);
    inputRef.current?.focus();
  };

  return (
    <div className="relative">
      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="absolute bottom-full left-0 right-0 mb-3 flex justify-center px-4"
          >
            <Picker
              data={data}
              onEmojiSelect={addEmoji}
              theme={theme}
              previewPosition="none"
              skinTonePosition="none"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass-strong flex items-end gap-2 rounded-[28px] p-2 safe-bottom">
        <button
          type="button"
          onClick={() => setShowPicker((v) => !v)}
          className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-surface-2 text-xl"
          aria-label="Emoji"
        >
          😊
        </button>
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            onTyping();
          }}
          onKeyDown={onKey}
          rows={1}
          placeholder={t('chat.placeholder')}
          maxLength={LIMITS.MESSAGE_MAX_LENGTH}
          className="flex-1 resize-none bg-transparent outline-none px-2 py-2.5 text-[15px] placeholder:text-text-muted max-h-32"
        />
        <button
          type="button"
          onClick={send}
          disabled={!text.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-full gradient-brand text-white shadow-lg shadow-brand/30 disabled:opacity-40 transition-all hover:scale-105 active:scale-95"
          aria-label="Send"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13" />
            <path d="M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
