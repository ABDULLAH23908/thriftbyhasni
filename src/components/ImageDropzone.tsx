import { useCallback, useRef, useState } from "react";
import { UploadCloud, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Every raster/vector format modern browsers can decode into an <img>.
const ACCEPTED_TYPES = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/gif",
  "image/bmp",
  "image/svg+xml",
  "image/avif",
  "image/x-icon",
  "image/vnd.microsoft.icon",
  "image/tiff",
  "image/apng",
  "image/heic",
  "image/heif",
];

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB upload cap
const OUTPUT_SIZE = 256; // px, square

/** Reads a file, draws it onto a square canvas, and returns a small compressed data URL. */
function fileToCompressedDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("That file couldn't be decoded as an image."));
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = OUTPUT_SIZE;
        canvas.height = OUTPUT_SIZE;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image processing isn't supported in this browser."));
          return;
        }
        // Center-crop to a square, then scale down.
        const side = Math.min(img.width, img.height);
        const sx = (img.width - side) / 2;
        const sy = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, OUTPUT_SIZE, OUTPUT_SIZE);
        try {
          resolve(canvas.toDataURL("image/webp", 0.85));
        } catch {
          // Some browsers can't encode webp — fall back to jpeg.
          resolve(canvas.toDataURL("image/jpeg", 0.85));
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function ImageDropzone({
  value,
  onChange,
}: {
  value?: string | undefined;
  onChange: (dataUrl: string | undefined) => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      const file = files?.[0];
      if (!file) return;
      setError(null);

      const isImage = file.type.startsWith("image/") || ACCEPTED_TYPES.includes(file.type);
      if (!isImage) {
        setError("Please upload an image file (PNG, JPG, WEBP, GIF, SVG, and more).");
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Image must be under 8MB.");
        return;
      }

      setLoading(true);
      try {
        const dataUrl = await fileToCompressedDataUrl(file);
        onChange(dataUrl);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't process that image.");
      } finally {
        setLoading(false);
      }
    },
    [onChange],
  );

  return (
    <div className="flex flex-col gap-2">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragActive(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
        }}
        role="button"
        tabIndex={0}
        aria-label="Upload avatar photo"
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-4 text-center transition-colors",
          dragActive
            ? "border-highlight bg-highlight/5"
            : "border-border hover:border-highlight/50",
        )}
      >
        {value ? (
          <div className="flex items-center gap-3">
            <img
              src={value}
              alt="Avatar preview"
              className="h-14 w-14 rounded-full border border-border object-cover"
            />
            <div className="flex flex-col items-start gap-1">
              <span className="text-xs text-muted-foreground">Looks good</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onChange(undefined);
                  if (inputRef.current) inputRef.current.value = "";
                }}
                className="flex items-center gap-1 text-xs font-semibold text-destructive"
              >
                <X className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        ) : loading ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <p className="text-xs text-muted-foreground">Processing image...</p>
          </>
        ) : (
          <>
            <UploadCloud className="h-6 w-6 text-muted-foreground" />
            <p className="text-xs text-muted-foreground">
              Drag &amp; drop a photo, or click to browse
            </p>
            <p className="text-[10px] text-muted-foreground/70">
              PNG, JPG, WEBP, GIF, BMP, SVG, AVIF, TIFF &mdash; up to 8MB
            </p>
          </>
        )}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept={[...ACCEPTED_TYPES, "image/*"].join(",")}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
