"use client";

import { useRef, useState } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
}

const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      if (res?.[0]) {
        onChange(res[0].url);
      }
      setIsUploading(false);
      setProgress(0);
    },
    onUploadError: (err) => {
      setError(err.message);
      setIsUploading(false);
      setProgress(0);
      setTimeout(() => setError(""), 3000);
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setError("");
    await startUpload([file]);
    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const hasImage = value && value.startsWith("http");

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-muted-foreground">Image</label>

      {/* Preview / Upload Area */}
      <div
        onClick={() => !isUploading && fileInputRef.current?.click()}
        className={`
          relative w-full aspect-[16/9] rounded-xl overflow-hidden border-2 border-dashed cursor-pointer transition-all
          ${isUploading ? "border-primary/60 bg-primary/5" : hasImage ? "border-transparent" : "border-border hover:border-primary/40 hover:bg-secondary/30"}
        `}
      >
        {hasImage && !isUploading ? (
          <>
            <Image src={value} alt="Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <IconCamera />
              <span className="text-sm font-medium text-white">Change Image</span>
            </div>
          </>
        ) : isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            {/* Progress bar */}
            <div className="w-2/3 h-1.5 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">Uploading... {progress}%</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
            <IconCamera />
            <span className="text-xs">Tap to upload image</span>
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}

      {/* URL manual input */}
      <input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border focus:border-primary outline-none text-sm"
        placeholder="or paste image URL..."
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
