"use client";

import { ImageUpload } from "@/components/ui/image-upload";
import { Button } from "@/components/ui/button";
import { Plus, Trash, X } from "lucide-react";

interface GalleryUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export function GalleryUpload({ value, onChange, disabled }: GalleryUploadProps) {
  const handleAdd = (url: string) => {
    onChange([...value, url]);
  };

  const handleRemove = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {value.map((url, index) => (
          <div key={index} className="relative aspect-square rounded-xl overflow-hidden border">
            <div className="absolute top-2 right-2 z-10">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="icon"
                className="h-6 w-6"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <img
              src={url}
              alt={`Gallery image ${index + 1}`}
              className="object-cover w-full h-full"
            />
          </div>
        ))}
        
        {/* Helper Upload Button - Wraps ImageUpload but we only want the upload function... 
            Actually, ImageUpload component is designed to show preview. 
            We can trick it or just use a new "Add" block that contains an ImageUpload.
        */}
        <div className="relative aspect-square flex items-center justify-center rounded-xl border border-dashed hover:bg-muted/50 transition">
             <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden">
                {/* 
                   We will use a fresh ImageUpload that resets itself after upload. 
                   But ImageUpload holds its own state. 
                   Better implementation: Just render ImageUpload with empty value, 
                   and when it calls onChange, we add it to our list and reset it.
                */}
                <ImageUpload 
                    value=""
                    onChange={(url) => {
                        if(url) handleAdd(url);
                    }}
                    disabled={disabled}
                />
             </div>
             <div className="pointer-events-none flex flex-col items-center gap-2 text-muted-foreground">
                <Plus className="h-8 w-8" />
                <span className="text-xs">Add Image</span>
             </div>
        </div>
      </div>
      <div className="text-xs text-muted-foreground p-2 bg-muted/30 rounded-md">
        Tip: You can insert these images into the content area if needed, or they will be displayed as a gallery.
      </div>
    </div>
  );
}
