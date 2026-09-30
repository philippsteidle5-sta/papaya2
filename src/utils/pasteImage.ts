import type React from "react";

/**
 * Utility to extract pasted image or video files from Clipboard events (Screenshots, Ctrl+V, copied media).
 */
export function extractImageFromPasteEvent(e: React.ClipboardEvent | ClipboardEvent): File | null {
  const clipboardData = (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
  if (!clipboardData) return null;

  // 1. Try clipboard items first (captures Snipping Tool, screenshots, or copied video/image files)
  if (clipboardData.items && clipboardData.items.length > 0) {
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type && (item.type.startsWith("image/") || item.type.startsWith("video/"))) {
        const file = item.getAsFile();
        if (file) return file;
      }
    }
  }

  // 2. Fallback to clipboard files list
  if (clipboardData.files && clipboardData.files.length > 0) {
    for (let i = 0; i < clipboardData.files.length; i++) {
      const file = clipboardData.files[i];
      if (file && file.type && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        return file;
      }
    }
  }

  return null;
}

/**
 * Utility to extract ALL pasted image or video files from Clipboard events.
 */
export function extractImagesFromPasteEvent(e: React.ClipboardEvent | ClipboardEvent): File[] {
  const clipboardData = (e as React.ClipboardEvent).clipboardData || (e as ClipboardEvent).clipboardData;
  if (!clipboardData) return [];

  const extracted: File[] = [];

  // 1. Try clipboard items
  if (clipboardData.items && clipboardData.items.length > 0) {
    for (let i = 0; i < clipboardData.items.length; i++) {
      const item = clipboardData.items[i];
      if (item.type && (item.type.startsWith("image/") || item.type.startsWith("video/"))) {
        const file = item.getAsFile();
        if (file) extracted.push(file);
      }
    }
  }

  // 2. Fallback or addition from clipboard files
  if (extracted.length === 0 && clipboardData.files && clipboardData.files.length > 0) {
    for (let i = 0; i < clipboardData.files.length; i++) {
      const file = clipboardData.files[i];
      if (file && file.type && (file.type.startsWith("image/") || file.type.startsWith("video/"))) {
        extracted.push(file);
      }
    }
  }

  return extracted;
}

