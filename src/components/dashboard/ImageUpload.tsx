"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { CloudUpload, X, ImageIcon } from "lucide-react";
import Image from "next/image";

interface ImageUploadProps {
  name: string;
  defaultValue?: string | null;
  className?: string;
  label?: string;
}

export function ImageUpload({ name, defaultValue, className = "", label = "اختر صورة" }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(defaultValue || null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("يرجى اختيار صورة صالحة");
      return;
    }
    
    // Set preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Sync file to the hidden input so FormData works natively
    if (inputRef.current) {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);
      inputRef.current.files = dataTransfer.files;
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPreview(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  // Global paste handler
  const handlePaste = useCallback((e: ClipboardEvent) => {
    if (e.clipboardData && e.clipboardData.files.length > 0) {
      // Check if we are currently focusing a text input
      const activeElement = document.activeElement;
      const isTextInput = activeElement?.tagName === "INPUT" && (activeElement as HTMLInputElement).type === "text";
      const isTextarea = activeElement?.tagName === "TEXTAREA";
      
      if (!isTextInput && !isTextarea) {
        e.preventDefault();
        handleFile(e.clipboardData.files[0]);
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("paste", handlePaste);
    return () => {
      window.removeEventListener("paste", handlePaste);
    };
  }, [handlePaste]);

  return (
    <div className={className}>
      {label && <label className="block text-sm font-bold text-surface-950 mb-2">{label}</label>}
      
      <div 
        ref={containerRef}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative w-full border-2 border-dashed rounded-[24px] p-6 text-center cursor-pointer transition-colors ${
          isDragging 
            ? "border-primary-500 bg-primary-50" 
            : "border-primary-200 bg-surface-50 hover:bg-primary-50"
        }`}
      >
        <input 
          type="file" 
          name={name} 
          ref={inputRef} 
          onChange={onChange} 
          accept="image/*" 
          className="hidden" 
        />

        {preview ? (
          <div className="relative w-full h-48 group rounded-[24px] overflow-hidden border-2 border-surface-200 bg-white">
            <Image src={preview} alt="Preview" fill className="object-contain" unoptimized />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center ">
              <span className="text-white font-bold text-sm">تغيير الصورة</span>
            </div>
            <button 
              onClick={handleRemove}
              className="absolute top-3 end-3 w-10 h-10 bg-error-600 hover:bg-error-700 text-white rounded-[24px] flex items-center justify-center transition-colors z-10"
              title="إزالة"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center py-6">
            <div className={`w-16 h-16 rounded-[24px] flex items-center justify-center mx-auto mb-4 border-2 transition-colors ${isDragging ? "bg-primary-500 text-white border-primary-600" : "bg-primary-50 text-primary-600 border-primary-100"}`}>
              <CloudUpload className="w-8 h-8" />
            </div>
            <p className="font-black text-surface-950 mb-2">اسحب وأفلت الصورة هنا</p>
            <p className="text-sm font-bold text-surface-500">أو اضغط للاختيار، أو قم باللصق (Ctrl+V)</p>
          </div>
        )}
      </div>
    </div>
  );
}
