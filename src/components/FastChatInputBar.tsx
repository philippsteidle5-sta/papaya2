import React, { useState, useEffect } from "react";
import { ImageIcon, Sparkles, Send, Images, Clapperboard, Film } from "lucide-react";
import { AgentConfig } from "../types";
import { useTheme } from "../utils/themeStore";
import { isVideoUrl } from "../utils/mediaUtils";

interface FastChatInputBarProps {
  isLoading: boolean;
  isImageMode: boolean;
  setIsImageMode: (val: boolean) => void;
  selectedImage?: string | null;
  selectedImages?: string[];
  currentAgent: AgentConfig;
  onSendMessage: (textToSend?: string) => void;
  onImageSelect?: (file: File) => void;
  onImagesSelect?: (files: FileList | File[]) => void;
  extractImageFromPasteEvent?: (e: React.ClipboardEvent) => File | null;
  extractImagesFromPasteEvent?: (e: React.ClipboardEvent) => File[];
  externalInput?: string;
  onOpenGallery?: () => void;
  onOpenVeoVideoStudio?: () => void;
}

export const FastChatInputBar: React.FC<FastChatInputBarProps> = React.memo(({
  isLoading,
  isImageMode,
  setIsImageMode,
  selectedImage,
  selectedImages = [],
  currentAgent,
  onSendMessage,
  onImageSelect,
  onImagesSelect,
  extractImageFromPasteEvent,
  extractImagesFromPasteEvent,
  externalInput = "",
  onOpenGallery,
  onOpenVeoVideoStudio,
}) => {
  const { isModern } = useTheme();
  const [text, setText] = useState(externalInput);
  const [isFocused, setIsFocused] = useState(false);

  const hasSelectedImages = (selectedImages && selectedImages.length > 0) || Boolean(selectedImage);
  const selectedImagesCount = selectedImages && selectedImages.length > 0 ? selectedImages.length : (selectedImage ? 1 : 0);

  useEffect(() => {
    if (externalInput !== text) {
      setText(externalInput);
    }
  }, [externalInput]);

  const handleSend = () => {
    if (isLoading || (!text.trim() && !hasSelectedImages)) return;
    const msg = text;
    setText("");
    onSendMessage(msg);
  };

  const agentColor = currentAgent?.color || "#38bdf8";

  return (
    <div 
      className={`w-full max-w-3xl bg-[#111217] border rounded-2xl px-3 py-1.5 flex items-center gap-2 backdrop-blur-xl transition-all duration-200 shadow-xl shadow-black/40 ${
        isFocused 
          ? "border-zinc-600 ring-1 ring-zinc-700" 
          : "border-zinc-800 hover:border-zinc-750"
      }`}
    >
      {/* Hidden file input */}
      <input
        type="file"
        id="jarvis-image-upload"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            if (onImagesSelect) {
              onImagesSelect(e.target.files);
            } else if (onImageSelect && e.target.files[0]) {
              onImageSelect(e.target.files[0]);
            }
            e.target.value = "";
          }
        }}
      />

      {/* Attachment Button */}
      <button
        onClick={() => document.getElementById("jarvis-image-upload")?.click()}
        disabled={isLoading}
        title={isImageMode ? "Bildvorlage hochladen" : "Videos oder Fotos anhängen"}
        className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 relative ${
          hasSelectedImages
            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
        }`}
      >
        {selectedImages.some(isVideoUrl) ? (
          <Film className="w-4 h-4 text-amber-400" />
        ) : (
          <ImageIcon className="w-4 h-4" />
        )}
        {selectedImagesCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-zinc-100 text-zinc-950 text-[9px] font-bold flex items-center justify-center shadow">
            {selectedImagesCount}
          </span>
        )}
      </button>

      {/* Mode / Hologram Button */}
      <button
        onClick={() => setIsImageMode(!isImageMode)}
        disabled={isLoading}
        title="Visualizer Modus umschalten"
        className={`w-8 h-8 rounded-xl border flex items-center justify-center cursor-pointer transition duration-150 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 ${
          isImageMode
            ? "bg-zinc-800 border-zinc-600 text-zinc-100"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850"
        }`}
      >
        <Sparkles className="w-4 h-4" />
      </button>

      {onOpenGallery && (
        <button
          onClick={onOpenGallery}
          disabled={isLoading}
          title="Galerie öffnen"
          className="w-8 h-8 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 flex items-center justify-center cursor-pointer transition duration-150 disabled:opacity-40 flex-shrink-0"
        >
          <Images className="w-4 h-4" />
        </button>
      )}

      {onOpenVeoVideoStudio && (
        <button
          onClick={onOpenVeoVideoStudio}
          disabled={isLoading}
          title="Veo 3.1 Studio öffnen"
          className="w-8 h-8 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850 flex items-center justify-center cursor-pointer transition duration-150 disabled:opacity-40 flex-shrink-0"
        >
          <Clapperboard className="w-4 h-4" />
        </button>
      )}

      {/* Clean Text Input */}
      <input
        type="text"
        value={text}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleSend();
        }}
        onPaste={(e) => {
          if (extractImagesFromPasteEvent) {
            const files = extractImagesFromPasteEvent(e);
            if (files.length > 0) {
              e.preventDefault();
              if (onImagesSelect) {
                onImagesSelect(files);
              } else if (onImageSelect) {
                onImageSelect(files[0]);
              }
              return;
            }
          }
          if (extractImageFromPasteEvent) {
            const file = extractImageFromPasteEvent(e);
            if (file) {
              e.preventDefault();
              if (onImagesSelect) {
                onImagesSelect([file]);
              } else if (onImageSelect) {
                onImageSelect(file);
              }
            }
          }
        }}
        placeholder={
          isImageMode 
            ? "Beschreibung für visuelle Generierung..." 
            : `Nachricht an ${currentAgent.name}...`
        }
        className="flex-1 bg-transparent px-3 py-2 text-[14px] font-sans text-zinc-100 placeholder-zinc-500 focus:outline-none min-w-0"
      />

      {/* Send Button */}
      <button
        onClick={handleSend}
        disabled={isLoading || (!text.trim() && !hasSelectedImages)}
        className={`px-3.5 py-1.5 rounded-xl font-sans text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition duration-150 disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0 ${
          text.trim() || hasSelectedImages
            ? "bg-zinc-100 hover:bg-white text-zinc-950 shadow-sm active:scale-95"
            : "bg-zinc-800/80 text-zinc-500 border border-zinc-800"
        }`}
      >
        <Send className="w-3.5 h-3.5" />
        <span>Senden</span>
      </button>
    </div>
  );
});
