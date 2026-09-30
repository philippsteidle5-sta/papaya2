/**
 * Automatically resizes and compresses image files or base64 Data URLs
 * to ensure ultra-fast upload speeds, smooth rendering, and prevent memory issues.
 */
export async function compressImage(
  source: File | string,
  maxDimension = 1280,
  quality = 0.85
): Promise<string> {
  return new Promise((resolve) => {
    if (!source) {
      resolve("");
      return;
    }

    const img = new Image();

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(typeof source === "string" ? source : "");
        return;
      }

      // Smooth downscaling quality
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed JPEG data URL
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      // Fallback
      if (typeof source === "string") {
        resolve(source);
      } else {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || "");
        reader.readAsDataURL(source);
      }
    };

    if (typeof source === "string") {
      img.src = source;
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        img.src = (reader.result as string) || "";
      };
      reader.readAsDataURL(source);
    }
  });
}

/**
 * Compresses multiple images concurrently.
 */
export async function compressImages(
  sources: (File | string)[],
  maxDimension = 1280,
  quality = 0.85
): Promise<string[]> {
  if (!sources || sources.length === 0) return [];
  const results = await Promise.all(
    sources.map((s) => compressImage(s, maxDimension, quality))
  );
  return results.filter((url) => typeof url === "string" && url.length > 0);
}

