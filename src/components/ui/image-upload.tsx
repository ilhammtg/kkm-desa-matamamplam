"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

type UploadApiResponse =
  | { secure_url: string }
  | { error: string };

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      toast.error("File type not supported. Please upload an image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar. Maksimal 5MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("file", file);

      // IMPORTANT: Upload via API route (client-safe)
      const res = await fetch("/api/uploads/cloudinary", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = (await res.json()) as UploadApiResponse;

      if (!res.ok) {
        const msg = "error" in data ? data.error : "Upload failed";
        throw new Error(msg);
      }

      if (!("secure_url" in data) || !data.secure_url) {
        throw new Error("No secure_url returned from server");
      }

      onChange(data.secure_url);
      toast.success("Image uploaded!");
    } catch (err: any) {
      console.error("Upload failed:", err);
      toast.error(err?.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
      // reset input so the same file can be chosen again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange("");
  };

  const handlePick = (e: React.MouseEvent) => {
    e.preventDefault();
    fileInputRef.current?.click();
  };

  return (
    <div className="flex items-center gap-4">
      {/* Hidden Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
        disabled={loading || disabled}
      />

      {/* Preview or Upload Button */}
      {value ? (
        <div className="relative h-[200px] w-[300px] overflow-hidden rounded-md border border-input shadow-sm group">
          {/* pakai <img> biar aman untuk domain cloudinary tanpa config next/image */}
          <img
            src={value}
            alt="Upload preview"
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          <div className="absolute top-2 right-2">
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="h-8 w-8 opacity-80 hover:opacity-100"
              onClick={handleRemove}
              disabled={disabled || loading}
              aria-label="Remove image"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          disabled={disabled || loading}
          onClick={handlePick}
          className="h-[200px] w-[300px] flex flex-col gap-2 border-dashed border-2"
        >
          {loading ? (
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          ) : (
            <ImagePlus className="h-8 w-8 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {loading ? "Uploading..." : "Click to upload cover image"}
          </span>
        </Button>
      )}

      {/* Change button */}
      {value && (
        <div className="flex flex-col gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handlePick}
            disabled={disabled || loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <ImagePlus className="h-4 w-4 mr-2" />
            )}
            Change Image
          </Button>
        </div>
      )}
    </div>
  );
}
