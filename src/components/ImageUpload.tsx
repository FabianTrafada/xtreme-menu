"use client";

import { useRef, useState, useCallback } from "react";
import { useUploadThing } from "@/lib/uploadthing";
import Image from "next/image";
import Cropper from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { motion, AnimatePresence } from "framer-motion";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  aspect?: number;
  onAspectChange?: (aspect: number) => void;
}

const IconCamera = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" /><circle cx="12" cy="13" r="3" /></svg>
);

const IconX = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
);

const IconCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
);

const IconCrop = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14" /><path d="M18 22V8a2 2 0 0 0-2-2H2" /></svg>
);

const ASPECT_RATIOS = [
  { label: "1:1", value: 1 },
  { label: "4:3", value: 4 / 3 },
  { label: "16:9", value: 16 / 9 },
];

export default function ImageUpload({ value, onChange, aspect = 16 / 9, onAspectChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  // Cropper State
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const { startUpload } = useUploadThing("imageUploader", {
    onUploadProgress: (p) => setProgress(p),
    onClientUploadComplete: (res) => {
      console.log("[ImageUpload] Upload complete:", JSON.stringify(res));
      // Note: Don't call onChange/setIsUploading here — handleCropSave handles everything
      // after startUpload resolves. Doing it here too causes a race condition.
    },
    onUploadError: (err) => {
      console.error("[ImageUpload] Upload error:", err);
      setError(err.message);
      setIsUploading(false);
      setProgress(0);
      setTimeout(() => setError(""), 3000);
    },
  });

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset cropper state for the new image
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);

    const reader = new FileReader();
    reader.addEventListener("load", () => {
      setImageToCrop(reader.result as string);
    });
    reader.readAsDataURL(file);

    // Reset input so the same file can be re-selected
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleEditExisting = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (value) {
      // Reset cropper state for clean re-edit
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setImageToCrop(value);
    }
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    // Capture current values before any state changes
    const currentImage = imageToCrop;
    const currentCrop = croppedAreaPixels;

    try {
      setIsUploading(true);
      setImageToCrop(null);

      const croppedImageBlob = await getCroppedImg(currentImage, currentCrop);
      if (!croppedImageBlob) throw new Error("Could not crop image");

      const file = new File([croppedImageBlob], `cropped-${Date.now()}.jpg`, { type: "image/jpeg" });

      const res = await startUpload([file]);
      console.log("[ImageUpload] startUpload result:", JSON.stringify(res));

      if (res?.[0]) {
        const uploadedUrl = (res[0] as any).ufsUrl || (res[0] as any).url || (res[0] as any).serverData?.url;
        console.log("[ImageUpload] Resolved URL:", uploadedUrl);
        if (uploadedUrl) {
          onChange(uploadedUrl);
        }
      }

      setIsUploading(false);
      setProgress(0);
    } catch (e: any) {
      console.error("[ImageUpload] Crop/Upload error:", e);
      setError(e.message || "Failed to crop and upload image");
      setIsUploading(false);
      setProgress(0);
    }
  };

  const hasImage = value && value.startsWith("http");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Item Image</label>
        {hasImage && (
          <div className="flex gap-2">
            {ASPECT_RATIOS.map((ratio) => (
              <button
                key={ratio.label}
                type="button"
                onClick={() => onAspectChange?.(ratio.value)}
                className={`text-[9px] font-mono px-2 py-1 border transition-all ${Math.abs(aspect - ratio.value) < 0.01 ? "bg-primary text-black border-primary" : "text-white/40 border-white/5 hover:border-white/20"}`}
              >
                {ratio.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Preview / Upload Area */}
      <div
        className={`
          relative w-full overflow-hidden border transition-all group
          ${isUploading ? "border-primary/60 bg-primary/5" : hasImage ? "border-white/10" : "bg-[#0e0e0e] border-white/10 hover:border-primary/40"}
        `}
        style={{ aspectRatio: aspect }}
      >
        {hasImage && !isUploading ? (
          <>
            <Image src={value} alt="Preview" fill className="object-cover transition-transform duration-700 group-hover:scale-105" />

            {/* Overlay - visible on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-6 backdrop-blur-[2px]">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 text-white/70 hover:text-primary transition-all hover:scale-110"
              >
                <div className="p-4 bg-white/10 rounded-full border border-white/10 shadow-2xl">
                  <IconCamera />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Replace</span>
              </button>

              <div className="w-[1px] h-12 bg-white/10 self-center" />

              <button
                type="button"
                onClick={handleEditExisting}
                className="flex flex-col items-center gap-2 text-white/70 hover:text-primary transition-all hover:scale-110"
              >
                <div className="p-4 bg-white/10 rounded-full border border-white/10 shadow-2xl">
                  <IconCrop />
                </div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase">Adjust</span>
              </button>
            </div>
          </>
        ) : isUploading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-[#0a0a0a]">
            {/* Progress bar */}
            <div className="w-1/2 h-[2px] bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-primary"
              />
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-primary animate-pulse">Uploading {progress}%</span>
          </div>
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white/20 group cursor-pointer">
            <div className="p-3 border border-white/5 rounded-full group-hover:border-primary/40 group-hover:text-primary transition-colors">
              <IconCamera />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em] uppercase group-hover:text-white/40 transition-colors">Tap to upload</span>
          </div>
        )}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-[10px] font-bold tracking-widest uppercase text-red-400 mt-2">
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* URL manual input */}
      <input
        type="url"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3.5 bg-[#0e0e0e] border border-white/10 focus:border-primary/60 outline-none text-xs font-mono transition-colors placeholder:text-white/10"
        placeholder="OR PASTE IMAGE URL..."
      />

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Cropper Modal */}
      <AnimatePresence>
        {imageToCrop && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
          >
            <div className="flex items-center justify-between px-6 h-16 border-b border-white/5 bg-background">
              <h3 className="font-display text-sm tracking-[0.2em] uppercase text-white/60">Adjust Image</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => setImageToCrop(null)}
                  className="p-2 text-white/40 hover:text-white transition-colors"
                >
                  <IconX />
                </button>
                <button
                  onClick={handleCropSave}
                  className="p-2 text-primary hover:scale-110 transition-transform"
                >
                  <IconCheck />
                </button>
              </div>
            </div>

            <div className="relative flex-1 bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
                classes={{
                  containerClassName: "bg-black",
                  mediaClassName: "max-h-full",
                }}
              />
            </div>

            <div className="p-8 bg-background border-t border-white/5 space-y-8">
              <div className="flex justify-center gap-4">
                {ASPECT_RATIOS.map((ratio) => (
                  <button
                    key={ratio.label}
                    type="button"
                    onClick={() => onAspectChange?.(ratio.value)}
                    className={`px-6 py-2 border font-mono text-xs transition-all ${Math.abs(aspect - ratio.value) < 0.01 ? "bg-primary text-black border-primary" : "text-white/40 border-white/10 hover:border-white/30"}`}
                  >
                    {ratio.label}
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/40">Zoom Level</span>
                  <span className="text-[10px] font-mono text-primary">{zoom.toFixed(1)}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-1 bg-white/5 rounded-full appearance-none cursor-pointer accent-primary"
                />
              </div>

              <button
                onClick={handleCropSave}
                className="w-full py-4 bg-primary text-black font-display text-sm font-bold tracking-[0.2em] uppercase active:scale-[0.98] transition-all"
              >
                Apply & Upload
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
