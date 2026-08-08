import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";

/**
 * Reads and compresses an image file to a lightweight JPEG data URL instantly.
 */
export function compressImageToDataUrl(file: File, maxWidth = 800, quality = 0.85): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", quality));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.onerror = () => resolve(event.target?.result as string);
    };
    reader.onerror = () => resolve("/crackers falls logo.webp");
  });
}

/**
 * Uploads an image file to Firebase Storage with a strict 1.5s timeout.
 * Fallback to instant local compressed DataURL if storage hangs or fails.
 */
export async function uploadMediaFile(file: File, folder: string = "products"): Promise<string> {
  // Always prepare compressed DataURL first as instant fallback
  const fallbackDataUrl = await compressImageToDataUrl(file);

  try {
    const cleanName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const timestamp = Date.now();
    const filePath = `${folder}/${timestamp}_${cleanName}`;
    const storageRef = ref(storage, filePath);

    // Timeout promise (1.5s) to prevent hanging forever
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Storage timeout")), 1500)
    );

    const uploadTask = uploadBytes(storageRef, file, { contentType: file.type }).then((snap) =>
      getDownloadURL(snap.ref)
    );

    return await Promise.race([uploadTask, timeoutPromise]);
  } catch (e) {
    console.warn("Using instant compressed DataURL fallback:", e);
    return fallbackDataUrl;
  }
}

/**
 * Deletes a file from Firebase Storage if given a valid storage URL.
 */
export async function deleteMediaFile(fileUrl: string): Promise<void> {
  try {
    if (!fileUrl || !fileUrl.includes("firebasestorage")) return;
    const fileRef = ref(storage, fileUrl);
    await deleteObject(fileRef);
  } catch (e) {
    console.warn("Storage deletion warning:", e);
  }
}
