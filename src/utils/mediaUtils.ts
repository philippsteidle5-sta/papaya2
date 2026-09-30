/**
 * Helper utilities for multimodal media (images and videos).
 */

export function isVideoUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("data:video/") ||
    /\.(mp4|webm|mov|mkv|ogg|avi|quicktime)($|\?)/i.test(url)
  );
}

export function isImageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  return (
    url.startsWith("data:image/") ||
    /\.(png|jpe?g|webp|gif|svg|bmp)($|\?)/i.test(url)
  );
}

export function getMediaFileName(url: string, fallbackPrefix = "Media"): string {
  if (!url) return fallbackPrefix;
  if (url.startsWith("data:")) {
    const isVid = isVideoUrl(url);
    return isVid ? "Video-Clip" : "Foto";
  }
  try {
    const cleanUrl = url.split("?")[0];
    const name = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);
    return name || fallbackPrefix;
  } catch {
    return fallbackPrefix;
  }
}
